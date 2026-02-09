# Design Systems & Tokens: 2025-2026 Trends

**Research Agent**: p-research-design-system
**Date**: 2026-02-09
**Team**: ui-design-research

---

## Executive Summary

The design system landscape in 2025-2026 has converged around **CSS-first design tokens**, **OKLCH color spaces**, **component ownership models** (shadcn/ui), and **multi-framework primitives** (Radix UI). Key shifts:

- **Tailwind CSS 4's `@theme` directive** collapses design tokens into CSS custom properties as the single source of truth
- **OKLCH replaces HSL** for perceptually uniform color systems with better dark mode and accessibility
- **shadcn/ui's copy-paste model** dominates over traditional npm-installed libraries (66k+ GitHub stars)
- **Fluid typography with `clamp()`** eliminates breakpoint-heavy font scales
- **Container queries** replace media queries for component-level responsiveness
- **CVA (class-variance-authority)** becomes the standard for type-safe component variants
- **Lucide icons** (1,600+ icons) lead the ecosystem, especially with shadcn/ui

---

## Design Token Architecture

### The 2026 Standard: CSS Custom Properties + Tailwind 4

**Tailwind CSS 4's `@theme` directive** provides a CSS-first approach where design tokens are defined once and automatically become:
1. CSS custom properties (runtime theming)
2. Tailwind utility classes (build-time optimization)
3. TypeScript types (type safety)

```css
@theme {
  --color-primary: oklch(0.55 0.15 250);
  --color-secondary: oklch(0.65 0.12 210);
  --spacing-base: 1rem;
}
```

**Key Benefits**:
- **Single source of truth** — no duplication between `tailwind.config.js` and CSS
- **Runtime theming** — CSS variables enable dynamic theme switching
- **Smaller bundles** — only used tokens are included

### CSS Variables vs. Tailwind Theme vs. Style Dictionary

| Approach | Best For | Trade-offs |
|----------|----------|------------|
| **CSS Variables** (`--var`) | Runtime theming, simple projects | Manual utility class mapping |
| **Tailwind 4 `@theme`** | Modern React/Next.js apps | Requires Tailwind 4 (still in alpha) |
| **Style Dictionary** | Multi-platform (iOS, Android, Web) | Complex build pipeline, over-engineered for web-only |

**Verdict for blockchain-playground**: Use **Tailwind 4 `@theme`** with CSS variables for runtime theme switching. Style Dictionary is overkill unless targeting native apps.

### Style Dictionary (Multi-Platform Architecture)

