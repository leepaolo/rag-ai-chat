import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/db/schema.sqlite";
import { cosineSimilarity, createSqliteVectorStore } from "@/lib/vector-store.sqlite";

describe("cosineSimilarity", () => {
  it("is 1 for identical direction, 0 for orthogonal, -1 for opposite", () => {
    expect(cosineSimilarity([1, 2], [2, 4])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  it("returns 0 for a zero vector", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });

  it("throws on size mismatch", () => {
    expect(() => cosineSimilarity([1], [1, 2])).toThrow(/mismatch/);
  });
});

describe("createSqliteVectorStore", () => {
  let store: ReturnType<typeof createSqliteVectorStore>;

  beforeEach(() => {
    const sqlite = new Database(":memory:");
    sqlite.exec(`
      CREATE TABLE documents (
        id text PRIMARY KEY NOT NULL, category text NOT NULL, product text,
        last_updated text, source_url text, title text NOT NULL
      );
      CREATE TABLE chunks (
        id text PRIMARY KEY NOT NULL,
        document_id text NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        position integer NOT NULL, heading text, content text NOT NULL, embedding text NOT NULL
      );
    `);
    const db = drizzle(sqlite, { schema });

    db.insert(schema.documents)
      .values([
        { id: "auto-doc", category: "sinistri", product: "auto", title: "Auto", sourceUrl: "https://x/auto" },
        { id: "casa-doc", category: "polizza", product: "casa", title: "Casa" },
      ])
      .run();
    db.insert(schema.chunks)
      .values([
        { id: "a#0", documentId: "auto-doc", position: 0, heading: "A0", content: "x-axis", embedding: [1, 0] },
        { id: "a#1", documentId: "auto-doc", position: 1, heading: "A1", content: "diagonal", embedding: [1, 1] },
        { id: "c#0", documentId: "casa-doc", position: 0, heading: null, content: "y-axis", embedding: [0, 1] },
      ])
      .run();

    store = createSqliteVectorStore(db);
  });

  it("returns chunks ranked by similarity with document metadata", async () => {
    const results = await store.query([1, 0], 3);

    expect(results.map((r) => r.chunkId)).toEqual(["a#0", "a#1", "c#0"]);
    expect(results[0]).toMatchObject({
      documentTitle: "Auto",
      category: "sinistri",
      product: "auto",
      sourceUrl: "https://x/auto",
    });
    expect(results[0].score).toBeCloseTo(1);
    expect(results[2].sourceUrl).toBeNull();
  });

  it("limits results to topK", async () => {
    expect(await store.query([1, 0], 1)).toHaveLength(1);
  });

  it("filters by category and product", async () => {
    const byCategory = await store.query([1, 0], 5, { category: "polizza" });
    expect(byCategory.map((r) => r.chunkId)).toEqual(["c#0"]);

    const byProduct = await store.query([0, 1], 5, { product: "auto" });
    expect(byProduct.map((r) => r.documentId)).toEqual(["auto-doc", "auto-doc"]);

    expect(await store.query([1, 0], 5, { category: "sinistri", product: "casa" })).toEqual([]);
  });
});
