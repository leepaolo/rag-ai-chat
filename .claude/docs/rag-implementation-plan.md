# Piano di implementazione RAG

Percorso step-by-step per passare dallo scaffold attuale a un assistente RAG funzionante, prima in locale (SQLite), poi su Neon (Postgres + pgvector) e Vercel.

**Convenzione**: ogni step = un commit. Niente commit che accorpano più step: se un step si rivela troppo grande, va diviso in sotto-step (es. `3a`, `3b`), ognuno con il proprio commit. Lavorare su branch (vedi `CLAUDE.md`), mai direttamente su `main`.

Checklist: segna `[x]` quando il commit relativo è fatto. Aggiornare questo file nello stesso commit dello step, non in un commit separato.

---

## Scelta dei modelli Claude (ottimizzata per costo)

Importante: **Anthropic non ha un'API di embedding propria**. Lo step di embedding (Fase C2/D, e il calcolo dell'embedding della query in E2) va fatto con un provider dedicato (Voyage AI — partner consigliato da Anthropic — o OpenAI `text-embedding-3-small`), non con un modello Claude. I modelli Claude entrano in gioco solo dove c'è generazione o classificazione testuale.

Prezzi per milione di token (da verificare su [anthropic.com/pricing](https://www.anthropic.com/pricing) al momento dell'implementazione — cambiano nel tempo):

| Modello           | Input $/MTok | Output $/MTok | Uso tipico qui                                             |
| ----------------- | ------------ | ------------- | ---------------------------------------------------------- |
| Claude Haiku 5.5  | 0.10         | 0.50          | classificazione intento, re-ranking, risposte FAQ semplici |
| Claude Sonnet 5   | 2.00         | 10.00         | generazione risposta principale (default)                  |
| Claude Sonnet 5.5 | 2.00         | 10.00         | alternativa a Sonnet 5, stesso costo                       |
| Claude Opus 5.5   | 4.00         | 20.00         | solo per casi ambigui/escalation, non per il flusso base   |

Strategia di costo per un bot FAQ assicurativo (volume alto, domande per lo più semplici):

1. **Step E2 (API chat, flusso principale)**: `claude-sonnet-5` — buon equilibrio qualità/costo per rispondere sulla base dei chunk recuperati. È il default per tutta la Fase E/F.
2. **Routing/classificazione intento** (opzionale, se introdotto per filtrare per categoria prima della similarity search): `claude-sonnet-5` — task banale (quale categoria?), non serve Sonnet. Risparmio netto perché è una chiamata extra per ogni messaggio.
3. **Re-ranking dei chunk** (opzionale, nota al punto 5 della spiegazione RAG): `claude-sonnet-5` — riordinare 10 chunk è un task semplice, Sonnet sarebbe sprecato.
4. **Fallback/escalation** (domanda fuori dominio o che il modello segnala come incerta): si può alzare a `claude-sonnet-5` o, in casi rari, `claude-opus-5-5` solo per quella singola richiesta — non come default.
5. **Ingestion (Fase C)**: se in futuro si usa un LLM anche per arricchire/taggare i chunk in automatico (non previsto nel piano base, ma possibile estensione), usare `claude-sonnet-5` — è un task offline, non real-time, non serve un modello costoso.

Altri accorgimenti per il costo, indipendenti dal modello scelto:

- **Prompt caching**: se il system prompt (istruzioni + eventuali chunk ricorrenti) è stabile tra richieste, usare il prompt caching dell'API Claude per non ripagare gli stessi token a ogni chiamata.
- **System prompt corto**: le istruzioni anti-allucinazione (E1) vanno scritte concise — ogni token del system prompt si paga a ogni richiesta.
- **`max_tokens` basso** sulle risposte: un bot FAQ non ha bisogno di risposte lunghe; limitare l'output riduce la voce di costo più cara (output token costano 5x l'input).
- Rivedere scelte e prezzi prima del deploy in produzione (Fase I): i listini modello/prezzo di Anthropic possono cambiare.

---

## Fase A — Setup base

- [ ] **A1. Dipendenze core**
      Installare `ai`, `@ai-sdk/openai` (o provider scelto), `drizzle-orm`, `better-sqlite3`, `gray-matter`, `drizzle-kit` (dev), `@types/better-sqlite3` (dev).
      Commit: `chore: add RAG pipeline dependencies`

- [ ] **A2. Struttura cartelle**
      Creare `knowledge/` (vuota, con `.gitkeep`), `scripts/`, `src/db/`, `src/lib/`. Aggiungere `knowledge.db` e `*.db` a `.gitignore`.
      Commit: `chore: scaffold RAG folder structure`

- [ ] **A3. Env var e config**
      Creare `.env.example` con le chiavi necessarie (es. `OPENAI_API_KEY`, `VECTOR_STORE_DRIVER=sqlite`, `DATABASE_URL` per dopo). Nessuna chiave reale committata.
      Commit: `chore: add env var template for RAG config`

## Fase B — Schema dati e knowledge base

- [ ] **B1. Schema Drizzle (SQLite)**
      `src/db/schema.sqlite.ts` con tabelle `documents` e `chunks` (embedding come blob/JSON).
      Commit: `feat: add drizzle schema for documents and chunks (sqlite)`

- [ ] **B2. Client DB**
      `src/db/client.ts`: istanzia il client in base a `VECTOR_STORE_DRIVER`.
      Commit: `feat: add db client factory`

- [ ] **B3. Prime FAQ di test**
      Scrivere 8-10 file `.md` reali in `knowledge/` (es. sinistri auto, tempi di rimborso, disdetta polizza, documenti per preventivo), con frontmatter (`id`, `category`, `product`, `last_updated`, `source_url`).
      Commit: `content: add initial insurance FAQ knowledge base`

## Fase C — Ingestion

- [ ] **C1. Chunking**
      `src/lib/chunk.ts`: parsing frontmatter con `gray-matter` + split del body per heading `##`.
      Commit: `feat: add markdown chunking logic`

- [ ] **C2. Script di ingestion**
      `scripts/ingest.ts`: legge `knowledge/**/*.md`, chunka, chiama l'API di embedding, upsert su SQLite. Eseguibile con `pnpm tsx scripts/ingest.ts`.
      Commit: `feat: add ingestion script`

- [ ] **C3. Prima esecuzione e verifica**
      Eseguire l'ingestion, verificare a mano (query SQL diretta) che `documents`/`chunks` siano popolate correttamente. Aggiungere script npm `"ingest": "tsx scripts/ingest.ts"`.
      Commit: `chore: add ingest npm script`

## Fase D — Retrieval

- [ ] **D1. Interfaccia VectorStore**
      `src/lib/vector-store.ts`: interfaccia `VectorStore` (`query(embedding, topK, filter?)`).
      Commit: `feat: define VectorStore interface`

- [ ] **D2. Implementazione SQLite**
      `src/lib/vector-store.sqlite.ts`: carica i chunk (con filtro opzionale per categoria), calcola cosine similarity in JS, ritorna top-K.
      Commit: `feat: implement sqlite vector store with cosine similarity`

- [ ] **D3. Test manuale del retrieval**
      Script temporaneo o test in `src/lib/vector-store.test.ts` che verifica che una query di esempio ritorni i chunk attesi.
      Commit: `test: add retrieval smoke test`

## Fase E — Generazione e API

- [ ] **E1. Prompt building**
      `src/lib/prompt.ts`: costruisce il system prompt con i chunk recuperati + istruzione anti-allucinazione ("rispondi solo con queste informazioni, altrimenti invita a contattare un operatore"). Tenere il prompt corto (si paga a ogni richiesta).
      Commit: `feat: add RAG prompt builder`

- [ ] **E2. API route di chat**
      `src/app/api/chat/route.ts`: riceve messaggio → embed query (Voyage/OpenAI, non Claude) → `vectorStore.query` → prompt → `streamText` dell'AI SDK.
      **Modello: `claude-sonnet-5`** (vedi "Scelta dei modelli Claude" sopra). Impostare un `max_tokens` basso, output costa ~5x l'input.
      Commit: `feat: add chat API route with RAG pipeline`

## Fase F — UI di test

- [ ] **F1. Pagina assistente**
      `src/app/assistente/page.tsx`: UI minimale con `useChat` dell'AI SDK (input + lista messaggi, nessuno styling elaborato).
      Commit: `feat: add test chat page`

- [ ] **F2. Visualizzazione fonti**
      Mostrare sotto ogni risposta i chunk/fonti usati (`source_url` dal frontmatter), per trust e debug.
      Commit: `feat: show source citations in chat UI`

## Fase G — Validazione e tuning

- [ ] **G1. Validazione manuale**
      Verificare domande dirette, domande fuori dominio, domande ambigue tra categorie. Annotare risultati in questo file o in `session-log.md`.
      Commit: `docs: record manual validation results`

- [ ] **G2. Tuning soglie**
      Tarare `topK` e soglia minima di similarity (sotto soglia → risposta di fallback invece di forzare una risposta).
      Commit: `fix: tune topK and similarity threshold based on validation`

## Fase H — Migrazione a Neon (Postgres + pgvector)

- [ ] **H1. Setup Neon**
      Creare progetto Neon, abilitare estensione `pgvector`, aggiungere `DATABASE_URL` reale a `.env` (locale, non committato).
      Commit: _(nessun commit di codice — solo setup esterno; annotare in `session-log.md`)_

- [ ] **H2. Driver Postgres**
      Installare `@neondatabase/serverless`. Creare `src/db/schema.pg.ts` (stessi campi di `schema.sqlite.ts`, tipo `embedding` come `vector`).
      Commit: `feat: add drizzle schema for postgres/pgvector`

- [ ] **H3. Migration**
      Generare ed eseguire la migration con `drizzle-kit` contro Neon.
      Commit: `chore: add pgvector migration`

- [ ] **H4. Implementazione PgVectorStore**
      `src/lib/vector-store.pg.ts`: stessa interfaccia `VectorStore`, query con `ORDER BY embedding <-> $1` (pgvector).
      Commit: `feat: implement postgres vector store`

- [ ] **H5. Switch driver e re-ingestion**
      Aggiornare `src/db/client.ts` e `vector-store` factory per leggere `VECTOR_STORE_DRIVER=postgres`. Ri-eseguire `scripts/ingest.ts` puntato a Neon.
      Commit: `feat: wire up postgres driver selection and re-run ingestion`

## Fase I — Deploy

- [ ] **I1. Env var su Vercel**
      Configurare `DATABASE_URL`, chiave API LLM e `VECTOR_STORE_DRIVER=postgres` nelle env var del progetto Vercel.
      Commit: _(nessun commit di codice — annotare in `session-log.md`)_

- [ ] **I2. Deploy e smoke test**
      Deploy su Vercel, verifica end-to-end in produzione (embedding + retrieval + generazione), controllo latenza.
      Commit: `docs: record production deploy and smoke test results`

---

## Note

- Ogni step che tocca `src/lib/` dovrebbe avere un test unitario (vedi `.claude/rules/testing.md` — framework ancora TODO, da scegliere prima della Fase C/D se si vuole testare da subito).
- Non committare mai `.env`, `knowledge.db`, o chiavi API (vedi guardrail `secret-scan.sh`).
- A fine sessione, aggiungere sempre una entry in `.claude/docs/session-log.md` oltre a spuntare gli step qui.
- Durante implementazione step controlla sempre il modello. Se non corrisponde a come indicato ricorda di cambiarlo.

## Dove va messo

`.claude/docs/rag-implementation-plan.md` — stessa cartella di `session-log.md`, già citata in `CLAUDE.md` come posto per la documentazione di processo.
