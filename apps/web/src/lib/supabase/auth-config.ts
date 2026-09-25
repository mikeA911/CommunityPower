import "server-only";

export type AuthRealm = "community" | "control";

export type AuthProject = {
  realm: AuthRealm;
  communityId: string;
  projectUrl: string;
  publishableKey: string;
};

export function isAuthRealm(value: unknown): value is AuthRealm {
  return value === "community" || value === "control";
}

export function getAuthProject(realm: AuthRealm): AuthProject | null {
  const prefix = realm === "control" ? "SUPABASE_CONTROL" : "SUPABASE_COMMUNITY";
  const projectUrl = process.env[`${prefix}_URL`]?.trim() ?? "";
  const publishableKey = process.env[`${prefix}_PUBLISHABLE_KEY`]?.trim() ?? "";
  if (!projectUrl.startsWith("https://") || !publishableKey) return null;
  return {
    realm,
    communityId: realm === "control" ? "sandz-control" : process.env.SUPABASE_COMMUNITY_ID?.trim() || "pilot",
    projectUrl: projectUrl.replace(/\/$/, ""),
    publishableKey,
  };
}

export function getPasswordResetRedirect(requestUrl: string, realm: AuthRealm): string | null {
  const candidate = [
    process.env.PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ].find(value => value?.trim())?.trim();
  let origin = candidate ?? (process.env.NODE_ENV === "development" ? new URL(requestUrl).origin : "");
  if (!origin) return null;
  if (!/^https?:\/\//i.test(origin)) origin = `https://${origin}`;
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("realm", realm);
  callback.searchParams.set("next", "/auth/update-password");
  return callback.toString();
}
