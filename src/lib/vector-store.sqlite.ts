import { and, eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "@/db/schema.sqlite";
import type { VectorStore, VectorStoreFilter, VectorStoreResult } from "@/lib/vector-store";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Embedding size mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Loads every matching chunk and scores it in JS: fine for a few hundred
// chunks, replaced by pgvector in phase H.
export function createSqliteVectorStore(db: BetterSQLite3Database<typeof schema>): VectorStore {
  return {
    async query(embedding: number[], topK: number, filter?: VectorStoreFilter) {
      const conditions = [
        filter?.category ? eq(schema.documents.category, filter.category) : undefined,
        filter?.product ? eq(schema.documents.product, filter.product) : undefined,
      ];

      const rows = db
        .select({
          chunkId: schema.chunks.id,
          documentId: schema.chunks.documentId,
          documentTitle: schema.documents.title,
          heading: schema.chunks.heading,
          content: schema.chunks.content,
          category: schema.documents.category,
          product: schema.documents.product,
          sourceUrl: schema.documents.sourceUrl,
          embedding: schema.chunks.embedding,
        })
        .from(schema.chunks)
        .innerJoin(schema.documents, eq(schema.chunks.documentId, schema.documents.id))
        .where(and(...conditions))
        .all();

      return rows
        .map(({ embedding: chunkEmbedding, ...row }): VectorStoreResult => ({
          ...row,
          score: cosineSimilarity(embedding, chunkEmbedding),
        }))
        .sort((x, y) => y.score - x.score)
        .slice(0, topK);
    },
  };
}
