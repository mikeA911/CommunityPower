import { test, expect } from "@playwright/test";

test("consumer service requests appear in the manager example and added cards return to the catalog", async ({ page }) => {
  await page.route("**/api/bills", route => route.fulfill({ json: { bills: [] } }));
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Explore future services" }).click();
  await expect(page.getByText("Future service", { exact: true })).toHaveCount(6);
  await expect(page.getByRole("heading", { name: "Solar-charged home battery" })).toBeVisible();
  await page.getByRole("button", { name: "Request food delivery" }).click();
  await page.getByRole("dialog").getByLabel("Note to community manager (optional)").fill("Example: Friday evening meals please.");
  await page.getByRole("button", { name: "Add example request" }).click();
  await expect(page.getByRole("status")).toContainText("No message was sent");
  await page.getByRole("link", { name: "View manager example" }).click();
  await expect(page.getByText("Example: Friday evening meals please.")).toBeVisible();
  await page.getByRole("button", { name: "Add service example" }).click();
  await page.getByRole("dialog").getByLabel("Service name").fill("Pet care example");
  await page.getByRole("dialog").getByLabel("Brief description").fill("Explore a possible community pet-care service.");
  await page.getByRole("button", { name: "Add future service", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("not available to order");
  await page.getByRole("link", { name: "Consumer services preview" }).click();
  await expect(page.getByRole("heading", { name: "Pet care example" })).toBeVisible();
  await expect(page.getByText("Future service", { exact: true })).toHaveCount(7);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Pet care example" })).toBeVisible();
  await page.getByRole("button", { name: "Reset examples" }).click();
  await expect(page.getByRole("heading", { name: "Pet care example" })).toHaveCount(0);
});

test("manager dashboard links the preview; mobile request modal cancels with Escape", async ({ page }) => {
  await page.goto("/demo/community-admin");
  await page.getByRole("link", { name: "Service requests · example" }).click();
  await expect(page.getByRole("heading", { name: "Consumer requests" })).toBeVisible();
  await page.getByRole("link", { name: "Consumer services preview" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Request water delivery" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
