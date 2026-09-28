import { chatBody, chatOffset, chatReply, chatSession, validChatId } from "@/lib/conversation-server";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const session = await chatSession();
  if (!session) return chatReply({ message: "Sign in with an active community account to open saved conversations." }, 401);
  const offset = chatOffset(request);
  if (offset === null) return chatReply({ message: "Invalid page." }, 400);
  const { data, error } = await session.client.from("conversations").select("id,title,memory_enabled,created_at").order("created_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + 30);
  return error ? chatReply({ message: "Conversation storage is unavailable. Try again later." }, 503) : chatReply({ conversations: data.slice(0, 30), hasMore: data.length > 30 });
}
export async function POST(request: Request) {
  const body = await chatBody(request);
  if (!body || !validChatId(body.id)) return chatReply({ message: "Invalid request." }, 400);
  const session = await chatSession();
  if (!session) return chatReply({ message: "Sign in with an active community account." }, 401);
  const { data, error } = await session.client.from("conversations").insert({ id: body.id, community_id: session.project.communityId }).select("id,title,memory_enabled,created_at").single();
  if (error?.code === "23505") {
    const existing = await session.client.from("conversations").select("id,title,memory_enabled,created_at").eq("id", body.id).single();
    if (!existing.error) return chatReply({ conversation: existing.data });
  }
  return error ? chatReply({ message: "Could not create conversation. Retry safely." }, 503) : chatReply({ conversation: data }, 201);
}
export async function PATCH(request: Request) {
  const body = await chatBody(request);
  if (!body || !validChatId(body.id) || (typeof body.memory_enabled !== "boolean" && typeof body.title !== "string")) return chatReply({ message: "Invalid request." }, 400);
  const update: { title?: string; memory_enabled?: boolean } = {};
  if (typeof body.title === "string") {
    if (!body.title.trim() || body.title.trim().length > 150) return chatReply({ message: "Use a title of 1–150 characters." }, 400);
    update.title = body.title.trim();
  }
  if (typeof body.memory_enabled === "boolean") update.memory_enabled = body.memory_enabled;
  const session = await chatSession();
  if (!session) return chatReply({ message: "Sign in with an active community account." }, 401);
  const { data, error } = await session.client.from("conversations").update(update).eq("id", body.id).select("id,title,memory_enabled,created_at").maybeSingle();
  return error ? chatReply({ message: "Could not update conversation." }, 503) : data ? chatReply({ conversation: data }) : chatReply({ message: "Conversation not found." }, 404);
}
export async function DELETE(request: Request) {
  const body = await chatBody(request);
  if (!body || !validChatId(body.id)) return chatReply({ message: "Invalid request." }, 400);
  const session = await chatSession();
  if (!session) return chatReply({ message: "Sign in with an active community account." }, 401);
  const { error } = await session.client.from("conversations").delete().eq("id", body.id);
  return error ? chatReply({ message: "Could not delete conversation. Please retry." }, 503) : chatReply({ deleted: true });
}
