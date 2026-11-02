export type VectorStoreFilter = {
  category?: string;
  product?: string;
};

export type VectorStoreResult = {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  heading: string | null;
  content: string;
  category: string;
  product: string | null;
  sourceUrl: string | null;
  /** Cosine similarity in [-1, 1]; higher is closer. */
  score: number;
};

/** Backend-agnostic retrieval: SQLite in JS today, pgvector from phase H. */
export interface VectorStore {
  /** Returns up to `topK` chunks most similar to `embedding`, best first. */
  query(
    embedding: number[],
    topK: number,
    filter?: VectorStoreFilter,
  ): Promise<VectorStoreResult[]>;
}
