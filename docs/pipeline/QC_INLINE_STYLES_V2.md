# QC-B: Inline Styles + D3/Canvas/SVG Color Audit

**Auditor**: p-qc-inline
**Date**: 2026-02-10
**Scope**: All `apps/web/components/**/*.tsx` files
**Method**: Grep for `style={{`, `.attr("fill")`, `.attr("stroke")`, hardcoded hex colors, canvas usage

---

## Executive Summary

| Category | Issues Found | CRITICAL | HIGH | MEDIUM | LOW |
|----------|-------------|----------|------|--------|-----|
| Recharts Axes/Grid | 1 systemic | 0 | **1** | 0 | 0 |
| D3 Visualization | 1 | 0 | 0 | **1** | 0 |
| UI Decorative Components | 2 | 0 | 0 | **1** | **1** |
| Inline Styles (color) | 0 | 0 | 0 | 0 | 0 |
| SVG Components | 0 | 0 | 0 | 0 | 0 |
| Canvas (confetti) | 0 | 0 | 0 | 0 | 0 |
| **Total** | **4** | **0** | **1** | **2** | **1** |

**Overall verdict: GOOD.** The codebase has been well-prepared for dark mode. The `--viz-*` CSS custom variables and `hsl(var(--*))` patterns are used consistently for inline styles. The main gap is Recharts axis/grid defaults.

---

## 1. Recharts Charts (HIGH)

### Issue: CartesianGrid, XAxis, YAxis use Recharts defaults that don't adapt to dark mode

**File**: `apps/web/components/shared/charts.tsx` (lines 97, 130, 192)
**Impact**: Affects **15+ chart instances** across defi, tokens, fundamentals, and solidity tracks.

**What's wrong**:
- `<CartesianGrid strokeDasharray="3 3" />` — Recharts defaults to `stroke="#ccc"`. On dark backgrounds this is low contrast but still barely visible.
- `<XAxis dataKey={xKey} />` and `<YAxis />` — Recharts defaults tick text fill to `#666` and axis line stroke to `#666`. On dark backgrounds, **axis labels become nearly invisible**.

**Current code** (line 96-99):
```tsx
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey={xKey} />
<YAxis />
```

**Recommended fix**:
```tsx
<CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
<XAxis dataKey={xKey} tick={{ fill: "var(--color-muted-foreground)" }} stroke="var(--color-border)" />
<YAxis tick={{ fill: "var(--color-muted-foreground)" }} stroke="var(--color-border)" />
```

**Affected chart components** (all use the same `charts.tsx` wrapper):
- `SimpleLineChart` (line 97-99)
- `SimpleBarChart` (line 130-132)
- `SimpleAreaChart` (line 192-194)
- `SimplePieChart` — no axes, no issue

**Affected consumers** (partial list):
- `defi/oracle-price-feed-demo.tsx` — SimpleLineChart
- `defi/arbitrage-simulator-demo.tsx` — SimpleBarChart
- `defi/impermanent-loss-demo.tsx` — SimpleAreaChart
- `defi/yield-calculator-demo.tsx` — SimpleBarChart
- `defi/staking-rewards-demo.tsx` — SimpleAreaChart + SimpleBarChart
- `defi/interest-rate-explorer-demo.tsx` — SimpleLineChart
- `defi/simple-swap-demo.tsx` — SimpleLineChart
- `tokens/erc20-creator-demo.tsx` — SimplePieChart (OK)
- `tokens/erc1155-multi-token-demo.tsx` — SimpleBarChart
- `tokens/token-governance-demo.tsx` — SimpleBarChart
- `tokens/dutch-auction-demo.tsx` — SimpleLineChart
- `tokens/nft-marketplace-demo.tsx` — SimpleLineChart
- `fundamentals/gas-estimator-demo.tsx` — SimpleBarChart
- `fundamentals/hash-explorer-demo.tsx` — SimpleBarChart
- `solidity/data-types-demo.tsx` — SimpleBarChart
- `solidity/assembly-playground-demo.tsx` — SimpleBarChart
- `solidity/storage-layout-demo.tsx` — SimplePieChart (OK)

**Note**: The `TOOLTIP_STYLE` and color palette (LIGHT_COLORS/DARK_COLORS) are properly dark-mode-aware via `useTheme()` + `resolvedTheme`. Only the grid/axis elements are affected.

---

## 2. D3 Visualization Components

### 2a. comparison-chart.tsx — Hardcoded hex in D3 (MEDIUM)

**File**: `apps/web/components/applied-zk/visualization/comparison-chart.tsx` (lines 100, 144-145)

**What's happening**: Uses `useTheme()` to select between light/dark hex values — functionally correct but uses hardcoded hex instead of CSS variables.

**Current code** (line 100):
```tsx
.attr("fill", (d) => (d.key === "snark" ? (isDark ? "#60a5fa" : "#3b82f6") : (isDark ? "#a78bfa" : "#8b5cf6")))
```

