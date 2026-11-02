import { describe, expect, it } from "vitest";

import { buildEmbeddingInput } from "@/lib/embed";

describe("buildEmbeddingInput", () => {
  it("joins title, heading and content", () => {
    expect(buildEmbeddingInput({ title: "Titolo" }, { heading: "Sezione", content: "Testo." })).toBe(
      "Titolo\n\nSezione\n\nTesto.",
    );
  });

  it("skips a missing heading", () => {
    expect(buildEmbeddingInput({ title: "Titolo" }, { heading: null, content: "Testo." })).toBe(
      "Titolo\n\nTesto.",
    );
  });
});
