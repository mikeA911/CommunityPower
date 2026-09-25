/** Foundation only: these descriptors do not configure a live Supabase project. */
export type TenantDescriptor = { communityId: string; host: string; projectUrl: string; publishableKey: string };

export function resolveTenant(host: string, registry: readonly TenantDescriptor[]): TenantDescriptor | null {
  if (!/^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host)) return null;
  const normalized = host.toLowerCase();
  const matches = registry.filter(entry => entry.host.toLowerCase() === normalized);
  return matches.length === 1 ? matches[0] : null;
}

export function isExpectedIssuer(issuer: string, tenant: TenantDescriptor): boolean {
  return issuer === `${tenant.projectUrl.replace(/\/$/, "")}/auth/v1`;
}
