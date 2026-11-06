import type { Page } from "@playwright/test";

import type { ChatSource } from "@/lib/chat";

type MockChatOptions = {
  text: string;
  sources?: ChatSource[];
  /** Resolved before the response is sent: lets a test hold the request in the "loading" state. */
  waitFor?: Promise<void>;
};

export const MOCK_SOURCE: ChatSource = {
  documentId: "sinistri-auto-denuncia",
  title: "Come denunciare un sinistro auto",
  heading: "Come si denuncia",
  sourceUrl: "https://example.com/faq/sinistri-auto-denuncia",
};

// Same wire format the route returns (UI message stream over SSE, see src/app/api/chat/route.ts),
// so the real Chat component renders it: no embeddings and no LLM call.
export async function mockChat(page: Page, { text, sources = [], waitFor }: MockChatOptions) {
  await page.route("**/api/chat", async (route) => {
    await waitFor;
    const parts = [
      { type: "start", messageMetadata: { sources } },
      { type: "text-start", id: "mock" },
      { type: "text-delta", id: "mock", delta: text },
      { type: "text-end", id: "mock" },
      { type: "finish" },
    ];
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body: [...parts.map((part) => `data: ${JSON.stringify(part)}\n\n`), "data: [DONE]\n\n"].join(""),
    });
  });
}
