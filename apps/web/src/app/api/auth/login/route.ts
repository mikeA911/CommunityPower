import { NextResponse } from "next/server";
import { getAuthProject, isAuthRealm } from "@/lib/supabase/auth-config";
import { createAuthClient } from "@/lib/supabase/server";

const redirectByRole: Record<string, string> = {
  platform_admin: "/demo/platform-admin",
  community_admin: "/demo/community-admin",
  consumer: "/demo/consumer",
};

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 4096) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 });
  const { email, password, realm } = body as Record<string, unknown>;
  if (typeof email !== "string" || email.length > 254 || typeof password !== "string" || password.length < 8 || password.length > 128 || !isAuthRealm(realm)) {
    return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 });
  }
  const project = getAuthProject(realm);
  if (!project) return NextResponse.json({ message: "This workspace is not connected yet. Please try again after setup is complete." }, { status: 503 });
  const client = await createAuthClient(project);
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) return NextResponse.json({ message: "The email or password is incorrect." }, { status: 401 });
  let role = "";
  if (realm === "control") {
    const { data: assignment } = await client.from("platform_role_assignments").select("role").eq("user_id", data.user.id).is("revoked_at", null).maybeSingle();
    role = assignment?.role ?? "";
  } else {
    const { data: assignment } = await client.from("role_assignments").select("role").eq("user_id", data.user.id).is("revoked_at", null).maybeSingle();
    role = assignment?.role ?? "";
  }
  const allowedInRealm = realm === "control" ? role === "platform_admin" : role === "community_admin" || role === "consumer";
  if (!allowedInRealm) {
    await client.auth.signOut();
    return NextResponse.json({ message: "This account does not have access to the selected workspace." }, { status: 403 });
  }
  return NextResponse.json({ redirectTo: redirectByRole[role] || "/" });
}
