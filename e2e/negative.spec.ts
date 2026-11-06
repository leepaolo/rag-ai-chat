import { expect, test } from "@playwright/test";

import { ChatPage } from "./helpers/chat-page";

test.describe("Negative", () => {
  // TC-06: messaggio vuoto
  test("TC-06 messaggio vuoto: invio disabilitato e nessuna chiamata di rete", async ({ page }) => {
    const chat = new ChatPage(page);
    const chatCalls: string[] = [];

    // Registriamo ogni chiamata a /api/chat e la blocchiamo: se partisse non costerebbe nulla.
    page.on("request", (request) => {
      if (request.url().endsWith("/api/chat")) chatCalls.push(request.postData() ?? "");
    });
    await page.route("**/api/chat", (route) => route.abort());

    await chat.goto();

    await expect(chat.sendButton).toBeDisabled();

    // Invio da tastiera con campo vuoto, poi con soli spazi.
    await chat.input.press("Enter");
    await chat.input.fill("   ");
    await expect(chat.sendButton).toBeDisabled();
    await chat.input.press("Enter");

    // Lascia girare due frame: sendMessage() farebbe partire la fetch in modo sincrono al submit.
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );

    expect(chatCalls).toHaveLength(0);
    await expect(chat.userMessages).toHaveCount(0);
    await expect(chat.assistantMessages).toHaveCount(0);
  });
});
