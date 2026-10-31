---
paths:
  - "src/**"
  - "next.config.ts"
---

# Next.js 16

Next 16.4 / React 19.3 differs from older Next.js. Read the matching guide in `node_modules/next/dist/docs/` (`01-app/` covers the App Router) before writing Next-specific code.

- `next.config.ts` turns on `cacheComponents` and `partialPrefetching`. Data fetching and caching follow the Cache Components model, not the old `fetch` cache options or route segment config.
- Route props use globally generated types (`LayoutProps<"/">`, `PageProps<...>`) from Next's typegen. No import is needed.
- Server Components by default; add `"use client"` only for interactivity, at the smallest leaf possible.
- Route files keep framework names (`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`).
