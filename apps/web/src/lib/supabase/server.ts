import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { TenantDescriptor } from "../tenancy";
import type { AuthProject } from "./auth-config";

/** Not used by the public synthetic demo. Call only with a trusted server registry entry. */
export async function createTenantClient(tenant: TenantDescriptor) {
  if (!tenant.projectUrl.startsWith("https://") || !tenant.publishableKey) throw new Error("Tenant configuration is incomplete");
  const store = await cookies();
  return createServerClient(tenant.projectUrl, tenant.publishableKey, {
    cookieOptions: { name: `cp-${tenant.communityId}-auth`, sameSite: "lax", secure: true, path: "/" },
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) { values.forEach(({ name, value, options }) => store.set(name, value, options)); },
    },
  });
}

export async function createAuthClient(project: AuthProject) {
  const store = await cookies();
  return createServerClient(project.projectUrl, project.publishableKey, {
    cookieOptions: {
      name: `cp-${project.communityId}-auth`,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      path: "/",
    },
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) { values.forEach(({ name, value, options }) => store.set(name, value, options)); },
    },
  });
}
