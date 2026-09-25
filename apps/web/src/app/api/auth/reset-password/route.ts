import { NextResponse } from "next/server";
import { getAuthProject, getPasswordResetRedirect, isAuthRealm } from "@/lib/supabase/auth-config";
import { createAuthClient } from "@/lib/supabase/server";

const genericMessage = "If an account matches, a password-reset link will arrive shortly.";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 2048) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  const { email, realm } = body as Record<string, unknown>;
  if (typeof email !== "string" || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email) || !isAuthRealm(realm)) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }
  const project = getAuthProject(realm);
  const redirectTo = getPasswordResetRedirect(request.url, realm);
  if (!project || !redirectTo) return NextResponse.json({ message: "This workspace is not connected yet. Please try again after setup is complete." }, { status: 503 });
  const client = await createAuthClient(project);
  const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) console.error("Supabase password-reset request failed", { realm, code: error.code, status: error.status });
  return NextResponse.json({ message: genericMessage });
}
