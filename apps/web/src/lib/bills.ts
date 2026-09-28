export const billTextFields = ["supplier", "accountNumber", "accountName", "address", "periodStart", "periodEnd", "dueDate", "currency"] as const;
export const billNumberFields = ["kwh", "subtotal", "amountDue"] as const;
export type BillFields = Record<typeof billTextFields[number], string | null> & Record<typeof billNumberFields[number], number | null>;
export type BillRecord = { id: string; extraction: BillFields; reviewed: BillFields | null; status: "draft" | "confirmed"; ownership: "unverified"; created_at: string; };
export function parseBill(value: unknown): BillFields {
  if (!value || typeof value !== "object") throw new Error("Invalid bill fields.");
  const v = value as Record<string, unknown>;
  const result = {} as BillFields;
  for (const key of billTextFields) {
    const x = v[key];
    if (x !== null && (typeof x !== "string" || x.length > 300)) throw new Error(`Check ${key}.`);
    result[key] = typeof x === "string" ? x.trim() || null : null;
  }
  for (const key of billNumberFields) {
    const x = v[key];
    if (x !== null && (typeof x !== "number" || !Number.isFinite(x) || Math.abs(x) > 1e10 || (key === "kwh" && x < 0))) throw new Error(`Check ${key}.`);
    result[key] = x as number | null;
  }
  for (const key of ["periodStart", "periodEnd", "dueDate"] as const) {
    const x = result[key];
    if (x && (!/^\d{4}-\d{2}-\d{2}$/.test(x) || !Number.isFinite(Date.parse(x)) || new Date(x).toISOString().slice(0, 10) !== x)) throw new Error(`Check ${key}.`);
  }
  if (result.periodStart && result.periodEnd && result.periodStart > result.periodEnd) throw new Error("Billing dates are reversed.");
  if (result.currency && !/^[A-Z]{3}$/.test(result.currency)) throw new Error("Use a three-letter currency code.");
  return result;
}
export function normalizeAccount(value: string) { return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""); }
export function ownershipCheck(bill: BillFields, claim: { name: string; account: string; address: string }) {
  return ([ [bill.accountName, claim.name], [bill.accountNumber, claim.account], [bill.address, claim.address] ]).every(([a,b]) => a && b && normalizeAccount(a) === normalizeAccount(b))
    ? "Details match your declaration; ownership is still unverified."
    : "Details are missing or differ from your declaration. Ownership needs independent review.";
}
export function imageMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if ([137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) return "image/png";
  return null;
}
