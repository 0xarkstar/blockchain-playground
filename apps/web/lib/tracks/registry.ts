import {
  Box,
  Coins,
  Code,
  Diamond,
  Lock,
  ShieldCheck,
  Hash,
  Key,
  Link2,
  GitBranch,
  Pickaxe,
  ArrowLeftRight,
  Wallet,
  Network,
  Database,
  Flame,
  Droplet,
  TrendingDown,
  Landmark,
  LineChart,
  Zap,
  Scale,
  Radio,
  AlertTriangle,
  Calculator,
  FileCode,
  Braces,
  ShieldCheck as ShieldCheckSolidity,
  FileText,
  PlugZap,
  Bug,
  Layers,
  Terminal,
  Image,
  Clock,
  Store,
  Crown,
  Link,
  Eye,
  Fingerprint,
  SlidersHorizontal,
  GitFork,
  FunctionSquare,
  BarChart3,
  Puzzle,
  EyeOff,
  KeyRound,
  Grid3x3,
  Award,
  Palette,
  ThumbsUp,
  Plane,
  Shuffle,
  Users,
  Gavel,
  type LucideIcon,
} from "lucide-react";

export interface DemoEntry {
  readonly key: string;
  readonly slug: string;
  readonly icon: LucideIcon;
  readonly difficulty: "beginner" | "intermediate" | "advanced";
  readonly onChain?: boolean;
  readonly featured?: boolean;
}

export interface TrackEntry {
  readonly key: string;
  readonly trackNumber: number;
  readonly href: string;
  readonly color: string;
  readonly icon: LucideIcon;
  readonly demos: readonly DemoEntry[];
  readonly auroraColors: readonly [string, string, string, string];
  readonly stats: readonly { readonly value: number; readonly label: string }[];
  readonly i18nNamespace: string;
}

