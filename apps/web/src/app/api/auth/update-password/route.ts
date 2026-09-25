import { NextResponse } from "next/server";
import { getAuthProject, isAuthRealm } from "@/lib/supabase/auth-config";
import { createAuthClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 2048) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter a valid password." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ message: "Enter a valid password." }, { status: 400 });
  const { password, realm } = body as Record<string, unknown>;
  if (typeof password !== "string" || password.length < 12 || password.length > 128 || !isAuthRealm(realm)) {
    return NextResponse.json({ message: "Use a password between 12 and 128 characters." }, { status: 400 });
  }
  const project = getAuthProject(realm);
  if (!project) return NextResponse.json({ message: "This workspace is not connected yet." }, { status: 503 });
  const client = await createAuthClient(project);
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ message: "This recovery session has expired. Request a new reset link." }, { status: 401 });
  const { error } = await client.auth.updateUser({ password });
  if (error) return NextResponse.json({ message: "We could not update the password. Request a new reset link and try again." }, { status: 400 });
  return NextResponse.json({ message: "Password updated. You can now return home and log in." });
}
