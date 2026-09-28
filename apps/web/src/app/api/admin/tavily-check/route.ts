import { chatReply, chatSession } from "@/lib/conversation-server";
import { checkTavily } from "@/lib/tavily-check";
export const runtime = "nodejs";
export const maxDuration = 30;
// A diagnostic cooldown only, not a distributed production search quota.
let nextCheck = 0;
export async function POST(request: Request) {
  // Next's internal URL can use localhost; compare against the incoming host.
  const expectedOrigin = `${new URL(request.url).protocol}//${request.headers.get("host")}`;
  if (request.headers.get("origin") !== expectedOrigin) return chatReply({ ok: false, message: "Invalid request origin." }, 403);
  const session = await chatSession();
  if (!session) return chatReply({ ok: false, message: "Sign in with an active community administrator account." }, 401);
  const { data, error } = await session.client.from("role_assignments").select("role").eq("user_id", session.user.id).eq("role", "community_admin").is("revoked_at", null).maybeSingle();
  if (error || !data) return chatReply({ ok: false, message: "Only an active community administrator can run this check." }, 403);
  if (Date.now() < nextCheck) return chatReply({ ok: false, message: "Please wait one minute before running another check." }, 429);
  nextCheck = Date.now() + 60000;
  // Never read client input, bills or chat history. Never return provider bodies or keys.
  const result = await checkTavily(process.env.TAVILY_API_KEY);
  return chatReply(result, result.ok ? 200 : 503);
}