export const tracks: readonly TrackEntry[] = [
  {
    key: "fundamentals",
    trackNumber: 1,
    href: "/fundamentals",
    color: "blue",
    icon: Box,
    i18nNamespace: "fundamentals",
    auroraColors: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
    stats: [
      { value: 11, label: "Demos" },
      { value: 4, label: "On-Chain" },
    ],
    demos: [
      { key: "hashExplorer", slug: "hash-explorer", icon: Hash, difficulty: "beginner", onChain: false, featured: true },
      { key: "blockBuilder", slug: "block-builder", icon: Box, difficulty: "beginner", onChain: false },
      { key: "chainIntegrity", slug: "chain-integrity", icon: Link2, difficulty: "beginner", onChain: false },
      { key: "merkleProof", slug: "merkle-proof", icon: GitBranch, difficulty: "beginner", onChain: true },
      { key: "signatureStudio", slug: "signature-studio", icon: Key, difficulty: "beginner", onChain: true },
      { key: "transactionBuilder", slug: "transaction-builder", icon: ArrowLeftRight, difficulty: "intermediate", onChain: true },
      { key: "walletWorkshop", slug: "wallet-workshop", icon: Wallet, difficulty: "intermediate", onChain: false },
      { key: "miningSimulator", slug: "mining-simulator", icon: Pickaxe, difficulty: "intermediate", onChain: false },
      { key: "consensusPlayground", slug: "consensus-playground", icon: Network, difficulty: "intermediate", onChain: false },
      { key: "stateExplorer", slug: "state-explorer", icon: Database, difficulty: "advanced", onChain: false },
      { key: "gasEstimator", slug: "gas-estimator", icon: Flame, difficulty: "advanced", onChain: true },
    ],
  },
  {
    key: "defi",
    trackNumber: 2,
    href: "/defi",
    color: "green",
    icon: Coins,
    i18nNamespace: "defi",
    auroraColors: ["#059669", "#10b981", "#34d399", "#6ee7b7"],
    stats: [
      { value: 11, label: "Demos" },
      { value: 5, label: "Protocols" },
    ],
    demos: [
      { key: "simpleSwap", slug: "simple-swap", icon: ArrowLeftRight, difficulty: "beginner", featured: true },
      { key: "liquidityPool", slug: "liquidity-pool", icon: Droplet, difficulty: "beginner" },
      { key: "impermanentLoss", slug: "impermanent-loss", icon: TrendingDown, difficulty: "beginner" },
      { key: "interestRateExplorer", slug: "interest-rate-explorer", icon: LineChart, difficulty: "beginner" },
      { key: "lendingProtocol", slug: "lending-protocol", icon: Landmark, difficulty: "beginner" },
      { key: "stakingRewards", slug: "staking-rewards", icon: Coins, difficulty: "intermediate" },
      { key: "oraclePriceFeed", slug: "oracle-price-feed", icon: Radio, difficulty: "intermediate" },
      { key: "flashLoan", slug: "flash-loan", icon: Zap, difficulty: "intermediate" },
      { key: "arbitrageSimulator", slug: "arbitrage-simulator", icon: Scale, difficulty: "intermediate" },
      { key: "liquidationSimulator", slug: "liquidation-simulator", icon: AlertTriangle, difficulty: "advanced" },
      { key: "yieldCalculator", slug: "yield-calculator", icon: Calculator, difficulty: "advanced" },
    ],
  },
  {
    key: "solidity",
    trackNumber: 3,
    href: "/solidity",
    color: "orange",
    icon: Code,
    i18nNamespace: "solidity",
    auroraColors: ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d"],
    stats: [
      { value: 11, label: "Demos" },
      { value: 3, label: "Patterns" },
    ],
    demos: [
      { key: "dataTypes", slug: "data-types", icon: FileCode, difficulty: "beginner", featured: true },
      { key: "storageLayout", slug: "storage-layout", icon: Database, difficulty: "beginner" },
      { key: "dataLocations", slug: "data-locations", icon: Box, difficulty: "intermediate" },
      { key: "abiEncoder", slug: "abi-encoder", icon: Braces, difficulty: "beginner" },
      { key: "accessControl", slug: "access-control", icon: ShieldCheckSolidity, difficulty: "beginner" },
      { key: "eventLogInspector", slug: "event-log-inspector", icon: FileText, difficulty: "intermediate" },
      { key: "contractInteractions", slug: "contract-interactions", icon: PlugZap, difficulty: "intermediate" },
      { key: "gasOptimizer", slug: "gas-optimizer", icon: Flame, difficulty: "intermediate" },
      { key: "reentrancyAttack", slug: "reentrancy-attack", icon: Bug, difficulty: "advanced" },
      { key: "proxyPatterns", slug: "proxy-patterns", icon: Layers, difficulty: "advanced" },
      { key: "assemblyPlayground", slug: "assembly-playground", icon: Terminal, difficulty: "advanced" },
    ],
  },
  {
    key: "tokens",
    trackNumber: 4,
    href: "/tokens",
    color: "violet",
    icon: Diamond,
    i18nNamespace: "tokens",
    auroraColors: ["#e11d48", "#f43f5e", "#fb7185", "#fda4af"],
    stats: [
      { value: 11, label: "Demos" },
      { value: 4, label: "Standards" },
    ],
    demos: [
      { key: "erc20Creator", slug: "erc20-creator", icon: Coins, difficulty: "beginner", featured: true },
      { key: "tokenAllowance", slug: "token-allowance", icon: ArrowLeftRight, difficulty: "beginner" },
      { key: "erc721Minter", slug: "erc721-minter", icon: Image, difficulty: "beginner" },
      { key: "erc1155MultiToken", slug: "erc1155-multi-token", icon: Layers, difficulty: "beginner" },
      { key: "nftMetadata", slug: "nft-metadata", icon: FileText, difficulty: "intermediate" },
      { key: "tokenVesting", slug: "token-vesting", icon: Clock, difficulty: "intermediate" },
      { key: "nftMarketplace", slug: "nft-marketplace", icon: Store, difficulty: "intermediate" },
      { key: "dutchAuction", slug: "dutch-auction", icon: TrendingDown, difficulty: "intermediate" },
      { key: "eip2981Royalties", slug: "eip2981-royalties", icon: Crown, difficulty: "advanced" },
      { key: "tokenGovernance", slug: "token-governance", icon: Scale, difficulty: "advanced" },
      { key: "soulboundTokens", slug: "soulbound-tokens", icon: Link, difficulty: "advanced" },
    ],
  },
  {
    key: "zk",
    trackNumber: 5,
    href: "/zk",
    color: "red",
    icon: Lock,
    i18nNamespace: "zk",
    auroraColors: ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc"],
    stats: [
      { value: 11, label: "Demos" },
      { value: 5, label: "Protocols" },
    ],
    demos: [
      { key: "zkConcepts", slug: "zk-concepts", icon: Eye, difficulty: "beginner", featured: true },
      { key: "hashCommitment", slug: "hash-commitment", icon: Hash, difficulty: "beginner" },
      { key: "schnorrProtocol", slug: "schnorr-protocol", icon: Fingerprint, difficulty: "beginner" },
      { key: "pedersenCommitment", slug: "pedersen-commitment", icon: ShieldCheck, difficulty: "intermediate" },
      { key: "rangeProof", slug: "range-proof", icon: SlidersHorizontal, difficulty: "intermediate" },
      { key: "zkSetMembership", slug: "zk-set-membership", icon: GitFork, difficulty: "intermediate" },
      { key: "arithmeticCircuits", slug: "arithmetic-circuits", icon: FunctionSquare, difficulty: "intermediate" },
      { key: "r1csQap", slug: "r1cs-qap", icon: BarChart3, difficulty: "advanced" },
      { key: "snarkPipeline", slug: "snark-pipeline", icon: Puzzle, difficulty: "advanced" },
      { key: "zkRollup", slug: "zk-rollup", icon: Database, difficulty: "advanced" },
      { key: "privateTransfer", slug: "private-transfer", icon: EyeOff, difficulty: "advanced" },
    ],
  },
  {
    key: "appliedZk",
    trackNumber: 6,
    href: "/applied-zk",
    color: "pink",
    icon: ShieldCheck,
    i18nNamespace: "appliedZk",
    auroraColors: ["#7c3aed", "#6366f1", "#8b5cf6", "#a78bfa"],
    stats: [
      { value: 11, label: "Demos" },
      { value: 14, label: "Circuits" },
      { value: 7, label: "Contracts" },
    ],
    demos: [
      { key: "hashPreimage", slug: "hash-preimage", icon: Hash, difficulty: "beginner", featured: true },
      { key: "passwordProof", slug: "password-proof", icon: KeyRound, difficulty: "beginner" },
      { key: "sudoku", slug: "sudoku", icon: Grid3x3, difficulty: "beginner" },
      { key: "credential", slug: "credential", icon: Award, difficulty: "beginner" },
      { key: "ageVerification", slug: "age-verification", icon: ShieldCheck, difficulty: "intermediate" },
      { key: "mastermind", slug: "mastermind", icon: Palette, difficulty: "intermediate" },
      { key: "secretVoting", slug: "secret-voting", icon: ThumbsUp, difficulty: "advanced" },
      { key: "privateAirdrop", slug: "private-airdrop", icon: Plane, difficulty: "advanced" },
      { key: "mixer", slug: "mixer", icon: Shuffle, difficulty: "advanced" },
      { key: "privateClub", slug: "private-club", icon: Users, difficulty: "advanced" },
      { key: "sealedAuction", slug: "sealed-auction", icon: Gavel, difficulty: "advanced" },
    ],
  },
];

export function getTrackByKey(key: string): TrackEntry | undefined {
  return tracks.find((t) => t.key === key);
}

export function getTrackByHref(href: string): TrackEntry | undefined {
  return tracks.find((t) => t.href === href);
}

export function getDemoIndex(trackKey: string, slug: string): number {
  const track = getTrackByKey(trackKey);
  if (!track) return -1;
  return track.demos.findIndex((d) => d.slug === slug);
}

export function getAdjacentDemos(
  trackKey: string,
  slug: string,
): { prev: DemoEntry | null; next: DemoEntry | null } {
  const track = getTrackByKey(trackKey);
  if (!track) return { prev: null, next: null };
  const idx = track.demos.findIndex((d) => d.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? track.demos[idx - 1] : null,
    next: idx < track.demos.length - 1 ? track.demos[idx + 1] : null,
  };
}

export function getAllDemosFlat(): Array<{
  track: TrackEntry;
  demo: DemoEntry;
}> {
  return tracks.flatMap((track) =>
    track.demos.map((demo) => ({ track, demo })),
  );
}

export const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;

export const themeIconColors = {
  beginner: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
} as const;

export const trackBadgeColors: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export const trackThemeIconColors: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400",
  red: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400",
};
