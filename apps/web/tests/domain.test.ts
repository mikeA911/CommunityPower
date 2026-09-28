import { test } from "node:test";
import assert from "node:assert/strict";
import { isDemoRole, previewDemoImport, sampleBillTotal } from "../src/lib/demo.ts";
import { isExpectedIssuer, resolveTenant } from "../src/lib/tenancy.ts";
import { answerFromPreview, readPreviewGuide } from "../src/lib/preview-help.ts";

test("only documented preview roles exist", () => { assert.equal(isDemoRole("consumer"), true); assert.equal(isDemoRole("superadmin"), false); });
test("demo import refuses real addresses and identifies duplicates without role input", () => {
  assert.deepEqual(previewDemoImport("email\nAlice@demo.example\nalice@demo.example\nname@gmail.com\nbroken\nadmin@demo.example,platform_admin").map(row => row.status), ["Ready", "Duplicate", "Use synthetic email", "Invalid", "Invalid"]);
});
test("sample arithmetic does not convert invalid or negative inputs to a result", () => {
  assert.equal(sampleBillTotal(300,10),3000); assert.equal(sampleBillTotal(0,10),0);
  for (const input of [NaN, Infinity, -1, 10001]) assert.equal(sampleBillTotal(input,10),null);
});
const registry = [{ communityId: "a", host: "a.example", projectUrl: "https://a.supabase.co", publishableKey: "test" }, { communityId: "b", host: "b.example", projectUrl: "https://b.supabase.co", publishableKey: "test" }];
test("tenant resolver fails closed for unknown, malformed and duplicate mappings", () => {
  assert.equal(resolveTenant("A.EXAMPLE",registry)?.communityId,"a");
  for (const host of ["evil.example", "a.example.evil.test", "a.example, b.example", "https://a.example", "a.example/path"]) assert.equal(resolveTenant(host,registry),null);
  assert.equal(resolveTenant("a.example",[registry[0],registry[0]]),null);
  assert.equal(isExpectedIssuer("https://b.supabase.co/auth/v1",registry[0]),false);
});
test("scripted help reads preview wiki and abstains outside its supported topics", async () => {
  const guide = await readPreviewGuide();
  assert.match(answerFromPreview("Can I scan a bill?",guide.content).text,/not connected yet/);
  assert.match(answerFromPreview("Will I save money?",guide.content).text,/not guaranteed/);
  assert.match(answerFromPreview("Tell me tomorrow's weather",guide.content).text,/don’t have a supported answer/);
  assert.equal(answerFromPreview("Can I scan a bill?",guide.content).source,"/help/preview#bills-and-ai");
});

import { imageMime, ownershipCheck, parseBill } from "../src/lib/bills.ts";
const syntheticBill = { supplier: "Example Utility", accountNumber: "001", accountName: "Sample Consumer", address: "1 Example Road", periodStart: "2026-08-01", periodEnd: "2026-08-31", dueDate: null, currency: "PHP", kwh: 120, subtotal: 1000, amountDue: -50 };
test("bill validation preserves credits, leading zeros and unknowns", () => {
  const bill = parseBill(syntheticBill);
  assert.equal(bill.amountDue, -50); assert.equal(bill.accountNumber, "001"); assert.equal(bill.dueDate, null);
  for (const patch of [{ kwh: -1 }, { amountDue: Infinity }, { currency: "pesos" }, { periodEnd: "2026-02-30" }, { periodEnd: "2026-07-31" }, { accountName: undefined }]) assert.throws(() => parseBill({ ...syntheticBill, ...patch }));
});
test("matching declarations never establish ownership", () => {
  assert.match(ownershipCheck(syntheticBill, { name: "Sample Consumer", account: "001", address: "1 Example Road" }), /still unverified/);
  assert.match(ownershipCheck(syntheticBill, { name: "Someone Else", account: "001", address: "1 Example Road" }), /independent review/);
});
test("image sniffing refuses text disguised as a picture", () => {
  assert.equal(imageMime(new TextEncoder().encode("not an image")), null);
  assert.equal(imageMime(new Uint8Array([255,216,255,0])), "image/jpeg");
});

import { navigationAnswer, readPreviewNavigation } from "../src/lib/preview-help.ts";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
test("CP navigation catalog covers actual routes and keeps planned actions unavailable", async () => {
  const features = await readPreviewNavigation();
  assert.equal(new Set(features.map(f => f.id)).size, features.length);
  for (const feature of features) {
    assert.ok(feature.instructions.length > 20);
    if (feature.state === "planned") assert.equal(feature.href, null);
    if (feature.href) {
      assert.match(feature.href, /^\/(?!\/)/);
      const route = feature.href.startsWith("/demo/") ? "/demo/[role]" : feature.href;
      await access(resolve(process.cwd(), `src/app${route === "/" ? "" : route}/page.tsx`));
    }
  }
  const all = navigationAnswer("What features are available?", features)!;
  for (const feature of features) assert.ok(all.text.includes(feature.label));
  assert.equal(navigationAnswer("Where is my bill history?", features)?.links[0].href, "/dashboard");
  assert.match(navigationAnswer("Can I delete my bills?", features)!.text, /planned/);
  assert.match(navigationAnswer("Does this prove ownership?", features)!.text, /do not establish ownership/);
  assert.equal(navigationAnswer("Tell me tomorrow's weather", features), null);
  assert.match(navigationAnswer("Will you remember our conversation?", features)!.text, /worker is not connected/);
  assert.equal(navigationAnswer("Where is my chat history?", features)!.links[0].href, "/conversations");
  assert.equal(navigationAnswer("Can I request food delivery?", features)!.links[0].href, "/services");
  assert.match(navigationAnswer("How do I add a service?", features)!.text, /no request is sent/);
});
