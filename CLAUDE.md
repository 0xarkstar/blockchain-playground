# Blockchain Playground

Interactive blockchain education platform with 6 learning tracks and 59 demos (all complete).

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **App**: Next.js 16 + React 19 + App Router
- **UI**: shadcn/ui + Tailwind CSS v4 + OKLCH design tokens
- **Web3**: wagmi v2 + viem v2 + RainbowKit v2
- **Contracts**: Hardhat + Solidity 0.8.24
- **ZK**: circom 2.1.0 + snarkjs (Groth16) + circomlibjs (Poseidon)
- **Crypto**: @noble/hashes, @noble/secp256k1, @scure/bip32, @scure/bip39
- **i18n**: next-intl (EN, KO)
- **Testing**: Vitest (709 unit tests) + Playwright (54 E2E tests) + Hardhat (162 contract tests)
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions (quality + e2e)
- **Chain**: Base Sepolia testnet

## Project Structure

```
apps/web/              # Next.js app
  app/[locale]/        # i18n route root
    (tracks)/          # Route group for track pages
      fundamentals/    # Track 1: 11 demos
      defi/            # Track 2: 11 demos
      solidity/        # Track 3: 11 demos
      tokens/          # Track 4: 11 demos
      zk/              # Track 5: 11 demos
      applied-zk/      # Track 6: 4 demos (on-chain ZK verification)
  components/          # React components by track
    ui/                # shadcn/ui components (19 Radix-based)
    shared/            # Shared demo components (DemoLayout, EducationPanel, etc.)
    layout/            # App shell, command palette
    applied-zk/        # Applied ZK demo components + on-chain verify
  lib/                 # Utility libraries
    applied-zk/        # snarkjs wrapper, Poseidon, Merkle, ABIs, contract addresses
  messages/            # i18n JSON files
  public/circuits/     # Compiled circuit artifacts (WASM, zkey, verification keys)
packages/
  ui/                  # Shared components (plain HTML + Tailwind)
  contracts/           # Solidity contracts (Hardhat)
    src/zk/            # ZK verifier contracts + Groth16 verifiers
    circuits/          # Circom circuit source files
    scripts/           # Deploy scripts (deploy-zk.ts)
  web3-config/         # wagmi/viem/RainbowKit config
  utils/               # Shared utilities
  tsconfig/            # Shared TypeScript configs
```

## Commands

- `pnpm dev` - Start dev server
- `pnpm build` - Build all packages
- `pnpm test` - Run unit tests (Vitest) + contract tests (Hardhat)
- `pnpm test:e2e` - Run E2E tests (Playwright)
- `pnpm lint` - Lint all packages (ESLint)
- `pnpm format:check` - Check formatting (Prettier)
- `pnpm format` - Auto-format all files (Prettier)

## Routing Pattern

`/{locale}/{track}/demo/{slug}` e.g. `/en/fundamentals/demo/hash-explorer`

## Key Patterns

- All demo components are client components (`"use client"`)
- Demo pages are server components that import client demo components
- Crypto operations use @noble libraries (audited, no native deps)
- i18n messages structured: `{track}.demos.{demoKey}.title/description`
- Immutable state patterns — always create new objects, never mutate
- Dark mode via next-themes (`attribute="class"`, `class="dark"` on html)
- shadcn Label requires explicit `htmlFor`/`id` pairing (unlike Mantine TextInput)
- ZK circuits compiled with circom 2.2.3, artifacts served from `public/circuits/`
- On-chain verification uses wagmi `useReadContract` (view call, no gas)
- Deploy ZK contracts: `npx hardhat run scripts/deploy-zk.ts --network baseSepolia`
