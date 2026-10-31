---
paths:
  - "src/**/*.{tsx,jsx,css}"
---

# Design system

Source of truth: the **MailCheap** design system artifact, https://claude.ai/artifact/2KWZA1Mxh9jaQAqiLsPBZd (`project/tokens.json` for values, `project/README.md` for rationale). `src/app/globals.css` mirrors it. Change the artifact first, then update the CSS so the two never drift.

## Setup

- Tailwind CSS v4 utility classes only; no CSS modules or CSS-in-JS unless agreed.
- Tailwind runs through a **Turbopack loader rule** (`@tailwindcss/turbopack` in `next.config.ts`), not PostCSS. There is no `postcss.config.*` or `tailwind.config.*`.
- Themed values (colors, shadow) are raw CSS variables in `:root` with a `prefers-color-scheme: dark` override, mapped to utilities in `@theme inline`. Static values (type scale, radii) live in `@theme`.
- Fonts load through `next/font/google` in `src/app/layout.tsx`: Newsreader → `font-display`, Geist → `font-sans` (default on `<body>`), Geist Mono → `font-mono`.

## Use tokens, never raw values

| Need | Use |
| --- | --- |
| Page / card background | `bg-surface` / `bg-surface-raised` |
| Text | `text-ink`; secondary `text-ink-muted` |
| Primary button | `bg-primary text-primary-ink rounded-lg text-button` |
| Hover fill, chip, secondary panel | `bg-subtle text-subtle-ink` |
| Divider, card edge / input border | `border-border` / `border-input-border` |
| Focus | `ring-ring` (or `outline-ring`) |
| Errors, destructive actions only | `text-danger`, `bg-danger` |
| Elevation | `shadow-border` (the only shadow) |
| Headlines | `font-display text-display-xl` (hero), `text-display-lg` (section H2) |
| UI text | `text-title-sm`, `text-body-lead`, `text-body`, `text-label`, `text-button`; code-like `font-mono text-token` |
| Radius | `rounded-sm` 6, `rounded-md` 8 (inputs), `rounded-lg` 10 (buttons), `rounded-xl` 16 (cards), `rounded-2xl` 24 (panels), `rounded-full` (pills) |

Spacing uses Tailwind's default 4px scale (`p-4` = 16px), which matches the system's `space-*` tokens: tight controls at 1–4, card padding 6, gutters 4 → 6 → 8, section padding 16 → 28.

## Rules

- Type carries hierarchy, not color: headings stay `ink`/`ink-muted`.
- `danger` is the only saturated color; never use it decoratively. No other accent colors.
- Flat: one shadow (`shadow-border`); do not add a shadow scale, glows or glassmorphism.
- Hex values, `zinc-*`/`neutral-*` palettes, and arbitrary values (`text-[17px]`) do not belong in components; add a token instead.
- Content width caps: `max-w-md` 448, `max-w-xl` 576, `max-w-2xl` 672, `max-w-4xl` 896.
- TODO: component library decision (e.g. shadcn/ui, whose variable naming this system already follows, or hand-rolled). Document shared patterns here (chat bubble, input bar, source citation card) as they are built.
- TODO: a manual light/dark toggle would need a `[data-theme]` selector next to the media query.
