import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// One row per knowledge/*.md file; columns mirror its frontmatter.
export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  product: text("product"),
  lastUpdated: text("last_updated"),
  sourceUrl: text("source_url"),
  title: text("title").notNull(),
});

// One row per `##` section of a document. The embedding is stored as JSON
// (number[]); similarity is computed in JS, so no native vector type is needed.
export const chunks = sqliteTable(
  "chunks",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    heading: text("heading"),
    content: text("content").notNull(),
    embedding: text("embedding", { mode: "json" }).$type<number[]>().notNull(),
  },
  (table) => [index("chunks_document_id_idx").on(table.documentId)],
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