And legend (lines 144-145):
```tsx
{ label: "zk-SNARK", color: isDark ? "#60a5fa" : "#3b82f6" },
{ label: "zk-STARK", color: isDark ? "#a78bfa" : "#8b5cf6" },
```

**Verdict**: Dark mode **IS** working (uses `isDark` check from `useTheme`). But deviates from the `--viz-*` CSS variable pattern used elsewhere. Text elements correctly use `"currentColor"` (lines 122, 163).

**Recommended**: Replace hex values with `getComputedStyle(document.documentElement).getPropertyValue('--viz-blue')` or create dedicated viz variables for snark/stark colors. LOW urgency since it works correctly.

### 2b. circuit-graph.tsx — NO ISSUES

**File**: `apps/web/components/applied-zk/visualization/circuit-graph.tsx`

Uses ReactFlow (not D3). All colors via Tailwind `dark:` variant classes. Legend dots use Tailwind color classes (`bg-green-500`, `bg-blue-500`, etc.) which work in both modes.

### 2c. proof-animation.tsx — NO ISSUES

**File**: `apps/web/components/applied-zk/visualization/proof-animation.tsx`

Uses framer-motion (not D3). All colors via Tailwind classes with `dark:` variants where needed. Step indicators use semantic classes (`bg-primary`, `bg-muted`, `bg-green-500`).

### 2d. hash-avalanche-visualizer.tsx — NO ISSUES

**File**: `apps/web/components/fundamentals/hash-avalanche-visualizer.tsx`

Uses inline styles but with CSS variables: `hsl(var(--destructive))` and `var(--viz-green)`. Both respond to dark mode automatically.

---

## 3. UI Decorative Components

### 3a. magic-card.tsx — Default gradient doesn't adapt (MEDIUM)

**File**: `apps/web/components/ui/magic-card.tsx` (lines 22-25)

**Defaults**:
```tsx
gradientColor = "#262626",  // Very dark grey - low contrast hover glow in dark mode
gradientFrom = "#9E7AFF",   // Purple accent
gradientTo = "#FE8BBB",     // Pink accent
```

The `gradientColor="#262626"` creates a dark glow on hover. In light mode this works. In dark mode against a dark card background, the glow is invisible/indistinguishable.

**Recommended**: Callers should pass theme-aware props, or the component should use `useTheme()` to select between light/dark gradient defaults.

### 3b. Other decorative components — LOW / Acceptable

| Component | File | Default Colors | Dark Mode Status |
|-----------|------|---------------|-----------------|
| ShineBorder | `ui/shine-border.tsx` | `#000000` | Callers always override with custom colors. Default never used. |
| BorderBeam | `ui/border-beam.tsx` | `#ffaa40`, `#9c40ff` | Decorative accent. Visible in both modes. |
| AnimatedBeam | `ui/animated-beam.tsx` | `#ffaa40`, `#9c40ff` | Decorative connector beam. |
| AuroraText | `ui/aurora-text.tsx` | Gradient of 4 vibrant colors | Decorative text gradient. Visible in both modes. |
| NeonGradientCard | `ui/neon-gradient-card.tsx` | `#ff00aa`, `#00FFF1` | Has `dark:bg-neutral-900` for inner bg. Neon colors visible in both modes. |
| ConceptCard | `education/concept-card.tsx` | `#6366f1`, `#8b5cf6` | Passes to NeonGradientCard. Decorative neon border. |

**Verdict**: These are all intentionally vivid accent/decorative effects. They're visible against both light and dark backgrounds. No functional issue.

---

## 4. Inline Styles — All Clear

All inline styles with color-related properties properly use CSS variables or theme-aware patterns:

### Using `var(--viz-*)` CSS variables (auto dark mode):
| File | Lines | Colors Used |
|------|-------|-------------|
| `fundamentals/block-builder-demo.tsx` | 67, 72 | `var(--viz-blue)` |
| `fundamentals/wallet-workshop-demo.tsx` | 54, 85, 125 | `var(--viz-purple)`, `var(--viz-blue)`, `var(--viz-green)` |
| `fundamentals/chain-integrity-demo.tsx` | 62, 67, 100-108, 230-234 | `var(--viz-green)`, `hsl(var(--destructive))` |
| `fundamentals/transaction-builder-demo.tsx` | 32, 76, 169 | `var(--viz-blue)`, `var(--viz-orange)` |
| `fundamentals/state-explorer-demo.tsx` | 54, 85, 122, 153, 184, 246, 256 | All `var(--viz-*)` variants |
| `fundamentals/consensus-playground-demo.tsx` | 88 | `color-mix(in srgb, var(--viz-yellow) 50%, transparent)` |
| `fundamentals/merkle-proof-demo.tsx` | 91-97, 112-117, 140-171 | `var(--viz-blue)`, `var(--viz-green)`, `var(--viz-purple)`, `hsl(var(--muted-foreground))`, `hsl(var(--muted))`, `hsl(var(--foreground))` |
| `fundamentals/hash-avalanche-visualizer.tsx` | 42-50, 64-68, 75-79 | `hsl(var(--destructive))`, `var(--viz-green)` |
| `solidity/event-log-inspector-demo.tsx` | 274-276 | `hsl(var(--primary) / 0.3)` |

