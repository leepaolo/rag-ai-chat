import type { UIMessage } from "ai";

import { FALLBACK_REPLY } from "@/lib/prompt";
import type { VectorStoreResult } from "@/lib/vector-store";

export const MAX_QUESTION_LENGTH = 1000;
export const TOP_K = 3;
// Tuned on the 14 validation questions (plan, step G1): legit questions had a
// top-1 score >= 0.49, clearly off-topic ones <= 0.35. Revisit if the knowledge
// base or the embedding model changes.
export const MIN_TOP_SCORE = 0.4;
// Chunks further than this below the best one are noise (e.g. 0.41 after 0.70).
export const RELEVANCE_WINDOW = 0.15;
// Low on purpose: a FAQ answer is short and output tokens cost ~5x input.
export const MAX_OUTPUT_TOKENS = 400;

export type ChatSource = {
  documentId: string;
  title: string;
  heading: string | null;
  sourceUrl: string | null;
};

export type ChatMetadata = { sources: ChatSource[] };

/** Text of the most recent user message, or null if there is none. */
export function lastUserText(messages: UIMessage[]): string | null {
  const last = messages.findLast((message) => message.role === "user");
  if (!last) return null;
  const text = last.parts
    .flatMap((part) => (part.type === "text" ? [part.text] : []))
    .join("\n")
    .trim();
  return text || null;
}

export type GroupedSource = {
  documentId: string;
  title: string;
  sourceUrl: string | null;
  headings: string[];
};

/**
 * Keeps the chunks worth showing to the model. Returns [] when even the best
 * chunk is below MIN_TOP_SCORE, meaning the question is outside the knowledge base.
 * Expects `results` sorted best first, as `VectorStore.query` returns them.
 */
export function selectRelevant(results: VectorStoreResult[]): VectorStoreResult[] {
  const best = results[0]?.score;
  if (best === undefined || best < MIN_TOP_SCORE) return [];
  return results.filter((result) => result.score >= best - RELEVANCE_WINDOW);
}

/** True when the answer is exactly the "no information" reply: its sources would mislead. */
export function isFallbackReply(text: string): boolean {
  return text.trim() === FALLBACK_REPLY;
}

/** Collapses chunk-level sources into one entry per document, keeping rank order. */
export function groupSources(sources: ChatSource[]): GroupedSource[] {
  const byDocument = new Map<string, GroupedSource>();
  for (const source of sources) {
    const group = byDocument.get(source.documentId) ?? {
      documentId: source.documentId,
      title: source.title,
      sourceUrl: source.sourceUrl,
      headings: [],
    };
    if (source.heading && !group.headings.includes(source.heading)) group.headings.push(source.heading);
    byDocument.set(source.documentId, group);
  }
  return [...byDocument.values()];
}

/** One entry per retrieved chunk, in rank order, for citations in the UI. */
export function toSources(results: VectorStoreResult[]): ChatSource[] {
  return results.map((result) => ({
    documentId: result.documentId,
    title: result.documentTitle,
    heading: result.heading,
    sourceUrl: result.sourceUrl,
  }));
}
