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
