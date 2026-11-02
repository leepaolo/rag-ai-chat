import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";

import { groupSources, lastUserText, toSources } from "@/lib/chat";
import type { VectorStoreResult } from "@/lib/vector-store";

function message(role: UIMessage["role"], ...texts: string[]): UIMessage {
  return { id: `${role}-${texts.join("")}`, role, parts: texts.map((text) => ({ type: "text", text })) };
}

describe("lastUserText", () => {
  it("returns the text of the latest user message", () => {
    const messages = [message("user", "prima"), message("assistant", "risposta"), message("user", "seconda")];

    expect(lastUserText(messages)).toBe("seconda");
  });

  it("joins multiple text parts and trims", () => {
    expect(lastUserText([message("user", " uno ", "due ")])).toBe("uno \ndue");
  });

  it("returns null when there is no usable user text", () => {
    expect(lastUserText([])).toBeNull();
    expect(lastUserText([message("assistant", "ciao")])).toBeNull();
    expect(lastUserText([message("user", "   ")])).toBeNull();
  });
});

describe("groupSources", () => {
  it("groups chunks by document in first-seen order and dedupes headings", () => {
    const source = (documentId: string, heading: string | null) => ({
      documentId,
      title: `Titolo ${documentId}`,
      heading,
      sourceUrl: null,
    });

    expect(
      groupSources([source("a", "Uno"), source("b", null), source("a", "Due"), source("a", "Uno")]),
    ).toEqual([
      { documentId: "a", title: "Titolo a", sourceUrl: null, headings: ["Uno", "Due"] },
      { documentId: "b", title: "Titolo b", sourceUrl: null, headings: [] },
    ]);
  });

  it("returns an empty list for no sources", () => {
    expect(groupSources([])).toEqual([]);
  });
});

describe("toSources", () => {
  it("keeps only citation fields, in rank order", () => {
    const result: VectorStoreResult = {
      chunkId: "d#1",
      documentId: "d",
      documentTitle: "Titolo",
      heading: "Sezione",
      content: "Testo.",
      category: "polizza",
      product: null,
      sourceUrl: "https://x/d",
      score: 0.8,
    };

    expect(toSources([result])).toEqual([
      { documentId: "d", title: "Titolo", heading: "Sezione", sourceUrl: "https://x/d" },
    ]);
  });
});
