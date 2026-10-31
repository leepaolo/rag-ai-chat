---
paths:
  - "src/**"
---

# Architecture

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4 (App Router, Turbopack), React 19.3 |
| Language | TypeScript 5, `strict` |
| Styling | Tailwind CSS v4 |
| Lint | ESLint 9 (`eslint-config-next`) |
| LLM provider | TODO |
| Embeddings | TODO |
| Vector store / DB | TODO (e.g. Postgres + pgvector) |
| Tests | TODO (see `testing.md`) |

## Layout

Current: a single App Router page under `src/app/`, with `@/*` mapped to `src/*`.
TODO: confirm once the RAG pieces exist (proposed: `src/components/` for UI, `src/lib/` for server-only logic such as retrieval, embeddings and DB access).

## RAG flow (planned)

TODO: replace with real module paths as they are built.

1. **Ingest**: load documents, then chunk, embed, and store vectors with metadata.
2. **Retrieve**: embed the user query and run a similarity search for the top-k chunks.
3. **Generate**: build a prompt from the retrieved chunks and the chat history, then stream the LLM response to the client and cite sources.

All retrieval, embedding, and LLM calls run server-side (Route Handlers, Server Actions, or `server-only` modules); the client only renders the stream. Never expose provider SDKs or keys to client components.
