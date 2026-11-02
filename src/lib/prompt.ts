import type { VectorStoreResult } from "@/lib/vector-store";

// Shown when the knowledge base has nothing relevant; kept here so the prompt
// and any threshold fallback (step G2) use the same wording.
export const FALLBACK_REPLY =
  "Non ho informazioni sufficienti per rispondere. Ti consiglio di contattare un operatore.";

// Kept short on purpose: every token of the system prompt is paid on each request.
const INSTRUCTIONS = `Sei l'assistente di una compagnia assicurativa. Rispondi in italiano, in modo breve e chiaro, usando SOLO le informazioni nel CONTESTO qui sotto. Se il contesto non contiene la risposta, rispondi: "${FALLBACK_REPLY}" Non inventare numeri, termini o condizioni.`;

export function buildSystemPrompt(chunks: VectorStoreResult[]): string {
  if (chunks.length === 0) {
    return `${INSTRUCTIONS}\n\nCONTESTO:\n(nessuna informazione disponibile)`;
  }

  const context = chunks
    .map((chunk, i) => {
      const label = chunk.heading ? `${chunk.documentTitle} - ${chunk.heading}` : chunk.documentTitle;
      return `[${i + 1}] ${label}\n${chunk.content}`;
    })
    .join("\n\n");

  return `${INSTRUCTIONS}\n\nCONTESTO:\n${context}`;
}
