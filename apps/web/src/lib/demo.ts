export const roles = ["consumer", "community-admin", "platform-admin"] as const;
export type DemoRole = typeof roles[number];
export function isDemoRole(value: string): value is DemoRole { return roles.some(role => role === value); }
export const roleLabels: Record<DemoRole, string> = { consumer: "Consumer", "community-admin": "Community admin", "platform-admin": "Sandz platform admin" };

export type ImportRow = { email: string; status: "Ready" | "Duplicate" | "Invalid" | "Use synthetic email" };
export function previewDemoImport(text: string): ImportRow[] {
  const seen = new Set<string>();
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).filter((line, i) => !(i === 0 && line.toLowerCase() === "email")).slice(0, 25).map(email => {
    const normalized = email.toLowerCase();
    let status: ImportRow["status"] = "Ready";
    if (!/^[^\s,@]+@[^\s,@]+\.[^\s,@]+$/.test(email)) status = "Invalid";
    else if (!normalized.endsWith(".example")) status = "Use synthetic email";
    else if (seen.has(normalized)) status = "Duplicate";
    if (status === "Ready") seen.add(normalized);
    return { email, status };
  });
}

export function sampleBillTotal(kwh: number, rate: number): number | null {
  if (!Number.isFinite(kwh) || !Number.isFinite(rate) || kwh < 0 || rate < 0 || kwh > 10000 || rate > 100) return null;
  return Math.round(kwh * rate * 100) / 100;
}

export const sampleMembers = [
  { name: "Alex Demo", email: "alex@community.example", status: "Active" },
  { name: "Sam Demo", email: "sam@community.example", status: "Invited" },
  { name: "Robin Demo", email: "robin@community.example", status: "Active" },
];
