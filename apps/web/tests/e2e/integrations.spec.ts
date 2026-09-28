import { test, expect } from "@playwright/test";
test("Tavily diagnostic rejects anonymous and cross-origin callers", async ({ request }) => {
  const foreign = await request.post("/api/admin/tavily-check", { headers: { origin: "https://foreign.invalid" } });
  expect(foreign.status()).toBe(403);
  const anonymous = await request.post("/api/admin/tavily-check", { headers: { origin: "http://127.0.0.1:3000" } });
  expect(anonymous.status()).toBe(401);
});
test("administrator diagnostic displays test result without asking for a key", async ({ page }) => {
  await page.route("**/api/admin/tavily-check", route => route.fulfill({ json: { ok: true, message: "Tavily connection verified: synthetic test response." } }));
  await page.goto("/admin/integrations");
  await expect(page.getByText("CP’s conversational web research is not connected yet.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Test Tavily connection" }).click();
  await expect(page.getByRole("status")).toContainText("connection verified");
  await expect(page.locator("input")).toHaveCount(0);
});
