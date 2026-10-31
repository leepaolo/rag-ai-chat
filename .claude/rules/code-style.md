---
paths:
  - "**/*.{ts,tsx,js,jsx,mjs,cjs}"
---

# Code style

## Language & formatting

- TypeScript in `strict` mode everywhere; no `any` without a comment explaining why.
- **Linting:** ESLint 9 flat config (`eslint.config.mjs`) extending `eslint-config-next` core-web-vitals + typescript. Run `pnpm lint`.
- **Formatting:** the `lint-format.sh` PostToolUse hook runs ESLint `--fix` on every edited file and reports remaining warnings. TODO: decide on Prettier (or Biome) and wire it into `.claude/hooks/lint-format.sh`.
- Import from `src/` with the `@/` alias (`@/lib/...`), not long relative paths.

## Naming

- Components: `PascalCase` function and file name (`ChatMessage.tsx`).
- Hooks: `useCamelCase` (`useChatStream.ts`).
- Utilities, server modules: `kebab-case.ts` files exporting `camelCase` functions.
- Constants: `SCREAMING_SNAKE_CASE`; types/interfaces: `PascalCase`, no `I` prefix.
