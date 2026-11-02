import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";

import { groupSources, isFallbackReply, lastUserText, selectRelevant, toSources } from "@/lib/chat";
import { FALLBACK_REPLY } from "@/lib/prompt";
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

function scored(...scores: number[]): VectorStoreResult[] {
  return scores.map((score, i) => ({
    chunkId: `d#${i}`,
    documentId: "d",
    documentTitle: "Titolo",
    heading: `S${i}`,
    content: "Testo.",
    category: "polizza",
    product: null,
    sourceUrl: null,
    score,
  }));
}

describe("selectRelevant", () => {
  it("returns nothing when the best chunk is below the minimum score", () => {
    expect(selectRelevant(scored(0.39, 0.3))).toEqual([]);
    expect(selectRelevant(scored(0.22, 0.19))).toEqual([]);
  });

  it("returns nothing for no results", () => {
    expect(selectRelevant([])).toEqual([]);
  });

  it("accepts a best chunk exactly at the minimum score", () => {
    expect(selectRelevant(scored(0.4))).toHaveLength(1);
  });

  it("drops chunks far below the best one", () => {
    // Real case from G1: 0.70 then 0.42, 0.41.
    expect(selectRelevant(scored(0.7, 0.42, 0.41)).map((r) => r.score)).toEqual([0.7]);
  });

  it("keeps chunks within the relevance window, in order", () => {
    expect(selectRelevant(scored(0.78, 0.71, 0.67, 0.5)).map((r) => r.score)).toEqual([0.78, 0.71, 0.67]);
  });
});

describe("isFallbackReply", () => {
  it("matches only the exact fallback message", () => {
    expect(isFallbackReply(FALLBACK_REPLY)).toBe(true);
    expect(isFallbackReply(`  ${FALLBACK_REPLY}\n`)).toBe(true);
    expect(isFallbackReply(`${FALLBACK_REPLY} Posso dirti che...`)).toBe(false);
    expect(isFallbackReply("Hai 3 giorni.")).toBe(false);
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
