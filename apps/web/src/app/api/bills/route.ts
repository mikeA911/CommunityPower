import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { billSession, extractBill } from "@/lib/bill-server";
import { imageMime, normalizeAccount, ownershipCheck, parseBill } from "@/lib/bills";

export const runtime = "nodejs";
export const maxDuration = 60;
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
function sameOrigin(request: Request) { return request.headers.get("origin") === new URL(request.url).origin; }
export async function GET(request: Request) {
  const session = await billSession();
  if (!session) return reply({ message: "Sign in with an active consumer account." }, 401);
  const imageId = new URL(request.url).searchParams.get("image");
  if (imageId) {
    const { data: bill } = await session.client.from("consumer_bills").select("object_path").eq("id", imageId).eq("user_id", session.user.id).maybeSingle();
    if (!bill) return reply({ message: "Bill not found." }, 404);
    const { data, error } = await session.client.storage.from("consumer-bills").download(bill.object_path);
    if (error || !data) return reply({ message: "Image unavailable." }, 404);
    return new Response(data, { headers: { "Content-Type": data.type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
  }
  const { data, error } = await session.client.from("consumer_bills").select("id,extraction,reviewed,status,ownership,created_at").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(500);
  return error ? reply({ message: "Bill storage is not available yet." }, 503) : reply({ bills: data });
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ message: "Invalid request origin." }, 403);
  const session = await billSession();
  if (!session) return reply({ message: "Sign in with an active consumer account." }, 401);
  if (process.env.BILL_UPLOADS_ENABLED !== "true" || !process.env.OPENAI_API_KEY) return reply({ message: "Bill uploads are not enabled yet." }, 503);
  const size = Number(request.headers.get("content-length"));
  if (!size || size > 4_000_000) return reply({ message: "Choose a JPEG or PNG under 3 MB." }, 413);
  let form: FormData;
  try { form = await request.formData(); } catch { return reply({ message: "Invalid upload." }, 400); }
  const file = form.get("bill");
  if (!(file instanceof File) || !file.size || file.size > 3_000_000 || form.get("consent") !== "yes") return reply({ message: "Choose an image under 3 MB and consent to processing." }, 400);
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = imageMime(bytes);
  if (!mime || file.type !== mime) return reply({ message: "Only JPEG and PNG bill images are supported." }, 400);
  const hash = createHash("sha256").update(bytes).digest("hex");
  const { data: duplicate, error: lookupError } = await session.client.from("consumer_bills").select("id").eq("user_id", session.user.id).eq("sha256", hash).maybeSingle();
  if (lookupError) return reply({ message: "Bill storage is not available yet." }, 503);
  if (duplicate) return reply({ message: "This image is already in your bills. Review the existing entry." }, 409);
  const { data: allowed, error: quotaError } = await session.client.rpc("consume_bill_read");
  if (quotaError || !allowed) return reply({ message: "Bill reading limit reached or unavailable. Try again later." }, 429);
  let extraction;
  try { extraction = await extractBill(bytes, mime); } catch { return reply({ message: "Could not read this bill. Check that it is clear and complete, or try again later." }, 422); }
  const id = randomUUID();
  const path = `${session.user.id}/${id}.${mime === "image/png" ? "png" : "jpg"}`;
  const { error: uploadError } = await session.client.storage.from("consumer-bills").upload(path, bytes, { contentType: mime, upsert: false });
  if (uploadError) return reply({ message: "The image could not be saved. Please retry." }, 503);
  const { error } = await session.client.from("consumer_bills").insert({ id, user_id: session.user.id, object_path: path, sha256: hash, extraction });
  if (error) {
    await session.client.storage.from("consumer-bills").remove([path]);
    return reply({ message: "The bill could not be saved, or is already uploaded." }, 409);
  }
  return reply({ id }, 201);
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return reply({ message: "Invalid request origin." }, 403);
  const session = await billSession();
  if (!session) return reply({ message: "Sign in with an active consumer account." }, 401);
  if (Number(request.headers.get("content-length")) > 16000) return reply({ message: "Request too large." }, 413);
  try {
    const body = await request.json();
    if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id) || body.authorized !== true) return reply({ message: "Confirm that you are authorized to manage this account." }, 400);
    const reviewed = parseBill(body.fields);
    if (!reviewed.supplier || !reviewed.accountNumber || !reviewed.periodStart || !reviewed.periodEnd || !reviewed.currency || reviewed.amountDue === null) return reply({ message: "Supplier, account, billing dates, currency and payable amount are required." }, 400);
    const claim = body.claim;
    if (!claim || ![claim.name, claim.account, claim.address].every(x => typeof x === "string" && x.trim().length > 0 && x.length <= 300)) return reply({ message: "Enter your name, service address and account number for comparison." }, 400);
    const { data: original } = await session.client.from("consumer_bills").select("extraction").eq("id", body.id).eq("user_id", session.user.id).single();
    if (!original) return reply({ message: "Bill not found." }, 404);
    const check = ownershipCheck(parseBill(original.extraction), claim);
    const { data, error } = await session.client.from("consumer_bills").update({ reviewed, declaration: claim, ownership_note: check, status: "confirmed", confirmed_at: new Date().toISOString(), account_key: normalizeAccount(reviewed.supplier) + ":" + normalizeAccount(reviewed.accountNumber), period_start: reviewed.periodStart, period_end: reviewed.periodEnd }).eq("id", body.id).eq("user_id", session.user.id).select("id").single();
    if (error || !data) return reply({ message: "Could not save. Check whether this account and billing period are already in your history." }, 409);
    return reply({ message: check });
  } catch { return reply({ message: "Check your bill fields and dates." }, 400); }
}
