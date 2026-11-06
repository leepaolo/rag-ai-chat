import { expect, test } from "@playwright/test";

import { ChatPage, SOURCES_LABEL } from "./helpers/chat-page";

test.describe("Funzionale", () => {
  let chat: ChatPage;

  test.beforeEach(async ({ page }) => {
    chat = new ChatPage(page);
    await chat.goto();
  });

  // TC-01 (smoke): domanda diretta con risposta nota in knowledge/
  test("TC-01 risposta non vuota con fonte visibile", async () => {
    const answer = await chat.ask("Quali documenti servono per denunciare un sinistro auto?");

    expect(answer.length).toBeGreaterThan(0);
    await expect(chat.sourcesBlock).toBeVisible();
    await expect(chat.sourceLinks.first()).toBeVisible();
  });

  // TC-13: elenco dati per la denuncia + fonte
  test("TC-13 elenca polizza, targa, data/luogo, descrizione e cita la fonte", async () => {
    const answer = await chat.ask("Quali documenti servono per denunciare un sinistro auto?");

    expect(answer).toMatch(/polizza/i);
    expect(answer).toMatch(/targa/i);
    expect(answer).toMatch(/data/i);
    expect(answer).toMatch(/luogo/i);
    expect(answer).toMatch(/descrizione|fatti/i);

    await expect(chat.sourcesBlock).toBeVisible();
    expect(await chat.citedDocumentIds()).toContain("sinistri-auto-denuncia");

    // Osservazione (non fallimento): TC-13 e TC-14 citano lo stesso documento. Le fonti sono
    // raggruppate per documento; le sezioni citate vanno confrontate nel report.
    test.info().annotations.push({
      type: "osservazione",
      description: `fonti TC-13: ${await chat.citedSourcesText()}`,
    });
  });

  // TC-14: canali di denuncia (+ CID se più veicoli)
  test("TC-14 menziona area clienti, email, telefono e cita la fonte", async () => {
    const answer = await chat.ask("Come faccio ad aprire un sinistro dopo un incidente?");

    expect(answer).toMatch(/area clienti/i);
    expect(answer).toMatch(/e-?mail/i);
    expect(answer).toMatch(/telefon|numero verde|chiam/i);
    // Il CID è facoltativo: se presente è un di più, non un requisito.
    if (/CID|CAI|constatazione amichevole/i.test(answer)) {
      test.info().annotations.push({ type: "osservazione", description: "risposta cita il CID" });
    }

    await expect(chat.sourcesBlock).toBeVisible();
    expect(await chat.citedDocumentIds()).toContain("sinistri-auto-denuncia");
    test.info().annotations.push({
      type: "osservazione",
      description: `fonti TC-14: ${await chat.citedSourcesText()}`,
    });
  });

  test("la label delle fonti non compare prima della prima risposta", async () => {
    await expect(chat.page.getByText(SOURCES_LABEL)).toHaveCount(0);
  });
});
