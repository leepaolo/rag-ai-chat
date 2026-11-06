import { expect, test } from "@playwright/test";

import { FALLBACK_REPLY } from "@/lib/prompt";

import { RETRIEVAL_DATASET } from "./fixtures/retrieval-dataset";
import { ChatPage } from "./helpers/chat-page";

test.describe("Retrieval quality", () => {
  // TC-11: la fonte attesa deve comparire tra quelle citate
  test.describe("TC-11 fonte attesa per domande dirette e parafrasate", () => {
    for (const { tipo, domanda, fonteAttesa } of RETRIEVAL_DATASET) {
      test(`[${tipo}] ${domanda} → ${fonteAttesa}`, async ({ page }) => {
        const chat = new ChatPage(page);
        await chat.goto();

        const answer = await chat.ask(domanda);

        expect(answer, "la domanda è in dominio: non deve scattare il fallback").not.toBe(FALLBACK_REPLY);
        await expect(chat.sourcesBlock).toBeVisible();
        expect(await chat.citedDocumentIds()).toContain(fonteAttesa);
      });
    }
  });

  // TC-12: domanda di confine; "ca" è riportato come nel tracker (probabile "casa").
  // Euristica: o fallback, o richiesta di chiarimento. Una risposta nel merito è un fallimento
  // perché la knowledge base non distingue i tempi di rimborso tra auto e casa.
  test("TC-12 domanda ambigua: fallback o chiarimento, nessuna risposta forzata", async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();

    const answer = await chat.ask("I tempi di rimborso sono uguali per sinistri auto e per sinistri ca?");

    const isFallback = answer === FALLBACK_REPLY;
    const asksClarification = /\?|chiarire|specificare|intendi|ti riferisci|quale tipo/i.test(answer);
    const onlyAutoFacts = /solo.*auto|riguard\w+.*auto/i.test(answer);

    expect(isFallback || asksClarification || onlyAutoFacts).toBe(true);
    // Nessun dato inventato su sinistri casa.
    expect(answer).not.toMatch(/sinistri casa[^.]*\d+\s*giorni/i);

    if (isFallback) await expect(chat.sourcesBlock).toHaveCount(0);
  });
});
