import { test, expect } from "@playwright/test";

test("private conversation endpoints reject anonymous sessions and foreign origins", async ({ request }) => {
  const id = "10000000-0000-4000-8000-000000000001";
  expect((await request.get("/api/conversations")).status()).toBe(401);
  expect((await request.get(`/api/conversations/messages?conversation=${id}`)).status()).toBe(401);
  for (const method of ["POST", "PATCH", "DELETE"]) {
    expect((await request.fetch("/api/conversations", { method, headers: { origin: "https://foreign.invalid" }, data: { id, title: "Synthetic" } })).status()).toBe(400);
  }
  expect((await request.post("/api/conversations/messages", { headers: { origin: "https://foreign.invalid" }, data: { conversation: id, requestId: id, message: "Test" } })).status()).toBe(400);
});

test("saved CP history supports retry, reload, rename, recall and confirmed deletion", async ({ page }) => {
  type Chat = { id: string; title: string; memory_enabled: boolean; created_at: string };
  type Message = { id: string; role: string; content: string; created_at: string };
  let chats: Chat[] = []; let messages: Message[] = [];
  let failedOnce = false; let previousId = ""; let attempts = 0;
  await page.route("**/api/conversations**", async route => {
    const request = route.request(), url = new URL(request.url());
    const body = request.method() === "GET" ? null : request.postDataJSON();
    if (url.pathname.endsWith("/messages")) {
      if (request.method() === "GET") return route.fulfill({ json: { conversation: chats[0], messages, hasMore: false } });
      attempts++;
      if (!failedOnce) {
        failedOnce = true; previousId = body.requestId;
        return route.fulfill({ status: 503, json: { message: "Could not save this exchange. Retry safely." } });
      }
      expect(body.requestId).toBe(previousId);
      messages = [{ id: body.requestId, role: "user", content: body.message, created_at: new Date().toISOString() }, { id: "reply", role: "assistant", content: "Synthetic scripted reply", created_at: new Date().toISOString() }];
      return route.fulfill({ json: { saved: true } });
    }
    if (request.method() === "POST") {
      chats = [{ id: body.id, title: "New conversation", memory_enabled: false, created_at: new Date().toISOString() }];
      return route.fulfill({ json: { conversation: chats[0] } });
    }
    if (request.method() === "PATCH") { chats[0] = { ...chats[0], ...body }; return route.fulfill({ json: { conversation: chats[0] } }); }
    if (request.method() === "DELETE") { chats = []; messages = []; return route.fulfill({ json: { deleted: true } }); }
    return route.fulfill({ json: { conversations: chats, hasMore: false } });
  });
  await page.goto("/conversations");
  await page.getByRole("button", { name: "New conversation", exact: true }).click();
  await expect(page.getByLabel("Allow recall for this conversation")).not.toBeChecked();
  await page.getByLabel("Message to CP").fill("Where is my bill history?");
  await page.getByRole("button", { name: "Send and save" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Retry safely");
  await expect(page.getByLabel("Message to CP")).toHaveValue("Where is my bill history?");
  await page.getByRole("button", { name: "Send and save" }).click();
  await expect(page.getByRole("log")).toContainText("Synthetic scripted reply");
  expect(attempts).toBe(2);
  await page.getByLabel("Conversation title").fill("My synthetic energy questions");
  await page.getByRole("button", { name: "Save title" }).click();
  await page.getByLabel("Allow recall for this conversation").click();
  await expect(page.getByLabel("Allow recall for this conversation")).toBeChecked();
  await page.reload();
  await page.getByRole("button", { name: "My synthetic energy questions" }).click();
  await expect(page.getByRole("log")).toContainText("Synthetic scripted reply");
  await expect(page.getByLabel("Allow recall for this conversation")).toBeChecked();
  await page.getByLabel("Allow recall for this conversation").click();
  await expect(page.getByLabel("Allow recall for this conversation")).not.toBeChecked();
  await page.getByRole("button", { name: "Delete conversation", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("Synthetic scripted reply");
  await page.getByRole("button", { name: "Delete conversation", exact: true }).click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page.getByText("No saved conversations yet.")).toBeVisible();
  await expect(page.getByText("Synthetic scripted reply")).toHaveCount(0);
});

test("mobile history loads older messages and clears a conversation on failed selection", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const chat = { id: "10000000-0000-4000-8000-000000000001", title: "Synthetic history", memory_enabled: false, created_at: "2026-09-27T00:00:00Z" };
  await page.route("**/api/conversations**", route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/messages")) {
      if (url.searchParams.get("conversation") === "missing") return route.fulfill({ status: 404, json: { message: "Conversation not found." } });
      const older = url.searchParams.has("offset");
      return route.fulfill({ json: { conversation: chat, messages: [{ id: older ? "old" : "new", role: "user", content: older ? "Older synthetic question" : "Recent synthetic question", created_at: chat.created_at }], hasMore: !older } });
    }
    return route.fulfill({ json: { conversations: [chat, { ...chat, id: "missing", title: "Deleted elsewhere" }], hasMore: false } });
  });
  await page.goto("/conversations");
  await page.getByRole("button", { name: "Synthetic history", exact: true }).click();
  await page.getByRole("button", { name: "Older messages" }).click();
  await expect(page.getByRole("log")).toContainText("Older synthetic question");
  await page.getByRole("button", { name: "Deleted elsewhere" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Conversation not found");
  await expect(page.getByText("Older synthetic question")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
