import { expect, test } from "@playwright/test";

import { FALLBACK_REPLY } from "@/lib/prompt";

import { ChatPage } from "./helpers/chat-page";

// Domande dal foglio "Domande di Test", una per volta (6 e 7 già fatte a mano).
test.describe("Domande di Test (Excel)", () => {
  // Domanda 8: la knowledge base cita il CID solo per dire di compilarlo in due (sinistri-auto-denuncia)
  // e non dice cosa succede se l'altra parte non firma. Atteso: fallback o risposta prudente, senza inventare.
  test("Q8 altro conducente non firma il CID: nessuna procedura inventata", async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.goto();

    const answer = await chat.ask("Cosa succede se l'altro conducente non firma il CID (modulo di constatazione amichevole)?");

    test.info().annotations.push({ type: "risposta", description: answer });
    test.info().annotations.push({ type: "fonti", description: await chat.citedSourcesText().catch(() => "") });

    expect(answer.length).toBeGreaterThan(0);
    if (answer === FALLBACK_REPLY) {
      await expect(chat.sourcesBlock).toHaveCount(0);
    } else {
      // Se risponde, le fonti devono venire solo dai documenti che parlano di denuncia/dinamica.
      const cited = await chat.citedDocumentIds();
      for (const id of cited) expect(["sinistri-auto-denuncia", "rimborsi-tempi"]).toContain(id);
      // Nessuna procedura legale non presente nella knowledge base.
      expect(answer).not.toMatch(/tribunale|giudice|avvocato|carabinieri|polizia|CARD|ricorso/i);
    }
  });
});
