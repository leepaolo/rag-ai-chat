// Manual smoke test of retrieval against the real knowledge.db. Makes one paid
// embeddings call, so it is not part of `pnpm test`. Run with: pnpm check:retrieval
import { db } from "@/db/client";
import { embedTexts } from "@/lib/embed";
import { createSqliteVectorStore } from "@/lib/vector-store.sqlite";

const CASES = [
  { query: "Entro quanto tempo devo denunciare un incidente con l'auto?", expected: "sinistri-auto-denuncia" },
  { query: "Come disdico la mia assicurazione?", expected: "polizza-disdetta" },
  { query: "Quanto ci mette il bonifico del risarcimento?", expected: "rimborsi-tempi" },
  { query: "Che documenti servono per fare un preventivo per la macchina?", expected: "preventivo-documenti" },
  { query: "Mi hanno rubato in casa, cosa devo fare?", expected: "sinistri-casa-furto" },
];

async function main() {
  const store = createSqliteVectorStore(db);
  const embeddings = await embedTexts(CASES.map((c) => c.query));
  let failures = 0;

  for (const [i, { query, expected }] of CASES.entries()) {
    const results = await store.query(embeddings[i], 3);
    const ok = results[0]?.documentId === expected;
    if (!ok) failures++;
    console.log(`\n${ok ? "OK  " : "FAIL"} ${query}  (atteso: ${expected})`);
    for (const r of results) {
      console.log(`  ${r.score.toFixed(3)}  ${r.documentId} / ${r.heading ?? "-"}`);
    }
  }

  // Filter check: a policy question restricted to "sinistri" must not return policy chunks.
  const filtered = await store.query(embeddings[1], 3, { category: "sinistri" });
  const filterOk = filtered.length > 0 && filtered.every((r) => r.category === "sinistri");
  if (!filterOk) failures++;
  console.log(`\n${filterOk ? "OK  " : "FAIL"} filtro category=sinistri: ${filtered.map((r) => r.documentId).join(", ")}`);

  if (failures > 0) {
    console.error(`\n${failures} controlli falliti.`);
    process.exit(1);
  }
  console.log("\nTutti i controlli superati.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
