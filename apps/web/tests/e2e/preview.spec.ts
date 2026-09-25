import { test, expect } from "@playwright/test";

test("landing access dialog explains invitations and password recovery", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign up / Log in" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  await page.getByRole("button", { name: "How sign-up works" }).click();
  await expect(page.getByText("Access starts with an invitation")).toBeVisible();
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(page.getByText(/if an account matches this email/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
});

test("public brand and consumer bill preview work", async ({ page }) => {
  await page.goto("/"); await expect(page.getByRole("heading",{name:"Good energy. Better together."})).toBeVisible();
  await page.getByRole("link",{name:/Explore the demo/}).click();
  await expect(page.getByRole("heading",{name:"Good things start together."})).toBeVisible();
  await page.getByRole("button",{name:/Let’s look at a bill/}).click();
  await page.getByLabel("Energy used (kWh)").fill("350");
  await expect(page.getByText("₱3,500.00")).toBeVisible();
  await page.getByRole("button",{name:"Submit sample for review"}).click();
  await expect(page.getByRole("status")).toContainText("not reviewed or saved");
});
test("CP answers from the local wiki with a source and no model", async ({ page }) => {
  await page.goto("/demo/consumer"); await page.getByRole("button",{name:"Open CP assistant"}).click();
  await page.getByRole("button",{name:"Can I scan a bill?",exact:true}).click();
  await expect(page.getByRole("log")).toContainText("not connected yet");
  await expect(page.getByRole("link",{name:/Preview wiki/})).toHaveAttribute("href","/help/preview#bills-and-ai");
});
test("consumer import stages only valid synthetic rows", async ({ page }) => {
  await page.goto("/demo/community-admin"); await page.getByRole("button",{name:/Invite your community/}).click();
  await page.getByRole("button",{name:"Preview rows"}).click();
  await expect(page.getByText("Duplicate",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Stage 2 demo invitations"}).click();
  await expect(page.getByRole("status")).toContainText("No emails were sent");
});
test("mobile board is usable and session-only", async ({ page }) => {
  await page.setViewportSize({width:390,height:844}); await page.goto("/demo/consumer");
  await page.getByRole("button",{name:"Open menu"}).click(); await page.getByRole("button",{name:"Community board",exact:true}).click();
  await page.getByLabel("Your demo note").fill("Hello from a synthetic test!"); await page.getByRole("button",{name:"Post demo note"}).click();
  await expect(page.getByText("Hello from a synthetic test!",{exact:true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.reload(); await expect(page.getByText("Hello from a synthetic test!",{exact:true})).toHaveCount(0);
});
test("unknown role and oversized requests fail safely", async ({ request }) => {
  expect((await request.get("/demo/superadmin")).status()).toBe(404);
  expect((await request.post("/api/demo/cp",{data:{message:"x".repeat(600)}})).status()).toBe(400);
  expect((await request.post("/api/demo/cp",{data:{message:"x".repeat(5000)}})).status()).toBe(413);
});
