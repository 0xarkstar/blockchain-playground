# Dark Mode QC Report V2

> Post-`@theme` fix audit. Generated 2026-02-10.

## Summary

- **Total issues: 16**
- **CRITICAL: 1**
- **HIGH: 13**
- **MEDIUM: 2**

### Overall Assessment

The codebase is in **excellent dark mode shape**. The `@theme` fix (changing `@theme inline` to `@theme`) restored all OKLCH CSS variable tokens, meaning semantic classes (`bg-background`, `bg-card`, `text-foreground`, `border-border`, etc.) all auto-switch correctly.

For hardcoded Tailwind colors, the vast majority (**300+ instances**) of `bg-{color}-100`, `text-{color}-800`, `border-{color}-200`, `bg-{color}-50` etc. already have properly paired `dark:` variants (e.g., `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`). This pairing is consistent across all 6 tracks + shared components.

The remaining 16 issues are small, isolated cases — primarily icon colors on small feedback elements (Check/X/AlertTriangle icons) that lack `dark:` variants.

---

## CRITICAL Issues

Elements potentially invisible or with poor contrast in dark mode.

| # | File | Line | Current Class | Suggested Fix |
|---|------|------|---------------|---------------|
| 1 | `components/ui/neon-gradient-card.tsx` | 131 | `bg-gray-100` (no dark variant) | `bg-gray-100 dark:bg-gray-900` |

**Context**: The neon-gradient-card inner content area uses `bg-gray-100` without a dark variant. In dark mode, this renders a light gray card body against the dark page background — content is readable but the aesthetic contrast is broken and it looks jarring.

---

## HIGH Issues

Icon/text colors missing `dark:` variants. These elements render with light-mode colors in dark mode — they remain visible (due to sufficient contrast with dark backgrounds) but are inconsistent with the rest of the UI and may appear too saturated or muted.

### Missing `dark:text-teal-400` on teal icons

| # | File | Line | Current Class | Suggested Fix |
|---|------|------|---------------|---------------|
| 2 | `components/fundamentals/hash-explorer-demo.tsx` | 106 | `text-teal-500` | `text-teal-500 dark:text-teal-400` |
| 3 | `components/fundamentals/wallet-workshop-demo.tsx` | 226 | `text-teal-500` | `text-teal-500 dark:text-teal-400` |
| 4 | `components/fundamentals/signature-studio-demo.tsx` | 41 | `text-teal-500` | `text-teal-500 dark:text-teal-400` |

### Missing `dark:text-green-400` on green icons/text

| # | File | Line | Current Class | Suggested Fix |
|---|------|------|---------------|---------------|
| 5 | `components/applied-zk/mastermind-demo.tsx` | 492 | `text-green-500` (Check icon) | `text-green-500 dark:text-green-400` |
| 6 | `components/applied-zk/visualization/proof-animation.tsx` | 258 | `text-green-500` (CheckCircle icon) | `text-green-500 dark:text-green-400` |
| 7 | `components/applied-zk/education/interactive-demo.tsx` | 113 | `text-green-500` (CheckCircle icon) | `text-green-500 dark:text-green-400` |
| 8 | `components/applied-zk/mixer-demo.tsx` | 574 | `text-green-600` (Check icon) | `text-green-600 dark:text-green-400` |
| 9 | `components/applied-zk/private-club-demo.tsx` | 601 | `text-green-600` (Check icon) | `text-green-600 dark:text-green-400` |
| 10 | `components/applied-zk/mastermind-demo.tsx` | 506 | `text-green-600` (Check icon) | `text-green-600 dark:text-green-400` |
| 11 | `components/zk/zk-concepts-demo.tsx` | 285 | `text-green-600` (Check icon) | `text-green-600 dark:text-green-400` |

### Missing `dark:text-red-400` on red icons

| # | File | Line | Current Class | Suggested Fix |
|---|------|------|---------------|---------------|
| 12 | `components/applied-zk/mixer-demo.tsx` | 576 | `text-red-600` (X icon) | `text-red-600 dark:text-red-400` |
| 13 | `components/applied-zk/private-club-demo.tsx` | 603 | `text-red-600` (X icon) | `text-red-600 dark:text-red-400` |
| 14 | `components/zk/zk-concepts-demo.tsx` | 287 | `text-red-600` (X icon) | `text-red-600 dark:text-red-400` |

---

## MEDIUM Issues

Low visual impact but inconsistent with established patterns.

| # | File | Line | Current Class | Suggested Fix |
|---|------|------|---------------|---------------|
| 15 | `components/applied-zk/mixer-demo.tsx` | 306 | `text-yellow-600` (AlertTriangle icon) | `text-yellow-600 dark:text-yellow-400` |
| 16 | `components/applied-zk/visualization/proof-animation.tsx` | 219 | `text-green-600 bg-green-500/10` (Badge, no dark text) | `text-green-600 dark:text-green-400 bg-green-500/10` |

### Borderline cases (NOT counted as issues)

These were investigated but are acceptable:

- **`text-yellow-500`** on `sealed-auction-demo.tsx:603` — Trophy icon for winner. Conditional class; non-winner uses `text-muted-foreground`. The yellow-500 shade is bright enough on dark backgrounds. Could add `dark:text-yellow-400` for consistency but not a readability issue.
- **`text-gray-500`** on `range-proof-demo.tsx:104` — Used for "0" bit value. Gray-500 has sufficient contrast on dark backgrounds (OKLCH ~0.55 lightness).
- **`bg-green-500/10`, `bg-red-500/10`** semi-transparent backgrounds — These work fine in both modes since the alpha transparency adapts naturally.
- **`bg-{color}-500/20`** in `circuit-graph.tsx` — All have corresponding `dark:text-*` variants. The semi-transparent bg adapts well.

---

## Patterns Already Correct (No Issues Found)

The following patterns were audited and found to be consistently correct across all 66 demos:

| Pattern | Count | Status |
|---------|-------|--------|
| `bg-{color}-100 ... dark:bg-{color}-900` | ~180 | All paired |
| `text-{color}-800 ... dark:text-{color}-300` | ~160 | All paired |
| `bg-{color}-50 ... dark:bg-{color}-950` | ~50 | All paired |
| `border-{color}-200 ... dark:border-{color}-800` | ~60 | All paired |
| `bg-{color}-600 ... dark:bg-{color}-500` (buttons) | ~50 | All paired |
| `text-{color}-600 ... dark:text-{color}-400` (text) | ~80 | All paired |
| `hover:bg-{color}-200 ... dark:hover:bg-{color}-800` | ~25 | All paired |
| `bg-white` / `bg-gray-50` without dark | 0 | None found |
| `text-gray-900` / `text-black` without dark | 0 | None found |

### Theme System Verification

- `globals.css` correctly uses `@theme` (not `@theme inline`)
- `.dark` class overrides all 28 OKLCH color variables
- `@custom-variant dark (&:where(.dark, .dark *))` correctly scopes dark mode
- `body` applies `@apply bg-background text-foreground` in base layer
- `*` applies `@apply border-border outline-ring/50` in base layer
- `charts.tsx` uses separate `LIGHT_COLORS` / `DARK_COLORS` arrays with `useTheme()` — correct
- Tooltip styles use CSS variables (`var(--color-card)`, etc.) — correct

---

## Fix Priority

1. **neon-gradient-card.tsx** — Single `dark:bg-gray-900` addition (CRITICAL)
2. **13 icon color fixes** — Mechanical find-and-replace additions (HIGH)
3. **2 medium fixes** — Optional consistency improvements (MEDIUM)

Total estimated effort: ~15 minutes for all 16 fixes.
