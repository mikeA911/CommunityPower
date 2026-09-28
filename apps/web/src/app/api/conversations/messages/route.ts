import { chatBody, chatOffset, chatReply, chatSession, chatWriter, validChatId } from "@/lib/conversation-server";
import { answerFromPreview, navigationAnswer, readPreviewGuide, readPreviewNavigation } from "@/lib/preview-help";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("conversation");
  const offset = chatOffset(request);
  if (!validChatId(id) || offset === null) return chatReply({ message: "Invalid conversation or page." }, 400);
  const session = await chatSession();
  if (!session) return chatReply({ message: "Sign in with an active community account." }, 401);
  const parent = await session.client.from("conversations").select("id,title,memory_enabled,created_at").eq("id", id).maybeSingle();
  if (parent.error) return chatReply({ message: "Conversation storage is unavailable." }, 503);
  if (!parent.data) return chatReply({ message: "Conversation not found." }, 404);
  const { data, error } = await session.client.from("conversation_messages").select("id,role,content,created_at").eq("conversation_id", id).order("created_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + 50);
  return error ? chatReply({ message: "Could not load messages." }, 503) : chatReply({ conversation: parent.data, messages: data.slice(0, 50).reverse(), hasMore: data.length > 50 });
}
export async function POST(request: Request) {
  const body = await chatBody(request);
  if (!body || !validChatId(body.conversation) || !validChatId(body.requestId) || typeof body.message !== "string" || !body.message.trim() || body.message.length > 500) return chatReply({ message: "Use a question of 1–500 characters." }, 400);
  const session = await chatSession();
  if (!session) return chatReply({ message: "Sign in with an active community account." }, 401);
  const parent = await session.client.from("conversations").select("id").eq("id", body.conversation).maybeSingle();
  if (parent.error) return chatReply({ message: "Conversation storage is unavailable." }, 503);
  if (!parent.data) return chatReply({ message: "Conversation not found." }, 404);
  const writer = chatWriter(session.project.projectUrl);
  if (!writer) return chatReply({ message: "Saving CP replies is not configured yet." }, 503);
  try {
    const guide = await readPreviewGuide();
    const answer = navigationAnswer(body.message, await readPreviewNavigation()) ?? answerFromPreview(body.message, guide.content);
    const text = `${answer.text.slice(0, 3800)}\n\nScripted preview help · wiki v${guide.version} · ${answer.source}`;
    const { data, error } = await writer.rpc("save_conversation_turn", { owner_id: session.user.id, scope_id: session.project.communityId, chat_id: body.conversation, request_id: body.requestId, question: body.message.trim(), answer: text });
    return error || !data ? chatReply({ message: "Could not save this exchange. Check your connection and retry; the same request will not duplicate messages." }, 503) : chatReply({ saved: true });
  } catch { return chatReply({ message: "Unable to confirm this exchange was saved. Retry safely or reopen history to check." }, 503); }
}
