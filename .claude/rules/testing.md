---
paths:
  - "**/*.{test,spec}.{ts,tsx}"
  - "e2e/**"
  - "vitest.config.*"
  - "playwright.config.*"
  - "package.json"
---

# Testing

- **Vitest** (node environment, config in `vitest.config.ts`, `@/` alias) for unit tests. TODO: add React Testing Library for component tests and Playwright for end-to-end when the UI exists.
- `pnpm test` runs `vitest run --passWithNoTests` (once, then exits); `pnpm test:watch` is for local use. The `block-untested-commit.sh` hook runs `test` before every commit.
- File naming (proposed): colocated `*.test.ts(x)` next to the source; e2e specs in `e2e/*.spec.ts`.
- Coverage (proposed): retrieval/chunking/prompt-building logic in `src/lib/` should be unit-tested; UI gets component tests for non-trivial state. TODO: set a threshold once there is code to measure.
- LLM calls are mocked in unit tests; never hit a paid API from the test suite.
