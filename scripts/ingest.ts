// Run with: pnpm tsx --env-file=.env.local scripts/ingest.ts (the npm script comes in step C3).
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { eq, notInArray } from "drizzle-orm";

import { db } from "@/db/client";
import { chunks, documents } from "@/db/schema.sqlite";
import { chunkMarkdown } from "@/lib/chunk";
import { buildEmbeddingInput, embedTexts } from "@/lib/embed";

const KNOWLEDGE_DIR = path.resolve(process.cwd(), "knowledge");

function listMarkdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set: run this script pass --env-file=.env.local to tsx.");
  }

  const files = listMarkdownFiles(KNOWLEDGE_DIR);
  const parsed = files.map((file) =>
    chunkMarkdown(readFileSync(file, "utf8"), path.relative(process.cwd(), file)),
  );

  const ids = parsed.map(({ document }) => document.id);
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate document ids in knowledge/.");

  const inputs = parsed.flatMap(({ document, chunks: docChunks }) =>
    docChunks.map((chunk) => buildEmbeddingInput(document, chunk)),
  );
  console.log(`Embedding ${inputs.length} chunks from ${parsed.length} documents...`);
  const embeddings = await embedTexts(inputs);

  // Replace each document's chunks in one transaction; drop documents removed from disk.
  let next = 0;
  db.transaction((tx) => {
    for (const { document, chunks: docChunks } of parsed) {
      tx.insert(documents).values(document).onConflictDoUpdate({ target: documents.id, set: document }).run();
      tx.delete(chunks).where(eq(chunks.documentId, document.id)).run();
      for (const chunk of docChunks) {
        tx.insert(chunks).values({ ...chunk, embedding: embeddings[next++] }).run();
      }
    }
    tx.delete(documents).where(notInArray(documents.id, ids)).run();
  });

  console.log(`Done: ${parsed.length} documents, ${inputs.length} chunks written to knowledge.db.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
