import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { chunkMarkdown } from "@/lib/chunk";

const SAMPLE = `---
id: demo
category: sinistri
product: auto
last_updated: 2026-11-02
source_url: https://example.com/demo
---

# Titolo demo

## Prima sezione

Testo uno.

## Seconda sezione

Testo due.
`;

describe("chunkMarkdown", () => {
  it("maps frontmatter and title to the document", () => {
    const { document } = chunkMarkdown(SAMPLE);

    expect(document).toEqual({
      id: "demo",
      category: "sinistri",
      title: "Titolo demo",
      product: "auto",
      lastUpdated: "2026-11-02",
      sourceUrl: "https://example.com/demo",
    });
  });

  it("splits the body into one chunk per ## section", () => {
    const { chunks } = chunkMarkdown(SAMPLE);

    expect(chunks).toEqual([
      { id: "demo#0", documentId: "demo", position: 0, heading: "Prima sezione", content: "Testo uno." },
      { id: "demo#1", documentId: "demo", position: 1, heading: "Seconda sezione", content: "Testo due." },
    ]);
  });

  it("keeps text before the first ## as a chunk without heading", () => {
    const raw = SAMPLE.replace("## Prima sezione", "Introduzione.\n\n## Prima sezione");
    const { chunks } = chunkMarkdown(raw);

    expect(chunks.map((c) => c.heading)).toEqual([null, "Prima sezione", "Seconda sezione"]);
    expect(chunks[0].content).toBe("Introduzione.");
  });

  it("drops empty sections", () => {
    const { chunks } = chunkMarkdown(SAMPLE.replace("Testo uno.", ""));

    expect(chunks.map((c) => c.heading)).toEqual(["Seconda sezione"]);
    expect(chunks[0].position).toBe(0);
  });

  it("leaves optional frontmatter fields null", () => {
    const raw = "---\nid: min\ncategory: polizza\n---\n\n# Min\n\n## A\n\nTesto.\n";
    const { document } = chunkMarkdown(raw);

    expect(document.product).toBeNull();
    expect(document.lastUpdated).toBeNull();
    expect(document.sourceUrl).toBeNull();
  });

  it("throws on missing required fields, naming the source", () => {
    expect(() => chunkMarkdown("---\ncategory: x\n---\n\n# T\n", "a.md")).toThrow(/a\.md.*"id"/);
    expect(() => chunkMarkdown("---\nid: x\n---\n\n# T\n", "b.md")).toThrow(/b\.md.*"category"/);
    expect(() => chunkMarkdown("---\nid: x\ncategory: y\n---\n\nsenza titolo\n", "c.md")).toThrow(/title/);
  });

  it("chunks every file in knowledge/ with unique ids", () => {
    const dir = path.resolve(import.meta.dirname, "../../knowledge");
    const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
    const results = files.map((f) => chunkMarkdown(readFileSync(path.join(dir, f), "utf8"), f));

    expect(files.length).toBeGreaterThanOrEqual(8);
    for (const { chunks } of results) expect(chunks.length).toBeGreaterThan(0);
    const ids = results.map((r) => r.document.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
