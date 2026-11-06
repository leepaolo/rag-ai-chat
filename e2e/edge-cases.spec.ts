import { expect, test } from "@playwright/test";

import { FALLBACK_REPLY } from "@/lib/prompt";

import { ChatPage } from "./helpers/chat-page";

// Fuori dominio: il punteggio di similarity è sotto MIN_TOP_SCORE, quindi la route risponde con
// FALLBACK_REPLY senza chiamare il modello e senza fonti (src/app/api/chat/route.ts).
async function expectFallbackWithoutSources(chat: ChatPage, question: string) {
  const answer = await chat.ask(question);

  expect(answer).toBe(FALLBACK_REPLY);
  expect(answer).toMatch(/contattare un operatore/i);
  expect(answer).not.toMatch(/\d+\s*°|gradi|sole|pioggia|nuvol/i); // niente meteo inventato
  await expect(chat.sourcesBlock).toHaveCount(0);
  await expect(chat.sourceLinks).toHaveCount(0);
}

test.describe("Edge case", () => {
  let chat: ChatPage;

  test.beforeEach(async ({ page }) => {
    chat = new ChatPage(page);
    await chat.goto();
  });

  // TC-04
  test("TC-04 domanda fuori dominio: fallback, nessuna fonte", async () => {
    await expectFallbackWithoutSources(chat, "Che tempo fa oggi a Bologna?");
  });

  // TC-15: stessa domanda di TC-04, resta come regressione sulla soglia di similarity
  test("TC-15 regressione soglia similarity: fallback esplicito, nessuna fonte", async () => {
    await expectFallbackWithoutSources(chat, "Che tempo fa oggi a Bologna?");
  });
});
