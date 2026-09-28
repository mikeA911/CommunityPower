import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getAuthProject } from "./supabase/auth-config";
import { createAuthClient } from "./supabase/server";

export const chatReply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
export const validChatId = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export async function chatSession() {
  const project = getAuthProject("community");
  if (!project) return null;
  const client = await createAuthClient(project);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: allowed, error: scopeError } = await client.rpc("owns_active_chat_scope", { scope_id: project.communityId });
  if (scopeError || !allowed) return null;
  return { client, user, project };
}
export function chatWriter(projectUrl: string) {
  const key = process.env.SUPABASE_COMMUNITY_SERVICE_ROLE_KEY;
  return key ? createClient(projectUrl, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
export async function chatBody(request: Request): Promise<Record<string, unknown> | null> {
  if (request.headers.get("origin") !== new URL(request.url).origin || !request.headers.get("content-type")?.startsWith("application/json")) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 20000) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch { return null; }
}
export function chatOffset(request: Request) {
  const raw = new URL(request.url).searchParams.get("offset") || "0";
  return /^\d{1,7}$/.test(raw) ? Number(raw) : null;
}
