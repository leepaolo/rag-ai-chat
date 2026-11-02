import matter from "gray-matter";

import type { NewChunk, NewDocument } from "@/db/schema.sqlite";

export type ChunkedDocument = {
  document: NewDocument;
  chunks: Omit<NewChunk, "embedding">[];
};

const H1 = /^# +(.+)$/m;
const H2_SPLIT = /^## +(.+)$/m;

// YAML parses an unquoted `2026-11-02` into a Date; keep it as a plain string.
function asString(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" || typeof value === "number") return String(value);
  return null;
}

function requireString(data: Record<string, unknown>, key: string, source: string): string {
  const value = asString(data[key]);
  if (!value) throw new Error(`${source}: missing frontmatter field "${key}"`);
  return value;
}

/**
 * Parses a knowledge markdown file and splits its body into one chunk per `##`
 * section. Text between the `#` title and the first `##` becomes a chunk with
 * no heading. Embeddings are added later by the ingestion script.
 */
export function chunkMarkdown(raw: string, source = "document"): ChunkedDocument {
  const { data, content } = matter(raw);

  const id = requireString(data, "id", source);
  const category = requireString(data, "category", source);
  const title = H1.exec(content)?.[1].trim();
  if (!title) throw new Error(`${source}: missing "# title" heading`);

  const body = content.replace(H1, "");
  // With a capture group, split() alternates: [intro, heading1, body1, heading2, body2, ...].
  const parts = body.split(H2_SPLIT);

  const sections: { heading: string | null; content: string }[] = [
    { heading: null, content: parts[0].trim() },
  ];
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({ heading: parts[i].trim(), content: (parts[i + 1] ?? "").trim() });
  }

  const chunks = sections
    .filter((section) => section.content.length > 0)
    .map((section, position) => ({
      id: `${id}#${position}`,
      documentId: id,
      position,
      heading: section.heading,
      content: section.content,
    }));

  return {
    document: {
      id,
      category,
      title,
      product: asString(data.product),
      lastUpdated: asString(data.last_updated),
      sourceUrl: asString(data.source_url),
    },
    chunks,
  };
}
