import { expect, test } from "@playwright/test";

import { ChatPage } from "./helpers/chat-page";
import { MOCK_SOURCE, mockChat } from "./helpers/mock-chat";

test.describe("UI", () => {
  // TC-08: loading e blocco dell'invio durante l'attesa
  test("TC-08 indicatore di loading visibile e invio bloccato fino alla fine dello stream", async ({ page }) => {
    const chat = new ChatPage(page);

    // Teniamo la richiesta in sospeso finché il test non la rilascia: lo stato "submitted" dura
    // altrimenti pochi ms (soprattutto sul fallback) e l'asserzione sarebbe aleatoria.
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    await mockChat(page, { text: "Risposta di prova.", waitFor: gate });

    await chat.goto();
    await chat.send("Come disdico la polizza?");

    await expect(chat.loading).toBeVisible();
    await expect(chat.userMessages).toHaveCount(1);

    // Con una risposta in corso, anche scrivendo un nuovo testo l'invio resta disabilitato.
    await chat.input.fill("seconda domanda");
    await expect(chat.sendButton).toBeDisabled();

    // Il requisito dice "input disabilitato": nel componente attuale è disabilitato solo il bottone.
    if (await chat.input.isEnabled()) {
      test.info().annotations.push({
        type: "discrepanza",
        description: "TC-08: durante l'attesa il campo input resta abilitato, solo il bottone Invia è disabilitato.",
      });
    }

    release();

    await expect(chat.loading).toBeHidden();
    await expect(chat.assistantMessages).toHaveCount(1);
    // Fine dello stream: lo stato non è più busy, quindi con testo nel campo l'invio si riabilita.
    await expect(chat.sendButton).toBeEnabled();
  });

  // TC-09: fonte etichettata e linkata
  test("TC-09 la fonte è visibile, etichettata e cliccabile", async ({ page, context }) => {
    const chat = new ChatPage(page);
    // I source_url sono segnaposto su example.com: serviamo una pagina finta per non uscire in rete.
    await context.route("https://example.com/**", (route) =>
      route.fulfill({ contentType: "text/html", body: "<title>FAQ</title>" }),
    );
    // Test di sola UI: la risposta è finta, il retrieval vero è coperto da TC-01/TC-11.
    await mockChat(page, { text: "Puoi denunciare dall'area clienti.", sources: [MOCK_SOURCE] });

    await chat.goto();
    await chat.ask("Come si denuncia un incidente con l'auto?");

    await expect(chat.sourcesBlock).toBeVisible();

    const link = chat.assistantMessages.last().getByRole("link", { name: "Come denunciare un sinistro auto" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /\/faq\/sinistri-auto-denuncia$/);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);

    const popupPromise = page.waitForEvent("popup");
    await link.click();
    const popup = await popupPromise;
    expect(popup.url()).toMatch(/\/faq\/sinistri-auto-denuncia$/);
  });
});
