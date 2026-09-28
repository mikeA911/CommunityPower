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

 test("private bills reject unauthenticated reads and cross-origin writes", async ({ request }) => {
  const read = await request.get("/api/bills");
  expect(read.status()).toBe(401);
  const write = await request.post("/api/bills", { headers: { origin: "https://other.example" } });
  expect(write.status()).toBe(403);
 });
 test("bill dashboard reviews drafts and separates houses using synthetic API responses", async ({ page }) => {
  const fields = { supplier: "Example Utility", accountNumber: "001", accountName: "Example Person", address: "1 Example Road", periodStart: "2026-08-01", periodEnd: "2026-08-31", dueDate: null, currency: "PHP", kwh: 120, subtotal: 1000, amountDue: 1000 };
  const bills = [ { id: "11111111-1111-4111-8111-111111111111", extraction: fields, reviewed: null, status: "draft", ownership: "unverified", created_at: "2026-09-01" }, { id: "22222222-2222-4222-8222-222222222222", extraction: { ...fields, accountNumber: "002", currency: "KHR" }, reviewed: { ...fields, accountNumber: "002", currency: "KHR" }, status: "confirmed", ownership: "unverified", created_at: "2026-09-01" } ];
  await page.route("**/api/bills", async route => {
   if (route.request().method() === "PATCH") {
    const body = route.request().postDataJSON(); expect(body.authorized).toBe(true);
    Object.assign(bills[0], { reviewed: body.fields, status: "confirmed" });
    await route.fulfill({ json: { message: "Details match your declaration; ownership is still unverified." } });
   } else await route.fulfill({ json: { bills } });
  });
  await page.goto("/dashboard");
  await expect(page.getByText("Needs your review", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Review bill" }).first().click();
  await page.getByLabel("Your full name", { exact: true }).fill("Example Person");
  await page.getByLabel("Your service account number").fill("001");
  await page.getByLabel("Your service address").fill("1 Example Road");
  await page.getByLabel("I am the account holder", { exact: false }).check();
  await page.getByRole("button", { name: "Confirm and add to history" }).click();
  await expect(page.getByRole("status")).toContainText("still unverified");
  await page.getByLabel("House / electricity account").selectOption("Example Utility / 001 / PHP");
  await expect(page.getByRole("table")).toContainText("1000 PHP");
  await expect(page.getByRole("table")).not.toContainText("KHR");
  await page.setViewportSize({ width:390, height:844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
 });

test("multiple bill uploads keep successful drafts when one is a duplicate", async ({ page }) => {
  let uploads = 0;
  await page.route("**/api/bills", async route => {
    if (route.request().method() === "POST") {
      uploads++;
      expect(route.request().postDataBuffer()?.toString()).toContain('name="consent"');
      await route.fulfill(uploads === 1 ? { status: 201, json: { id: "synthetic" } } : { status: 409, json: { message: "This image is already in your bills." } });
    } else await route.fulfill({ json: { bills: [] } });
  });
  await page.goto("/dashboard");
  await page.getByLabel("Bill images").setInputFiles([
    { name: "synthetic-a.png", mimeType: "image/png", buffer: Buffer.from([137,80,78,71,13,10,26,10]) },
    { name: "synthetic-b.png", mimeType: "image/png", buffer: Buffer.from([137,80,78,71,13,10,26,10]) },
  ]);
  await page.getByLabel("I agree to send these bills", { exact: false }).check();
  await page.getByRole("button", { name: "Read and save drafts" }).click();
  await expect(page.getByRole("status")).toContainText("Bill 1: saved as a draft");
  await expect(page.getByRole("status")).toContainText("Bill 2: This image is already");
  expect(uploads).toBe(2);
});

test("CP explains dashboard navigation and planned actions without inventing links", async ({ page }) => {
  await page.route("**/api/bills", route => route.fulfill({ json: { bills: [] } }));
  await page.goto("/dashboard");
  await page.getByText("Ask CP about features and navigation", { exact: true }).click();
  await page.getByLabel("Ask CP", { exact: true }).fill("Where is my bill history?");
  await page.getByRole("button", { name: "Ask CP", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("gated-local");
  await expect(page.getByRole("link", { name: "My bills and history", exact: true })).toHaveAttribute("href", "/dashboard");
  await page.getByLabel("Ask CP", { exact: true }).fill("Can I delete my bills?");
  await page.getByRole("button", { name: "Ask CP", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("no supported settings page");
  await expect(page.getByRole("navigation", { name: "CP suggested navigation" }).getByRole("link")).toHaveCount(0);
  await page.getByLabel("Ask CP", { exact: true }).fill("Will you remember our conversation?");
  await page.getByRole("button", { name: "Ask CP", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("worker is not connected");
});
