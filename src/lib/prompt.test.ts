import { describe, expect, it } from "vitest";

import { FALLBACK_REPLY, buildSystemPrompt } from "@/lib/prompt";
import type { VectorStoreResult } from "@/lib/vector-store";

function result(overrides: Partial<VectorStoreResult>): VectorStoreResult {
  return {
    chunkId: "d#0",
    documentId: "d",
    documentTitle: "Titolo",
    heading: "Sezione",
    content: "Contenuto.",
    category: "polizza",
    product: "auto",
    sourceUrl: null,
    score: 0.9,
    ...overrides,
  };
}

describe("buildSystemPrompt", () => {
  it("numbers the chunks with title, heading and content", () => {
    const prompt = buildSystemPrompt([
      result({ content: "Uno." }),
      result({ documentTitle: "Altro", heading: null, content: "Due." }),
    ]);

    expect(prompt).toContain("[1] Titolo - Sezione\nUno.");
    expect(prompt).toContain("[2] Altro\nDue.");
  });

  it("tells the model to answer only from the context and to fall back otherwise", () => {
    const prompt = buildSystemPrompt([result({})]);

    expect(prompt).toContain("SOLO");
    expect(prompt).toContain(FALLBACK_REPLY);
  });

  it("marks the context as empty when nothing was retrieved", () => {
    expect(buildSystemPrompt([])).toContain("(nessuna informazione disponibile)");
  });

  it("does not include scores or source urls", () => {
    const prompt = buildSystemPrompt([result({ sourceUrl: "https://x/y", score: 0.123 })]);

    expect(prompt).not.toContain("https://x/y");
    expect(prompt).not.toContain("0.123");
  });
});
