import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value || value.includes("YOUR_") || value.endsWith(".invalid")) throw new Error(`Set ${name} in apps/web/.env.local`);
  return value;
}

function adminClient(urlName, keyName) {
  return createClient(required(urlName), required(keyName), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function upsertUser(client, email, role, communityId) {
  const normalized = email.toLowerCase();
  let page = 1;
  let user;
  do {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    user = data.users.find(candidate => candidate.email?.toLowerCase() === normalized);
    if (user || data.users.length < 1000) break;
    page += 1;
  } while (page <= 10);

  const appMetadata = { ...(user?.app_metadata ?? {}), role, ...(communityId ? { community_id: communityId } : {}) };
  if (user) {
    const { error } = await client.auth.admin.updateUserById(user.id, { app_metadata: appMetadata });
    if (error) throw error;
    return { result: "updated", userId: user.id };
  }
  const password = randomBytes(36).toString("base64url");
  const { data, error } = await client.auth.admin.createUser({ email: normalized, password, email_confirm: true, app_metadata: appMetadata });
  if (error) throw error;
  if (!data.user) throw new Error(`Supabase did not return a user for ${role}`);
  return { result: "created", userId: data.user.id };
}

async function assignCommunityRole(client, userId, role, communityId) {
  const statements = [
    client.from("community_config").upsert({ id: communityId, display_name: "Pilot community" }),
    client.from("profiles").upsert({ user_id: userId }),
    client.from("memberships").upsert({ user_id: userId, community_id: communityId, status: "active", updated_at: new Date().toISOString() }),
    client.from("role_assignments").upsert({ user_id: userId, role, revoked_at: null }),
  ];
  for (const statement of statements) {
    const { error } = await statement;
    if (error) throw error;
  }
}

async function assignPlatformRole(client, userId, role) {
  for (const statement of [
    client.from("platform_profiles").upsert({ user_id: userId }),
    client.from("platform_role_assignments").upsert({ user_id: userId, role, revoked_at: null }),
  ]) {
    const { error } = await statement;
    if (error) throw error;
  }
}

const control = adminClient("SUPABASE_CONTROL_URL", "SUPABASE_CONTROL_SERVICE_ROLE_KEY");
const community = adminClient("SUPABASE_COMMUNITY_URL", "SUPABASE_COMMUNITY_SERVICE_ROLE_KEY");
const communityId = process.env.SUPABASE_COMMUNITY_ID?.trim() || "pilot";
const operations = [
  [control, required("BOOTSTRAP_PLATFORM_ADMIN_EMAIL"), "platform_admin", undefined],
  [community, required("BOOTSTRAP_COMMUNITY_ADMIN_EMAIL"), "community_admin", communityId],
  [community, required("BOOTSTRAP_CONSUMER_EMAIL"), "consumer", communityId],
];

for (const [client, email, role, scope] of operations) {
  const { result, userId } = await upsertUser(client, email, role, scope);
  if (role === "platform_admin") await assignPlatformRole(client, userId, role);
  else await assignCommunityRole(client, userId, role, scope);
  console.log(`${result}: ${role}`);
}
console.log("Bootstrap complete. Each person can now use Forgot password in the matching workspace.");
