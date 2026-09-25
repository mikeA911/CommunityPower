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
