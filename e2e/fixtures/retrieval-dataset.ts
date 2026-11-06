// Dataset for TC-11. Questions come from .claude/docs/chat-test-questions.md (section 1) and the
// examples in the QA tracker; `fonteAttesa` is the `id` in the frontmatter of knowledge/*.md.
// TODO: replace/extend with the rows of the "Domande di Test" sheet (types "Diretta" and "Parafrasata").

export type RetrievalCase = {
  tipo: "Diretta" | "Parafrasata";
  domanda: string;
  fonteAttesa: string;
};

export const RETRIEVAL_DATASET: RetrievalCase[] = [
  // Sinistri auto
  { tipo: "Diretta", domanda: "Come si denuncia un incidente con l'auto?", fonteAttesa: "sinistri-auto-denuncia" },
  { tipo: "Diretta", domanda: "Come faccio ad aprire un sinistro auto dopo un incidente?", fonteAttesa: "sinistri-auto-denuncia" },
  { tipo: "Parafrasata", domanda: "Ho fatto un incidente ieri, come lo segnalo all'assicurazione?", fonteAttesa: "sinistri-auto-denuncia" },
  { tipo: "Diretta", domanda: "Quanto tempo ho per denunciare un sinistro?", fonteAttesa: "sinistri-auto-denuncia" },
  { tipo: "Diretta", domanda: "Quando viene fatta la perizia?", fonteAttesa: "sinistri-auto-perizia" },
  { tipo: "Diretta", domanda: "Posso scegliere io la carrozzeria?", fonteAttesa: "sinistri-auto-perizia" },
  // Rimborsi
  { tipo: "Diretta", domanda: "Quanto tempo ci vuole per il risarcimento?", fonteAttesa: "rimborsi-tempi" },
  { tipo: "Parafrasata", domanda: "Dopo quanti giorni mi pagano il danno?", fonteAttesa: "rimborsi-tempi" },
  { tipo: "Diretta", domanda: "Cos'è la franchigia?", fonteAttesa: "rimborsi-franchigia" },
  // Polizza
  { tipo: "Diretta", domanda: "Come disdico la polizza?", fonteAttesa: "polizza-disdetta" },
  { tipo: "Parafrasata", domanda: "Voglio smettere di essere assicurato con voi, cosa devo fare?", fonteAttesa: "polizza-disdetta" },
  { tipo: "Diretta", domanda: "Come cambio il mio indirizzo?", fonteAttesa: "polizza-modifica-dati" },
  { tipo: "Diretta", domanda: "Come posso pagare il premio?", fonteAttesa: "polizza-pagamento-premio" },
  // Preventivo
  { tipo: "Diretta", domanda: "Cosa mi serve per un preventivo auto?", fonteAttesa: "preventivo-documenti" },
  { tipo: "Diretta", domanda: "Da cosa dipende il costo di una polizza casa?", fonteAttesa: "preventivo-costo-casa" },
  // Sinistri casa
  { tipo: "Diretta", domanda: "Mi hanno rubato in casa, cosa devo fare?", fonteAttesa: "sinistri-casa-furto" },
  { tipo: "Parafrasata", domanda: "Sono entrati i ladri nel mio appartamento, come procedo?", fonteAttesa: "sinistri-casa-furto" },
];