**[Style Dictionary](https://styledictionary.com/)** uses platform-agnostic design tokens defined in JSON/YAML and transforms them into:
- CSS custom properties (web)
- Swift code (iOS)
- XML resources (Android)
- Flutter constants

**Architecture Pattern**:
```
tokens/
  colors.json    ← Define once
  spacing.json
  typography.json

↓ Style Dictionary build

output/
  web/tokens.css
  ios/Colors.swift
  android/colors.xml
```

**Recent Standards Alignment**: The [W3C Design Tokens specification](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) reached v1.0 in October 2025, with Style Dictionary providing reference implementation.

**When to Use**: Only if you're building native apps alongside your web app. For web-only projects, Tailwind 4 `@theme` is simpler.

---

## Color Systems (OKLCH, Dark Mode)

### OKLCH vs. HSL: The Perceptual Uniformity Problem

**HSL is fundamentally broken** for color systems:
- Lightness is **not perceptually uniform** across hues (blue at L=50% looks darker than yellow at L=50%)
- Causes **accessibility failures** in programmatically generated palettes
- **Hue shifts** when adjusting saturation/lightness

**OKLCH solves this**:
- **Perceptually uniform lightness** (L) — incrementing L by 10% looks like 10% more brightness across all hues
- **Predictable contrast scaling** — critical for WCAG/APCA compliance
- **No hue/saturation shifts** when adjusting lightness

**Browser Support (2026)**: Chrome 111+, Safari 15.4+, Firefox 113+ — **universal production support**.

### Dark Mode Color Strategy

**Key Insight**: APCA (WCAG 3.0 candidate) is **stricter for light-on-dark** than WCAG 2.x:

```css
/* WCAG 2.x: Same contrast for both directions */
/* Light mode: #333 on #fff = 12.6:1 ✓ */
/* Dark mode:  #fff on #333 = 12.6:1 ✓ */

/* APCA: Directional contrast (light-on-dark requires MORE contrast) */
/* Light mode: #333 on #fff = Lc 89  ✓ */
/* Dark mode:  #fff on #333 = Lc 106 ✓ (higher value needed!) */
```

**Best Practice for Dark Mode**:
1. **Increase lightness (L) more in dark mode** — don't just invert colors
2. **Raise chroma (C) slightly** for accent colors on dark backgrounds (avoid dullness)
3. **Test with APCA** (use [OddContrast](https://www.oddcontrast.com/) or [Atmos Contrast Checker](https://atmos.style/contrast-checker))

**Example: Brand Blue**
```css
:root {
  --color-primary: oklch(0.55 0.15 250); /* Light mode */
}

.dark {
  --color-primary: oklch(0.75 0.18 250); /* Dark mode: higher L, slightly higher C */
}
```

### WCAG 2.2 vs. APCA

| Standard | Minimum Ratio | Key Difference |
|----------|---------------|----------------|
| **WCAG 2.2** (AA) | 4.5:1 (text), 3:1 (large text) | Bidirectional (same ratio both ways) |
| **WCAG 2.2** (AAA) | 7:1 (text), 4.5:1 (large text) | Stricter contrast |
| **APCA** (WCAG 3.0) | Lc 60-90 (context-dependent) | Directional, accounts for polarity |

**Recommendation**: Test with **both WCAG 2.2 (for legal compliance) and APCA (for actual readability)**.

---

## Typography Trends

### Fluid Typography with `clamp()`

**The 2026 standard**: Use `clamp()` for responsive font sizes without breakpoints.

```css
/* Traditional approach (3+ breakpoints) */
h1 {
  font-size: 2rem;
}
@media (min-width: 768px) {
  h1 { font-size: 2.5rem; }
}
@media (min-width: 1024px) {
  h1 { font-size: 3rem; }
}

/* Modern approach (fluid, no breakpoints) */
h1 {
  font-size: clamp(2rem, 1.5rem + 2vw, 3rem);
  /*            min    preferred    max */
}
```

**Benefits**:
- **Smooth scaling** — no "jumps" at breakpoints
- **Less code** — one rule replaces 3+ media queries
- **Universal 6K display support** — scales from 140-character smartwatch to 32-inch monitor

**Tools**:
- **[Fluid Type Scale Calculator](https://www.fluid-type-scale.com/)** — generates entire type scale
- **[Modern Fluid Typography Editor](https://modern-fluid-typography.vercel.app/)** — visual editor

### Modern Font Stacks (2026)

| Font | Use Case | Key Features | Weekly Downloads |
|------|----------|--------------|------------------|
| **Inter** | UI (still dominant) | Tall x-height, variable weights, flawless rendering | 8M+ (npm) |
| **Geist** | Developer tools (Vercel) | Variable font superfamily, modern aesthetic | Growing rapidly |
| **Satoshi** | Brand/marketing | Geometric, friendly, high contrast | Premium (not npm) |
| **Berkeley Mono** | Code editors | Monospace, ligatures, high readability | Premium |

**Trend: "Mechanical meets Poetic"** — pairing geometric sans-serifs (Inter, Geist) with serif accents for headlines.

### Variable Fonts & Optical Sizing

**Optical Size (`opsz`) axis** automatically adjusts:
- **Small sizes**: Higher stroke contrast, tighter spacing
- **Large sizes**: Lower contrast, looser spacing

```css
/* Modern variable font usage */
@font-face {
  font-family: 'Inter Variable';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900; /* Full range */
}

body {
  font-family: 'Inter Variable', system-ui, sans-serif;
  font-optical-sizing: auto; /* Enable opsz axis */
}
```

**Recommendation for blockchain-playground**:
- Stick with **Inter Variable** for UI (battle-tested, 8M+ downloads)
- Consider **Geist** if adopting Vercel's design language
- Use **`clamp()` for all font sizes**

---

## Spacing & Layout Patterns

### CSS Grid vs. Flexbox vs. Container Queries

**The 2026 Consensus**:
- **Flexbox**: 1D layouts (nav bars, button groups, form rows)
- **CSS Grid**: 2D layouts (page grids, card grids, dashboard layouts)
- **Container Queries**: Component-level responsiveness (replaces media queries)

**Key Shift**: Container queries enable **component-driven responsive design** instead of viewport-driven.

```css
/* Old: Media queries (viewport-based) */
@media (min-width: 768px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}

/* New: Container queries (component-based) */
.card-grid-container {
  container-type: inline-size;
}

@container (min-width: 600px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}
```

**Benefits**:
- **Reusable components** — responsive behavior travels with the component
- **Sidebar-safe** — components adapt to their container, not the viewport
- **Browser support**: Universal in 2026 (Chrome 105+, Safari 16+, Firefox 110+)

### Modern Spacing Scales

**The `gap` property** is the 2026 standard for spacing in Grid/Flexbox:

```css
/* Old: margin on children */
.card-grid > * {
  margin-right: 1rem;
  margin-bottom: 1rem;
}
.card-grid > *:last-child {
  margin-right: 0; /* Annoying edge case */
}

/* New: gap on container */
.card-grid {
  display: grid;
  gap: 1rem; /* One rule, no edge cases */
}
```

**Fluid Spacing with `clamp()`**:
```css
.section {
  padding: clamp(1rem, 2vw, 3rem); /* Fluid padding */
}

.card-grid {
  gap: clamp(0.5rem, 1vw, 1.5rem); /* Fluid gap */
}
```

**Recommendation**: Use `gap` everywhere, make it fluid with `clamp()`.

---

## shadcn/ui Theming Deep Dive

### The Component Ownership Model

**shadcn/ui** (66k+ GitHub stars) flipped the React component library model:

| Traditional Libraries (MUI, Chakra) | shadcn/ui |
|--------------------------------------|-----------|
| Install via npm | Copy/paste components into your repo |
| Black-box dependencies | Full code ownership |
| Override via props/styling | Edit the source directly |
| Bundle bloat from unused components | Only include what you use |

**Architecture**:
```
components/ui/          ← shadcn components (your code)
  button.tsx
  card.tsx
  dialog.tsx

lib/utils.ts            ← Utility helpers (cn, etc.)

↑ You own and modify this code
```

### CSS Variables Design Token System

shadcn/ui uses **CSS custom properties** for theming:

```css
/* globals.css */
@layer base {
  :root {
    --background: oklch(100% 0 0);    /* White */
    --foreground: oklch(9% 0 0);      /* Near-black */
    --primary: oklch(55% 0.15 250);   /* Brand blue */
    --primary-foreground: oklch(98% 0 0);
    --radius: 0.5rem;                 /* Border radius token */
  }

  .dark {
    --background: oklch(9% 0 0);      /* Near-black */
    --foreground: oklch(98% 0 0);     /* Near-white */
    --primary: oklch(75% 0.18 250);   /* Brighter blue (dark mode) */
  }
}
```

**All components reference these variables**:
```tsx
// button.tsx
<button
  className={cn(
    "bg-primary text-primary-foreground",  // Uses CSS vars
    "rounded-[var(--radius)]",             // Dynamic radius
    className
  )}
>
  {children}
</button>
```

### New York vs. Default Style

| Aspect | Default | New York |
|--------|---------|----------|
| **Borders** | Subtle borders on all components | Minimal/no borders |
| **Shadows** | Light shadows | Heavier, more dramatic shadows |
| **Border Radius** | `--radius: 0.5rem` | `--radius: 0.75rem` (rounder) |
| **Aesthetic** | Neutral, minimalist | Bold, modern |

**Choosing**:
- **Default**: B2B SaaS, dashboards, enterprise apps
- **New York**: Consumer apps, marketing sites, modern fintech

**For blockchain-playground**: **New York style** — more visually engaging for educational content.

### OKLCH Integration (2026 Update)

As of March 2025, shadcn/ui **migrated from HSL to OKLCH**:

```css
/* Old (pre-March 2025) */
:root {
  --primary: 222.2 47.4% 11.2%; /* HSL */
}

/* New (March 2025+) */
:root {
  --primary: oklch(0.55 0.15 250); /* OKLCH */
}
```

**Migration Path**: Update `globals.css` with [new OKLCH colors from docs](https://ui.shadcn.com/colors).

---

## Component Variant Patterns (CVA)

### What is CVA?

**[CVA (class-variance-authority)](https://cva.style/docs)** provides type-safe component variants with Tailwind:

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "rounded font-medium transition-colors", // Base classes
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-11 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants>;
```

### Key Features

1. **Variants** — define style variations (no limit)
2. **Compound Variants** — styles when multiple conditions are met
3. **Default Variants** — fallback styles
4. **TypeScript Integration** — auto-completion and type checking

**Example: Compound Variants**
```tsx
const buttonVariants = cva("...", {
  variants: {
    variant: { primary: "...", secondary: "..." },
    size: { sm: "...", lg: "..." },
  },
  compoundVariants: [
    {
      variant: "primary",
      size: "lg",
      className: "text-xl font-bold", // Only when both conditions met
    },
  ],
});
```

### CVA vs. Tailwind Variants Plugin

| Feature | CVA | Tailwind Variants Plugin |
|---------|-----|--------------------------|
| **Type safety** | ✅ Full TypeScript support | ❌ No types |
| **Framework-agnostic** | ✅ Works with any CSS | ❌ Tailwind-only |
| **Compound variants** | ✅ First-class API | ❌ Must use arbitrary variants |
| **Bundle size** | ~1KB | 0 (built into Tailwind 3.3+) |

**Recommendation**: Use **CVA** — type safety and compound variants are essential for design systems.

### Best Practice: Wrap with `twMerge`

```tsx
import { cn } from "@/lib/utils"; // wraps clsx + twMerge

<Button className={cn(buttonVariants({ variant, size }), className)} />
```

**Why**: `twMerge` intelligently resolves Tailwind class conflicts (e.g., `bg-red-500 bg-blue-500` → `bg-blue-500`).

---

## Icon Library Landscape

### The 2026 Hierarchy

| Library | Icons | Styles | GitHub Stars | Best For |
|---------|-------|--------|--------------|----------|
| **Lucide** | 1,600+ | Stroke (outline) | 9k+ | shadcn/ui ecosystem (dominant) |
| **Phosphor** | 9,000+ | 6 weights (thin→duotone) | 8k+ | Design flexibility, dashboards |
| **Tabler** | 5,900+ | Stroke (24×24 grid) | 18k+ | Admin panels, consistent grids |
| **Heroicons** | 290+ | Outline & solid | 22k+ | Tailwind CSS ecosystem |

### Why Lucide Dominates with shadcn/ui

1. **Default in shadcn/ui CLI** — installed automatically
2. **Tree-shakeable** — only imported icons affect bundle size
3. **Consistent stroke style** — matches shadcn's design language
4. **Active maintenance** — expanded from Feather (292 icons → 1,600+)

**Usage**:
```tsx
import { Home, User, Settings } from "lucide-react";

<Home className="h-6 w-6 text-primary" />
```

### When to Choose Alternatives

- **Phosphor**: Need multiple weights (thin, light, regular, bold, fill, duotone)
- **Tabler**: Admin dashboards requiring ultra-consistent 24×24 grid
- **Heroicons**: Already using Tailwind UI (designed together)

**Recommendation for blockchain-playground**: **Lucide** (already using it with shadcn/ui).

---

## Best-in-Class Design Systems

### Vercel's Geist

**[Geist Design System](https://vercel.com/geist/introduction)** — Vercel's official design language.

**Key Features**:
- **Variable font superfamily** (Geist Sans + Geist Mono)
- **Minimal, developer-focused aesthetic**
- **Figma Design System** available (1,330+ community copies)
- **Seamless Next.js integration**

**Components**: Built on Radix UI primitives with custom styling.

**Target Audience**: Developer tools, SaaS products, modern web apps.

**Recommendation**: If you want Vercel's aesthetic, use **Geist font + shadcn/ui + Radix UI**.

### Radix UI & Radix Themes

**[Radix UI](https://www.radix-ui.com/)** — Unstyled, accessible React primitives.

**Key Features**:
- **Headless components** (no styles, full control)
- **WCAG 2.1 compliant** out of the box
- **Used by Vercel, CodeSandbox, Supabase**
- **Foundation for shadcn/ui**

**Radix Themes** (separate product) — Pre-styled components built on Radix UI primitives.

**When to Use**:
- **Radix UI**: Building custom design system (like shadcn/ui does)
- **Radix Themes**: Want Radix's opinionated design with minimal customization

### Catalyst (Tailwind UI Kit)

**[Catalyst](https://tailwindcss.com/plus/ui-kit)** — Premium application UI kit from Tailwind Labs.

**Key Features**:
- **Premium component library** (part of Tailwind UI subscription)
- **Built for modern apps** (dashboards, admin panels, SaaS)
- **Copy-paste model** (like shadcn/ui)
- **Official Tailwind CSS styling**

**Pricing**: $299/year (Tailwind UI All-Access subscription).

**Target Audience**: Teams wanting official Tailwind design without building from scratch.

### Park UI

**[Park UI](https://park-ui.com/)** — Beautifully designed components built with **Ark UI + Panda CSS**.

**Key Features**:
- **Multi-framework support** (React, Vue, Solid.js)
- **Copy-paste installation** (no npm package)
- **Ark UI primitives** (similar to Radix UI)
- **Panda CSS** (CSS-in-JS with atomic output)

**GitHub Stars**: 2.2k+ (new in 2024, growing rapidly).

**When to Use**: If you want Panda CSS (utility-first CSS-in-JS) instead of Tailwind.

### Design System Comparison Matrix

| System | Philosophy | Installation | Flexibility | Best For |
|--------|------------|--------------|-------------|----------|
| **shadcn/ui** | Copy-paste ownership | CLI → code in repo | ⭐⭐⭐⭐⭐ | Full control, modern Next.js apps |
| **Radix UI** | Headless primitives | npm install | ⭐⭐⭐⭐⭐ | Building custom design systems |
| **Radix Themes** | Opinionated Radix | npm install | ⭐⭐⭐ | Radix aesthetic with less work |
| **Catalyst** | Tailwind official | Copy-paste (paid) | ⭐⭐⭐⭐ | Tailwind loyalists, premium feel |
| **Park UI** | Panda CSS alternative | Copy-paste | ⭐⭐⭐⭐ | Multi-framework, Panda CSS fans |
| **Geist** | Vercel's design language | Font + guidelines | ⭐⭐⭐ | Vercel aesthetic, dev tools |
| **Material UI** | Google Material Design | npm install | ⭐⭐ | Enterprise, Google-like UX |
| **Mantine** | All-in-one toolkit | npm install | ⭐⭐⭐ | Fast delivery, 100+ components |
| **Chakra UI** | Style props + accessibility | npm install | ⭐⭐⭐⭐ | Balance of flexibility & convenience |

---

## Recommendations for blockchain-playground

### Current State Analysis

**Current Stack**:
- Mantine v7 (UI components)
- Tailwind CSS (utility classes)
- Next.js 16 + React 19

**Issues**:
- **Mantine + Tailwind conflicts** — different styling philosophies
- **No design token system** — colors/spacing hardcoded
- **No dark mode** — or inconsistent dark mode implementation
- **Heavy bundle** — Mantine includes 100+ components (not all needed)

### Migration Path: Mantine → shadcn/ui

**Why shadcn/ui?**
1. **Already using Tailwind** — shadcn/ui is built for Tailwind
2. **Copy-paste model** — full control over component code
3. **Design tokens** — CSS custom properties for theming
4. **Modern aesthetic** — aligns with blockchain/Web3 design trends
5. **Smaller bundle** — only include components you need

**Migration Strategy** (3-phase approach):

#### Phase 1: Foundation (1-2 weeks)
1. **Install shadcn/ui** (preserve Mantine for now)
2. **Set up design tokens** in `globals.css`:
   ```css
   :root {
     --background: oklch(100% 0 0);
     --foreground: oklch(9% 0 0);
     --primary: oklch(55% 0.15 250);    /* Customize to brand */
     --secondary: oklch(65% 0.12 210);
     --accent: oklch(75% 0.08 150);
     --radius: 0.75rem;                  /* New York style */
   }

   .dark {
     --background: oklch(9% 0 0);
     --foreground: oklch(98% 0 0);
     --primary: oklch(75% 0.18 250);    /* Brighter for dark mode */
     /* ... other dark mode tokens */
   }
   ```
3. **Add CVA** for variant management
4. **Implement dark mode toggle** (next-themes)

#### Phase 2: Component Migration (3-4 weeks)
1. **Prioritize high-traffic components**:
   - Button (most used)
   - Card (demo containers)
   - Dialog/Modal (interactive demos)
   - Tabs (track navigation)
2. **Migrate incrementally** — run Mantine and shadcn/ui side-by-side
3. **Update demo pages** one track at a time (Fundamentals → DeFi → Solidity → Tokens → ZK)

#### Phase 3: Polish & Optimization (1-2 weeks)
1. **Remove Mantine** from `package.json`
2. **Audit bundle size** (expect 30-40% reduction)
3. **Add fluid typography** (`clamp()` for all font sizes)
4. **Implement container queries** for responsive demos

### Design Token Architecture

**Recommended token structure**:

```css
/* Base tokens */
:root {
  /* Colors (OKLCH) */
  --color-brand-primary: oklch(55% 0.15 250);
  --color-brand-secondary: oklch(65% 0.12 210);

  /* Semantic tokens */
  --background: oklch(100% 0 0);
  --foreground: oklch(9% 0 0);
  --primary: var(--color-brand-primary);
  --secondary: var(--color-brand-secondary);

  /* Component tokens */
  --card-bg: var(--background);
  --card-border: oklch(90% 0 0);

  /* Spacing scale (fluid) */
  --space-xs: clamp(0.25rem, 0.5vw, 0.5rem);
  --space-sm: clamp(0.5rem, 1vw, 1rem);
  --space-md: clamp(1rem, 2vw, 1.5rem);
  --space-lg: clamp(1.5rem, 3vw, 2rem);
  --space-xl: clamp(2rem, 4vw, 3rem);

  /* Typography scale (fluid) */
  --font-size-xs: clamp(0.75rem, 0.5rem + 0.5vw, 0.875rem);
  --font-size-sm: clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  --font-size-base: clamp(1rem, 0.875rem + 0.5vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 1.125rem + 1vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 1.25rem + 1.5vw, 2rem);
  --font-size-3xl: clamp(2rem, 1.5rem + 2vw, 3rem);
}
```

### Typography System

**Fonts**:
- **Keep Inter Variable** (already battle-tested for UI)
- **Add Geist Mono** for code snippets (better than default monospace)

```css
@font-face {
  font-family: 'Inter Variable';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
}

@font-face {
  font-family: 'Geist Mono';
  src: url('/fonts/GeistMono-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
}

body {
  font-family: 'Inter Variable', system-ui, sans-serif;
  font-optical-sizing: auto;
}

code, pre {
  font-family: 'Geist Mono', 'SF Mono', Consolas, monospace;
}
```

### Icon Strategy

**Keep Lucide** — already using it, perfect with shadcn/ui.

### Dark Mode Implementation

**Use next-themes** (recommended by shadcn/ui):

```tsx
// app/providers.tsx
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

// components/theme-toggle.tsx
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
    </button>
  );
}
```

### Container Queries for Demo Components

**Replace viewport media queries** with container queries:

```tsx
// components/demo-card.tsx
<div className="demo-card-container @container">
  <div className="@sm:grid-cols-2 @lg:grid-cols-3 grid gap-4">
    {/* Demo content */}
  </div>
</div>
```

**Tailwind config** (enable container queries):
```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
};
```

---

## Sources

### Design Tokens & Tailwind 4
- [Adding custom styles - Core concepts - Tailwind CSS](https://tailwindcss.com/docs/adding-custom-styles)
- [Tailwind CSS Best Practices 2025-2026: Design Tokens, Typography & Responsive Patterns | FrontendTools](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns)
- [Exploring Typesafe design tokens in Tailwind 4 - DEV Community](https://dev.to/wearethreebears/exploring-typesafe-design-tokens-in-tailwind-4-372d)
- [Tailwind CSS 4 @theme: The Future of Design Tokens (A 2025 Guide) | Medium](https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06)
- [Theme variables - Core concepts - Tailwind CSS](https://tailwindcss.com/docs/theme)

### OKLCH Color Systems
- [OKLCH in CSS: Consistent, accessible color palettes - LogRocket Blog](https://blog.logrocket.com/oklch-css-consistent-accessible-color-palettes)
- [The Ultimate OKLCH Guide: Modern CSS Color Redefined](https://oklch.org/posts/ultimate-oklch-guide)
- [OKLCH in CSS: why we moved from RGB and HSL](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [WCAG 2 and APCA contrast checker | Atmos](https://atmos.style/contrast-checker)
- [OddContrast](https://www.oddcontrast.com/)

### shadcn/ui Theming
- [Theming - shadcn/ui](https://ui.shadcn.com/docs/theming)
- [Theming in shadcn UI: Customizing Your Design with CSS Variables | Medium](https://medium.com/@enayetflweb/theming-in-shadcn-ui-customizing-your-design-with-css-variables-bb6927d2d66b)
- [Customizing shadcn/ui Themes Without Breaking Updates | Medium](https://medium.com/@sureshdotariya/customizing-shadcn-ui-themes-without-breaking-updates-a3140726ca1e)
- [Theming Shadcn with Tailwind v4 and CSS Variables | Medium](https://medium.com/@joseph.goins/theming-shadcn-with-tailwind-v4-and-css-variables-d602f6b3c258)

### CVA (Class Variance Authority)
- [Class Variance Authority](https://cva.style/docs)
- [Variants | cva](https://cva.style/docs/getting-started/variants)
- [Simplifying component variants with Tailwind and CVA - Francisco Veracoechea](https://fveracoechea.com/blog/cva-and-tailwind/)
- [CVA vs. Tailwind Variants: Choosing the Right Tool for Your Design System - DEV Community](https://dev.to/webdevlapani/cva-vs-tailwind-variants-choosing-the-right-tool-for-your-design-system-12am)

### Fluid Typography
- [Fluid Type Scale Calculator](https://www.fluid-type-scale.com/)
- [Modern Fluid Typography Using CSS Clamp — Smashing Magazine](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)
- [Creating a Fluid Type Scale with CSS Clamp | Aleksandr Hovhannisyan](https://www.aleksandrhovhannisyan.com/blog/fluid-type-scale-with-css-clamp/)

### Icon Libraries
- [Lucide Icons](https://lucide.dev/guide/comparison)
- [25+ Best Open Source Icon Library Options in 2026](https://hugeicons.com/blog/development/best-open-source-icon-libraries)
- [Top 10 Icon Libraries for React Development: A Comprehensive Guide | Medium](https://medium.com/@reactjsbd/top-10-icon-libraries-for-react-development-a-comprehensive-guide-e7b4b6795027)
- [Comparing icon libraries for shadcn/ui | shadcndesign](https://www.shadcndesign.com/blog/comparing-icon-libraries-shadcn-ui)

### Design Systems Comparison
- [Geist Design System - Vercel | Figma](https://www.figma.com/community/file/1330020847221146106/geist-design-system-vercel)
- [Geist](https://vercel.com/geist/introduction)
- [React UI with shadcn/ui + Radix + Tailwind | Vercel Academy](https://vercel.com/academy/shadcn-ui)
- [Catalyst - Tailwind CSS Application UI Kit](https://tailwindcss.com/plus/ui-kit)
- [Home | Park UI](https://park-ui.com/)
- [React UI libraries in 2025: Comparing shadcn/ui, Radix, Mantine, MUI, Chakra & more - Makers' Den](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra)
- [Mantine vs shadcn/ui: Complete Developer Comparison - 2026 | SaaSIndie Blog](https://saasindie.com/blog/mantine-vs-shadcn-ui-comparison)

### CSS Layout (Grid, Flexbox, Container Queries)
- [Container Query Solutions with CSS Grid and Flexbox | Modern CSS Solutions](https://moderncss.dev/container-query-solutions-with-css-grid-and-flexbox/)
- [Building a Responsive Layout in 2025: CSS Grid vs Flexbox vs Container Queries - DEV Community](https://dev.to/smriti_webdev/building-a-responsive-layout-in-2025-css-grid-vs-flexbox-vs-container-queries-234m)
- [Modern CSS Layout Techniques: Flexbox, Grid & Subgrid with Browser Support (2025-2026 Guide) | FrontendTools](https://www.frontendtools.tech/blog/modern-css-layout-techniques-flexbox-grid-subgrid-2025)

### Figma to Code & Design Handoff
- [Figma Token Exporter | Figma](https://www.figma.com/community/plugin/1345069854741911632/figma-token-exporter)
- [GitHub - Convertiv/handoff-app: A toolchain for Figma design tokens](https://github.com/Convertiv/handoff-app)
- [Automated Design Handoff & Token Documentation | Handoff.com](https://www.handoff.com/)
- [Design System Mastery with Figma Variables: The 2025/2026 Best-Practice Playbook | Medium](https://www.designsystemscollective.com/design-system-mastery-with-figma-variables-the-2025-2026-best-practice-playbook-da0500ca0e66)
- [Dev Mode: Design-to-Development | Figma](https://www.figma.com/dev-mode/)

### Style Dictionary
- [Design Tokens | Style Dictionary](https://styledictionary.com/info/tokens/)
- [GitHub - style-dictionary/style-dictionary: A build system for creating cross-platform styles](https://github.com/style-dictionary/style-dictionary)
- [Design Tokens specification reaches first stable version | Design Tokens Community Group](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- [Building a Scalable Design Token System: From Figma to Code with Style Dictionary | Medium](https://medium.com/@mailtorahul2485/building-a-scalable-design-token-system-from-figma-to-code-with-style-dictionary-e2c9eacc75aa)

---

**End of Research Report**
