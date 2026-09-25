import { NextResponse } from "next/server";
import { getAuthProject, isAuthRealm } from "@/lib/supabase/auth-config";
import { createAuthClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const realm = url.searchParams.get("realm");
  const requestedNext = url.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/auth/update-password";
  if (!code || !isAuthRealm(realm)) return NextResponse.redirect(new URL("/?auth=invalid-link", url.origin));
  const project = getAuthProject(realm);
  if (!project) return NextResponse.redirect(new URL("/?auth=not-configured", url.origin));
  const client = await createAuthClient(project);
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/?auth=invalid-link", url.origin));
  const destination = new URL(next, url.origin);
  destination.searchParams.set("realm", realm);
  return NextResponse.redirect(destination);
}
