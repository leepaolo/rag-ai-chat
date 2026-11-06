import { expect, type Locator, type Page } from "@playwright/test";

export const SOURCES_LABEL = "Fonti consultate";

// Selectors come from src/components/Chat.tsx: the component has no data-testid,
// so we use the accessible label/role where one exists and the bubble classes otherwise.
export class ChatPage {
  readonly input: Locator;
  readonly sendButton: Locator;
  readonly loading: Locator;
  readonly userMessages: Locator;
  readonly assistantMessages: Locator;
  readonly sourcesBlock: Locator;
  readonly sourceLinks: Locator;

  constructor(readonly page: Page) {
    this.input = page.getByLabel("Domanda");
    this.sendButton = page.getByRole("button", { name: "Invia" });
    this.loading = page.getByText("Sto cercando…");
    this.userMessages = page.locator("main ul > li.self-end");
    this.assistantMessages = page.locator("main ul > li.self-start");
    this.sourcesBlock = page.getByText(SOURCES_LABEL, { exact: true });
    this.sourceLinks = this.assistantMessages.last().getByRole("link");
  }

  async goto() {
    await this.page.goto("/assistente");
    await expect(this.input).toBeVisible();
  }

  /** Types and submits without waiting for the answer. */
  async send(question: string) {
    await this.input.fill(question);
    await this.sendButton.click();
  }

  /** Sends a question and resolves once the streamed response body has been fully received. */
  async ask(question: string): Promise<string> {
    const finished = this.page.waitForEvent("requestfinished", {
      predicate: (request) => request.url().endsWith("/api/chat"),
      timeout: 60_000,
    });
    await this.send(question);
    await finished;
    return this.lastAnswer();
  }

  /** Text of the latest assistant bubble, without the "Fonti consultate" block. */
  async lastAnswer(): Promise<string> {
    const bubble = this.assistantMessages.last();
    await expect(bubble).toBeVisible();
    const paragraphs = await bubble.locator(":scope > p").allInnerTexts();
    return paragraphs.join("\n").trim();
  }

  /** Document ids cited under the answer, read from the link hrefs (".../faq/<id>"). */
  async citedDocumentIds(): Promise<string[]> {
    const hrefs = await this.sourceLinks.evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).href),
    );
    return hrefs.map((href) => href.split("/").pop() ?? href);
  }

  /** Section headings listed after each document title, e.g. ": Come si denuncia, Cosa preparare". */
  async citedSourcesText(): Promise<string> {
    const items = await this.assistantMessages.last().locator("li").allInnerTexts();
    return items.join(" | ");
  }
}
