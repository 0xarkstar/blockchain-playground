# Blockchain Playground

Interactive blockchain education platform with 5 learning tracks and ~55 demos.

## Tech Stack
- **Monorepo**: Turborepo + pnpm
- **App**: Next.js 16 + React 19 + App Router
- **UI**: Mantine v7 + Tailwind CSS
- **Web3**: wagmi v2 + viem v2 + RainbowKit v2
- **Contracts**: Hardhat + Solidity 0.8.24
- **Crypto**: @noble/hashes, @noble/secp256k1, @scure/bip32, @scure/bip39
- **i18n**: next-intl (EN, KO)
- **Testing**: Vitest + Playwright
- **Chain**: Base Sepolia testnet

## Project Structure
```
apps/web/              # Next.js app
  app/[locale]/        # i18n route root
    (tracks)/          # Route group for track pages
      fundamentals/    # Track 1: 11 demos
      defi/            # Track 2 (planned)
      solidity/        # Track 3 (planned)
      tokens/          # Track 4 (planned)
      zk/              # Track 5 (planned)
  components/          # React components by track
  lib/                 # Utility libraries (blockchain, wallet, trie, web3)
  messages/            # i18n JSON files
packages/
  ui/                  # Shared Mantine components
  contracts/           # Solidity contracts (Hardhat)
  web3-config/         # wagmi/viem/RainbowKit config
  utils/               # Shared utilities
  tsconfig/            # Shared TypeScript configs
```

## Commands
- `pnpm dev` - Start dev server
- `pnpm build` - Build all packages
- `pnpm test` - Run unit tests (Vitest)
- `pnpm test:e2e` - Run E2E tests (Playwright)

## Routing Pattern
`/{locale}/{track}/demo/{slug}` e.g. `/en/fundamentals/demo/hash-explorer`

## Key Patterns
- All demo components are client components (`"use client"`)
- Demo pages are server components that import client demo components
- Crypto operations use @noble libraries (audited, no native deps)
- i18n messages structured: `{track}.demos.{demoKey}.title/description`
- Immutable state patterns — always create new objects, never mutate
