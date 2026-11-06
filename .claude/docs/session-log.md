# Session log

Running log of Claude Code sessions. Append a new entry at the **top** at the end of each session that changed something. Keep entries short; link files rather than pasting code.

Format:

```markdown
## YYYY-MM-DD: <one-line title>

**Changed**
- <file or area>: <what changed>

**Why**
- <motivation / decision taken, alternatives rejected>

**Next**
- [ ] <follow-up task>
```

---

## 2026-10-30: Adopt MailCheap design system tokens

**Changed**
- `src/app/globals.css`: color, shadow, type-scale and radius tokens from the design system artifact, as Tailwind v4 theme variables (light + dark).
- `src/app/layout.tsx`: load Newsreader (`font-display`); body defaults to `font-sans text-body`.
- `src/app/page.tsx`: swapped removed `bg-foreground`/`text-background` for `bg-primary`/`text-primary-ink`.
- `.claude/rules/design-system.md`: token-to-utility table and usage rules.

**Why**
- The artifact (https://claude.ai/artifact/2KWZA1Mxh9jaQAqiLsPBZd) is the source of truth; the CSS mirrors it so components use tokens, not raw values.

**Next**
- [ ] Replace the starter `page.tsx` (still uses `zinc-*` classes) with the chat UI built on tokens.
- [ ] Decide on a component library (shadcn/ui fits the token naming).

## 2026-10-30: TODO placeholder entry (replace me)

**Changed**
- `.claude/`: scaffolded settings, hooks, guardrails, skills, rules, and this log.
- `CLAUDE.md`, `.mcp.json`: project guidance and placeholder MCP servers.

**Why**
- Establish a shared Claude Code setup (permissions, guardrails, rules) before feature work starts.

**Next**
- [ ] Choose LLM provider, embedding model, and vector store; record them in `CLAUDE.md`.
- [ ] Set up a test runner and add an `npm test` script (see `.claude/rules/testing.md`).
- [ ] Fill in or remove the placeholder MCP servers in `.mcp.json`.

## 2026-10-30: Switch package manager to pnpm

**Changed**
- `pnpm-lock.yaml` replaces `package-lock.json` (converted with `pnpm import`, so locked versions are unchanged).
- `package.json`: added `"packageManager": "pnpm@10.25.0"`.
- `CLAUDE.md`, `README.md`, `.claude/rules/*`, `.claude/skills/pr-creation/SKILL.md`: commands now use pnpm.

**Why**
- The team prefers pnpm.

**Next**
- [ ] Update `.claude/settings.json` permissions (`npm run *`, `npx tsc`) to the pnpm equivalents; optionally switch the hooks to `pnpm exec`.
- [ ] Decide on `pnpm approve-builds` for `unrs-resolver` (its build script was skipped).

## 2026-10-31: Publish repo to GitHub and open first PR

**Changed**
- Added remote `origin` (https://github.com/leepaolo/rag-ai-chat) and pushed `main` (initial commit) and `chore/switch-to-pnpm`.
- Opened PR #1: chore: switch to pnpm and add Claude Code project setup.

**Why**
- Get the scaffold and the shared Claude Code setup reviewed and merged via PR.

**Next**
- [x] Set the GitHub default branch to `main` (GitHub picked `chore/switch-to-pnpm` because it was pushed first).
- [ ] Merge PR #2 (replaces #1, which closed when the branch was renamed to `dev-01`).

## 2026-11-02: RAG plan step A1 (core dependencies)

**Changed**
- Added `ai`, `@ai-sdk/openai`, `drizzle-orm`, `better-sqlite3`, `gray-matter` and dev `drizzle-kit`, `@types/better-sqlite3` on branch `feat/rag-pipeline`.
- Marked A1 done in `.claude/docs/rag-implementation-plan.md`.

**Why**
- First step of the RAG implementation plan.

**Next**
- [ ] Run `pnpm approve-builds` for `better-sqlite3` (its native build script was skipped; needed before B2/C2 can open a DB).
- [ ] A2: folder structure.

## 2026-11-02: RAG plan step A2 (folder structure)

**Changed**
- Created `knowledge/`, `scripts/`, `src/db/`, `src/lib/` (each with `.gitkeep`).
- `.gitignore`: added `knowledge.db` and `*.db`.
- Marked A2 done in the RAG plan.

**Next**
- [ ] A3: `.env.example`.

## 2026-11-02: RAG plan step A3 (env template)

**Changed**
- Env template file added (created by the user, since writes to it are denied to Claude), plus a gitignore exception so the broad env-file pattern does not ignore it.
- Marked A3 done in the RAG plan; Phase A complete.

**Why**
- Document the config keys needed by the RAG pipeline without committing real values.

**Next**
- [ ] B1: Drizzle SQLite schema.

## 2026-11-02: RAG plan step B1 (Drizzle SQLite schema)

**Changed**
- Added `src/db/schema.sqlite.ts` with `documents` (frontmatter fields plus title) and `chunks` (document FK with cascade delete, position, heading, content, JSON embedding).
- Marked B1 done in the RAG plan. `tsc --noEmit` and ESLint pass.

**Next**
- [ ] B2: db client factory (`src/db/client.ts`); needs `pnpm approve-builds` for `better-sqlite3` first.

## 2026-11-02: RAG plan step B2 (db client factory)

**Changed**
- Added `src/db/client.ts`: picks the driver from `VECTOR_STORE_DRIVER` (default `sqlite`, file `knowledge.db`), reuses the connection across dev hot reloads, throws on unsupported drivers (postgres comes in H5).
- Marked B2 done in the RAG plan. `tsc --noEmit` and ESLint pass.
- `pnpm approve-builds` had nothing pending; `better-sqlite3` loads fine despite being in `ignoredBuiltDependencies`.

**Next**
- [ ] Tables are not created anywhere yet; decide how before C2 (e.g. `drizzle-kit push` with a `drizzle.config.ts`).
- [ ] B3: first FAQ markdown files.

## 2026-11-02: RAG plan step B3 (initial FAQ knowledge base)

**Changed**
- Added 10 Italian FAQ files in `knowledge/` (categories: sinistri, rimborsi, polizza, preventivo; products: auto, casa), each with frontmatter, an H1 title and `##` sections.
- Marked B3 done in the RAG plan; Phase B complete.

**Why**
- Test content for chunking, ingestion and retrieval.

**Next**
- [ ] The FAQ content is invented and `source_url` values are `example.com` placeholders: replace with real content and URLs before production.
- [ ] C1: chunking logic (`src/lib/chunk.ts`).

## 2026-11-02: RAG plan step B4 (drizzle config, table creation)

**Changed**
- Added `drizzle.config.ts` (sqlite, `knowledge.db`) and npm scripts `db:push` and `db:studio`; added B4 to the RAG plan as a sub-step between B3 and C.
- Ran `pnpm db:push`: `knowledge.db` now has the empty `documents` and `chunks` tables (file is gitignored).
- To inspect: `sqlite3 knowledge.db` or `pnpm db:studio`.

**Next**
- [ ] C1: chunking logic (`src/lib/chunk.ts`); pick a test framework (Vitest proposed).

## 2026-11-02: RAG plan step C0 (Vitest)

**Changed**
- Installed `vitest` 5.0.5; added `vitest.config.ts` (node env, `@/` alias, `src/**/*.test.ts`) and scripts `test` (`vitest run --passWithNoTests`) and `test:watch`.
- Updated `.claude/rules/testing.md`; added C0 to the RAG plan. The pre-commit hook now runs `test` instead of the tsc + lint fallback.

**Next**
- [ ] C1: chunking logic with unit tests.
- [ ] pnpm printed a peer-dependency warning on install; not investigated.

## 2026-11-02: RAG plan step C1 (chunking)

**Changed**
- Added `src/lib/chunk.ts` (`chunkMarkdown(raw, source)`): parses frontmatter with `gray-matter`, takes the title from `# `, splits the body on `##` and returns `{ document, chunks }` (chunks without embedding). Chunk id is `<docId>#<position>`; empty sections are dropped; text before the first `##` becomes a heading-less chunk; missing `id`/`category`/title throws with the file name.
- Added `src/lib/chunk.test.ts` (7 tests, including a check that all files in `knowledge/` chunk cleanly with unique ids).
- Renamed `vitest.config.ts` to `.mts` (separate commit) to silence Vite's CommonJS warning.
- Marked C1 done in the RAG plan. Tests, `tsc --noEmit` and ESLint pass.

**Notes**
- Chunk `content` is the section body only; C2 should build the embedding input from title + heading + content, since a body alone can lack context.
- YAML parses unquoted dates into `Date`; `chunk.ts` converts them to `YYYY-MM-DD`.

**Next**
- [ ] C2: ingestion script (needs `OPENAI_API_KEY` for embeddings).

## 2026-11-02: RAG plan step C2 (ingestion script)

**Changed**
- Added `src/lib/embed.ts` (`buildEmbeddingInput` = title + heading + content; `embedTexts` via AI SDK `embedMany` with OpenAI `text-embedding-3-small`) and `src/lib/embed.test.ts`.
- Added `scripts/ingest.ts`: reads `knowledge/**/*.md`, chunks, embeds, then upserts documents and replaces each document's chunks in one transaction; documents removed from disk are deleted.
- Added dev dependency `tsx`. Marked C2 done in the RAG plan. Tests, `tsc --noEmit` and ESLint pass.
- The script has not been run yet (it calls the paid embeddings API); that is C3.

**Notes**
- The API key must live only in the local env file. The pre-commit secret scan caught it once in the tracked template; the template was restored before this commit.

**Next**
- [ ] C3: run the ingestion, verify the tables, add the `ingest` npm script.

## 2026-11-02: RAG plan step C3 (first ingestion run)

**Changed**
- Added npm script `ingest` (`tsx --env-file=<local env file> scripts/ingest.ts`). Marked C3 done in the RAG plan; Phase C complete.
- Ran `pnpm ingest` twice against OpenAI: 10 documents, 30 chunks, all embeddings 1536-dimensional, no orphan chunks. The second run left the counts unchanged (idempotent).

**Notes**
- `knowledge.db` is gitignored; re-run `pnpm ingest` after editing `knowledge/`.
- Inspect with `sqlite3 knowledge.db` or `pnpm db:studio`.

**Next**
- [ ] D1: `VectorStore` interface.

## 2026-11-02: RAG plan step D1 (VectorStore interface)

**Changed**
- Added `src/lib/vector-store.ts`: `VectorStore.query(embedding, topK, filter?)` returning `VectorStoreResult[]` (chunk text plus document title, category, product, `sourceUrl` and cosine `score`, best first); filter by `category` and/or `product`.
- Marked D1 done in the RAG plan. Types only, so no unit test; `tsc --noEmit` and ESLint pass.

**Next**
- [ ] D2: SQLite implementation with cosine similarity (with unit tests).

## 2026-11-02: RAG plan step D2 (SQLite vector store)

**Changed**
- Added `src/lib/vector-store.sqlite.ts`: `cosineSimilarity` and `createSqliteVectorStore(db)`, which joins chunks with documents, filters by category/product, scores in JS and returns the top-K.
- Added `src/lib/vector-store.sqlite.test.ts` (6 tests with hand-made vectors and an in-memory DB). Marked D2 done in the RAG plan. 15 tests, `tsc --noEmit` and ESLint pass.

**Notes**
- The factory takes the `db` as a parameter and does not import `src/db/client.ts`, so tests never open `knowledge.db`. Wiring to the real client is part of the driver switch (H5) or the chat route (E2).
- The test DDL is written by hand and must follow `schema.sqlite.ts` if the schema changes.

**Next**
- [ ] D3: retrieval smoke test against the real `knowledge.db` (needs one query embedding, i.e. one paid API call).

## 2026-11-02: RAG plan step D3 (retrieval smoke test)

**Changed**
- Added `scripts/check-retrieval.ts` and npm script `check:retrieval`: embeds 5 Italian questions in one paid call, queries the real `knowledge.db`, prints the top 3 chunks with scores and checks that the expected document ranks first, plus a category-filter check. Kept out of `pnpm test` because it calls the API.
- Result: 5/5 expected documents ranked first, filter check passed. Top scores ranged 0.61-0.76; the lowest top-1 scores were for short, colloquial questions (disdetta 0.609, bonifico 0.607).
- Marked D3 done in the RAG plan; Phase D complete.

**Next**
- [ ] E1: prompt builder. Keep the scores in mind for the G2 similarity threshold (answers likely start around 0.5-0.6).

## 2026-11-02: RAG plan step E1 (prompt builder)

**Changed**
- Added `src/lib/prompt.ts`: `buildSystemPrompt(chunks)` (short Italian instructions + numbered context `[n] Title - Heading`) and `FALLBACK_REPLY`, the wording shared with the future threshold fallback (G2). Empty retrieval yields an explicit "no information" context.
- Added `src/lib/prompt.test.ts` (4 tests). 19 tests, `tsc --noEmit` and ESLint pass. Marked E1 done in the RAG plan.

**Notes**
- Scores and source URLs are not put in the prompt (tokens are paid per request); sources are shown by the UI in F2.

**Next**
- [ ] E2: chat API route. Needs `@ai-sdk/anthropic` and `ANTHROPIC_API_KEY` in the local env file (the model `claude-sonnet-5` is paid per call).

## 2026-11-02: RAG plan step E2 (chat API route)

**Changed**
- Added `src/app/api/chat/route.ts`: `POST` takes `{ messages }` (AI SDK UI messages), validates the last user text (400 if missing, 413 over 1000 chars), embeds it (OpenAI), queries the SQLite vector store (topK 4), builds the system prompt and streams `claude-sonnet-5` with `maxOutputTokens` 400. The retrieved sources are sent as message metadata (`{ sources }`) for the citations in F2.
- Added `src/lib/chat.ts` (`lastUserText`, `toSources`, limits) and `src/lib/chat.test.ts`; added dependency `@ai-sdk/anthropic`. 23 tests, `tsc --noEmit` and ESLint pass. Marked E2 done in the RAG plan.
- Verified by calling the handler directly with a `Request` (not through `next dev`): an in-domain question got a grounded answer ("entro 3 giorni"), an off-topic one got `FALLBACK_REPLY`. Two paid chat calls plus embeddings.

**Notes**
- `next dev` must be restarted after changing the local env file. A server was already running on port 3000 when checked, so the route has not been exercised through the dev server.
- No conversation-history retrieval: only the last user message is embedded, so follow-ups that depend on earlier turns may retrieve poorly (revisit in G1).
- Errors from the model are masked as "An error occurred." in the stream.

**Next**
- [ ] F1: chat page with `useChat`.

## 2026-11-02: RAG plan step F1 (test chat page)

**Changed**
- Added `src/app/assistente/page.tsx` (server component with metadata title) and `src/components/Chat.tsx` (client component using `useChat` from `@ai-sdk/react`: message list, input, send button, "Sto cercando…" and error states). Styled only with design-system tokens.
- Added dependency `@ai-sdk/react`. Marked F1 done in the RAG plan. `tsc --noEmit`, ESLint and 23 tests pass.
- Checked that `/assistente` renders under `next dev` (HTTP 200, title, input and button in the HTML).

**Notes**
- The interactive flow (typing a question and watching the streamed answer) was not tried in a browser; the API route itself was verified in E2.
- Answers are shown as plain text (`whitespace-pre-wrap`): the model's markdown (e.g. `**bold**`) appears literally. Decide whether to render markdown or ask the model for plain text.
- Sources are in the message metadata but not shown yet (F2).

**Next**
- [ ] F2: show sources under each answer.

## 2026-11-02: RAG plan step F2 (source citations)

**Changed**
- `src/lib/chat.ts`: added `groupSources` (one entry per document, rank order, deduped headings) with 2 tests (25 total).
- `src/components/Chat.tsx`: assistant messages now show "Fonti consultate" with one line per document (link to `source_url` when present, plus the section headings).
- Marked F2 done in the RAG plan; Phase F complete. `tsc --noEmit`, ESLint and tests pass.

**Notes**
- Not tried in a browser (sources arrive in the stream metadata and render client-side).
- Sources are always the top-4 retrieved chunks, so an off-topic question that gets the fallback reply still lists sources. Fix with the similarity threshold in G2 (send no sources below it).
- `source_url` values are `example.com` placeholders.

**Next**
- [ ] G1: manual validation in the browser (direct, off-topic and ambiguous questions); decide on markdown rendering.

## 2026-11-02: RAG plan step G1 (validation)

**Changed**
- Ran 14 questions (5 direct, 4 off-topic, 3 ambiguous, 1 follow-up, 1 prompt injection) through the chat route with a temporary script (deleted) and recorded the results table and observations in `.claude/docs/rag-implementation-plan.md` under G1. About 28 embedding calls and 14 chat calls.
- Outcome: all direct questions answered correctly; off-topic and non-covered questions got the fallback; the injection attempt was refused. Weak spots: one inference beyond the context (disdetta after a sinistro), weak retrieval on follow-ups, noisy low-score chunks, markdown shown literally.

**Why**
- Gather evidence to tune `topK` and the similarity threshold in G2.

**Next**
- [ ] G2: threshold (proposed top-1 >= 0.40, no sources below it) and possibly lower `topK`.
- [ ] Try the page in a browser (`pnpm dev`, `/assistente`) and add anything unexpected to the G1 notes.

## 2026-11-02: G1 browser check

**Changed**
- Added the user's browser screenshot findings to the G1 notes in the RAG plan: UI and streaming work; irrelevant sources appear on answers (and on the off-topic fallback); markdown asterisks did not show this time.

**Next**
- [ ] G2: threshold (top-1 >= 0.40, no sources below it), lower `topK` or per-chunk cutoff, plain-text instruction in the prompt.

## 2026-11-02: RAG plan step G2 (threshold tuning)

**Changed**
- `src/lib/chat.ts`: `TOP_K` 4 -> 3; `MIN_TOP_SCORE` 0.40 and `RELEVANCE_WINDOW` 0.15; `selectRelevant` returns [] when the best chunk is under 0.40, otherwise keeps chunks within 0.15 of the best; `isFallbackReply`. Tuned on the 14 G1 questions.
- `src/app/api/chat/route.ts`: when nothing is relevant, streams `FALLBACK_REPLY` directly (no model call, no sources).
- `src/lib/prompt.ts`: asks for plain text without markdown.
- `src/components/Chat.tsx`: hides "Fonti consultate" when the answer is exactly the fallback.
- 32 tests, `tsc --noEmit` and ESLint pass. Marked G2 done in the RAG plan; Phase G complete.

**Verified live** (handler called directly, 7 questions): carbonara and weather got the fixed fallback with 0 sources; "carrozzeria" and "franchigia" now show 1 source; "se non pago" 3 sources, all from the right document.

**Notes**
- Window deviates from the earlier idea of a fixed per-chunk floor (0.45): a fixed floor would drop everything when the best chunk is 0.42-0.45; a window relative to the best chunk avoids that.
- "Quanto costa una polizza vita?" (top-1 0.56) passes the threshold; the model replies with the fallback and the UI hides the sources.
- While the fallback text streams, sources can flash briefly before being hidden.
- "Voglio disdire dopo un sinistro" now answers with the fallback sentence followed by partial information (mixed message).
- Thresholds depend on the 10 invented FAQs and on `text-embedding-3-small`; re-run G1 when the real knowledge base replaces them.

**Next**
- [ ] H1: Neon setup (external; needs the user to create the project and `DATABASE_URL`).

## 2026-11-02: manual test checklist

**Changed**
- Added `.claude/docs/chat-test-questions.md`: checklist of questions for `/assistente` grouped as direct (per FAQ document, with expected facts and source), follow-ups (with risk level), noisy sources, and misleading sources (fallback, affine-but-uncovered, wrong product, mixed answers, links and injection), plus a results register.

**Notes**
- Expected answers depend on the 10 invented FAQs in `knowledge/`; update the file when the real knowledge base replaces them.
- Not committed yet.

## 2026-11-02: local commands guide

**Changed**
- Added `.claude/docs/local-commands.md`: how to start the app, manage and inspect the SQLite DB (`db:push`, `ingest`, `db:studio`, `sqlite3`), run checks, troubleshoot, and run Postgres + pgvector locally with Docker to try the Phase H code before Neon.

**Notes**
- Decision still open for H2: `@neondatabase/serverless` does not talk to a plain local Postgres; local testing needs a standard driver such as `pg`.
- Not committed yet.

**Next**
- [ ] Moving to Neon (Phase H) is postponed; the app keeps running on local SQLite.

## 2026-11-06: Playwright e2e suite

**Changed**
- Added `@playwright/test`, `playwright.config.ts`, `pnpm test:e2e`, and `e2e/` (page object, TC-11 dataset, 6 spec files for TC-01/04/05/06/08/09/11/12/13/14/15).
- `.gitignore`: `/test-results/`, `/playwright-report/`.

**Notes**
- Only TC-06 and TC-08 were run (no paid calls apart from TC-08's single request); the rest hit OpenAI embeddings and Anthropic on every run.
- Selectors use the `Domanda` label, the `Invia` button and the bubble classes `self-start`/`self-end`; no `data-testid` exists in `Chat.tsx`.
- Not committed yet.

**Next**
- [ ] Run the full suite once and review TC-05/TC-12 heuristics; replace the TC-11 dataset with the "Domande di Test" sheet.

## 2026-11-06: QA esplorativo (skill rag-ai-chat-qa)

**Changed**
- `e2e/fixtures/qa-tracker-rag-ai-chat.xlsx`: TC-17..TC-21 compilati (parafrasi, auto vs casa, out-of-domain finanza, nuova injection "SYSTEM manutenzione", invio vuoto) e 5 righe aggiunte in "Domande di Test". Tutti Pass, nessun nuovo bug.

**Notes**
- Formule di Riepilogo non ricalcolate (LibreOffice assente): si aggiornano all'apertura in Excel.
- Osservazione: la parafrasi TC-17 cita anche la fonte "Documenti necessari per un preventivo auto" (rumore nel top-K).
- Non committato.
