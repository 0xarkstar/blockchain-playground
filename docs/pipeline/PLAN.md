# UI/UX Improvement Pipeline

## Phase: P1 Implementation

### Zone A — Shared Infrastructure (`p-impl-A`, sonnet)
1. globals.css — prefers-reduced-motion
2. registry.ts — onChainBadgeColor constant
3. demo-layout.tsx — remove duplicate difficultyColors, import from registry; overflow-x-auto on TabsList
4. demo-page-wrapper.tsx — use onChainBadgeColor from registry
5. demo-nav-footer.tsx — mobile title truncation
6. app-shell-layout.tsx — Sheet scroll + Cmd+K hint
7. track-page-layout.tsx [NEW] — extract shared track page structure

### Zone B — Track Pages & Animation Migration (`p-impl-B`, sonnet)
8. Simplify 5 standard track pages using TrackPageLayout
9. Simplify applied-zk page with extraSections
10. Migrate 12 applied-zk demo files: framer-motion → motion/react
11. Remove framer-motion dep from package.json

### Zone C — Tests (`p-test-writer`, sonnet)
12. track-page-layout.test.tsx
13. no-framer-motion.test.ts

## Dependencies
- Zone B blocked by Zone A (needs track-page-layout.tsx)
- Zone C blocked by Zone A + Zone B
