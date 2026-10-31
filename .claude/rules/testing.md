---
paths:
  - "**/*.{test,spec}.{ts,tsx}"
  - "e2e/**"
  - "vitest.config.*"
  - "playwright.config.*"
  - "package.json"
---

# Testing

- TODO: choose and install a framework. Proposed: **Vitest** + React Testing Library for unit/component tests, **Playwright** for end-to-end.
- The `pnpm test` script must run once and exit (e.g. `vitest run`); the `block-untested-commit.sh` hook runs it before every commit. Until it exists, the hook runs typecheck + lint instead.
- File naming (proposed): colocated `*.test.ts(x)` next to the source; e2e specs in `e2e/*.spec.ts`.
- Coverage (proposed): retrieval/chunking/prompt-building logic in `src/lib/` should be unit-tested; UI gets component tests for non-trivial state. TODO: set a threshold once there is code to measure.
- LLM calls are mocked in unit tests; never hit a paid API from the test suite.