### Using `resolvedTheme` checks (programmatic dark mode):
| File | Lines | Pattern |
|------|-------|---------|
| `tokens/erc721-minter-demo.tsx` | 185-186 | HSL lightness switches: `resolvedTheme === "dark" ? 35 : 85` |

### Layout-only styles (no color — no issue):
| File | Property |
|------|----------|
| `tokens/token-governance-demo.tsx:344,350,356` | `width` (percentage) |
| `shared/progress-pipeline.tsx:76,77,104` | `minWidth` |
| `shared/step-card.tsx:27` | `minHeight` |
| `tokens/token-allowance-demo.tsx:178` | `maxHeight` |
| `tokens/nft-metadata-demo.tsx:279` | `maxHeight` |
| `solidity/data-types-demo.tsx:186` | `wordBreak` |
| `solidity/proxy-patterns-demo.tsx:294,305,316` | `wordBreak` |
| `solidity/event-log-inspector-demo.tsx:198,214` | `wordBreak` |
| `solidity/abi-encoder-demo.tsx:199-201` | `wordBreak`, `lineHeight` |
| `eip2981-royalties-demo.tsx:93,99,105` | `width` (percentage) |
| `solidity/storage-layout-demo.tsx:231,239` | `width` (percentage) |
| `solidity/reentrancy-attack-demo.tsx:208,264` | `marginLeft` |
| `ui/progress.tsx:25` | `transform` |
| `fundamentals/block-builder-demo.tsx:46,80` | `minWidth` |
| `fundamentals/hash-avalanche-visualizer.tsx:36` | `maxWidth` |
| `fundamentals/chain-integrity-demo.tsx:23,100` | `minWidth` |

---

## 5. Canvas Usage — No Issues

**canvas-confetti**: Used in 12+ components for celebration effects. These are temporary particle overlays that don't render UI elements. Default multi-colored confetti particles are visible in both modes. No dark mode concern.

**confetti.tsx** (`ui/confetti.tsx`): Wrapper around canvas-confetti with proper `<canvas>` ref management. No color hardcoding.

---

## 6. Shared Components — No Issues

### step-card.tsx
- Only inline style: `style={{ minHeight: 24 }}` — layout only
- All colors via semantic Tailwind classes (`bg-primary`, `text-primary-foreground`, `bg-border`)

### progress-pipeline.tsx
- Inline styles: `minWidth` values only — layout only
- Colors via `statusConfig` with proper `dark:` variants for all states
- `text-white` on active step uses `bg-blue-600 dark:bg-blue-500` background — adequate contrast

---

## CSS Variable System Assessment

The `--viz-*` CSS variable system defined in `globals.css` is well-implemented:

```css
:root {
  --viz-blue: hsl(217.2 91.2% 59.8%);
  --viz-green: hsl(142.1 76.2% 36.3%);
  --viz-purple: hsl(263.4 70% 50.4%);
  --viz-yellow: hsl(47.9 95.8% 53.1%);
  --viz-orange: hsl(24.6 95% 53.1%);
}
.dark {
  --viz-blue: hsl(217.2 91.2% 69.8%);    /* +10% lightness */
  --viz-green: hsl(142.1 76.2% 50.3%);   /* +14% lightness */
  --viz-purple: hsl(263.4 70% 63.4%);    /* +13% lightness */
  --viz-yellow: hsl(47.9 95.8% 63.1%);   /* +10% lightness */
  --viz-orange: hsl(24.6 95% 63.1%);     /* +10% lightness */
}
```

All SVG inline styles in fundamentals components correctly reference these variables. No hardcoded colors found in SVG inline styles.

---

## Priority Action Items

### HIGH — Fix Recharts axis/grid dark mode (1 file change, 15+ consumers fixed)
**File**: `apps/web/components/shared/charts.tsx`
**Effort**: Small — add `stroke`, `tick` props to CartesianGrid/XAxis/YAxis in 3 chart components
**Impact**: All chart instances across the app get proper dark mode axis visibility

### MEDIUM — comparison-chart.tsx hex colors (cosmetic consistency)
**File**: `apps/web/components/applied-zk/visualization/comparison-chart.tsx`
**Effort**: Small — replace hex pairs with CSS variable reads
**Impact**: Consistency with viz variable system. Functionally already works.

### MEDIUM — magic-card.tsx default gradient (cosmetic)
**File**: `apps/web/components/ui/magic-card.tsx`
**Effort**: Small — add useTheme() or change default to a CSS variable
**Impact**: Hover glow visible in dark mode. Currently invisible but non-critical.

### LOW — ShineBorder default (no real impact)
Default `#000000` is never used by any caller. All callers pass custom colors. No action needed.
