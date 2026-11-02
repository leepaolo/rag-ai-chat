import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";

import type { NewChunk, NewDocument } from "@/db/schema.sqlite";

export const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Text sent to the embedding API for a chunk. The body alone can lack context
 * (e.g. "Entro quanto tempo va denunciato"), so title and heading are prepended.
 */
export function buildEmbeddingInput(
  document: Pick<NewDocument, "title">,
  chunk: Pick<NewChunk, "heading" | "content">,
): string {
  return [document.title, chunk.heading, chunk.content].filter(Boolean).join("\n\n");
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const { embeddings } = await embedMany({
    model: openai.embedding(EMBEDDING_MODEL),
    values: texts,
  });
  return embeddings;
}
