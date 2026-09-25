import { answerFromPreview, readPreviewGuide } from "@/lib/preview-help";

export async function POST(request: Request) {
  // This endpoint has no models, credentials, persistence or protected information.
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Message required" }, { status: 400 });
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4096) { await reader.cancel(); return Response.json({ error: "Message too long" }, { status: 413 }); }
    chunks.push(value);
  }
  let input: unknown;
  try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  if (!input || typeof input !== "object" || !("message" in input) || typeof input.message !== "string" || !input.message.trim() || input.message.length > 500) return Response.json({ error: "Use a message of 1–500 characters" }, { status: 400 });
  const guide = await readPreviewGuide();
  return Response.json(answerFromPreview(input.message, guide.content), { headers: { "Cache-Control": "no-store" } });
}
