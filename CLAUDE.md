# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

rag-ai-chat: a Retrieval-Augmented Generation chat app on Next.js 16.4 (App Router), React 19.3, strict TypeScript and Tailwind v4. Still at scaffold stage; UI copy is Italian. LLM provider, embeddings and vector store: TODO.

## Commands

- `pnpm dev`: dev server (localhost:3000)
- `pnpm build`: production build
- `pnpm lint`: ESLint
- `pnpm exec tsc --noEmit`: type-check
- Tests: TODO

## Critical rules

- Work on a feature branch and open PRs with `/pr-creation`. Never push to `main`, force-push, or `git reset --hard`.
- Never read `.env*` files or hard-code credentials; keys stay server-side in `process.env`.
- Expect hooks: ESLint runs after each edit, and commits are blocked until checks pass.
- After any session that changed something, append an entry to `.claude/docs/session-log.md`.

Topic rules (architecture, Next.js, code style, design system, testing, Claude setup) live in `.claude/rules/` and load automatically for matching files.
