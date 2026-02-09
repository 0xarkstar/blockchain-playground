"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Box,
  Coins,
  Code,
  Diamond,
  Lock,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../ui/command";

interface Demo {
  readonly track: string;
  readonly slug: string;
  readonly label: string;
}

interface TrackMeta {
  readonly label: string;
  readonly icon: LucideIcon;
}

const trackMeta: Record<string, TrackMeta> = {
  fundamentals: { label: "Fundamentals", icon: Box },
  defi: { label: "DeFi", icon: Coins },
  solidity: { label: "Solidity", icon: Code },
  tokens: { label: "Tokens", icon: Diamond },
  zk: { label: "ZK", icon: Lock },
  "applied-zk": { label: "Applied ZK", icon: ShieldCheck },
};

const demos: readonly Demo[] = [
  // Fundamentals (11)
  { track: "fundamentals", slug: "hash-explorer", label: "Hash Explorer" },
  { track: "fundamentals", slug: "signature-studio", label: "Signature Studio" },
  { track: "fundamentals", slug: "block-builder", label: "Block Builder" },
  { track: "fundamentals", slug: "chain-integrity", label: "Chain Integrity" },
  { track: "fundamentals", slug: "merkle-proof", label: "Merkle Proof" },
  { track: "fundamentals", slug: "mining-simulator", label: "Mining Simulator" },
  { track: "fundamentals", slug: "transaction-builder", label: "Transaction Builder" },
  { track: "fundamentals", slug: "wallet-workshop", label: "Wallet Workshop" },
  { track: "fundamentals", slug: "consensus-playground", label: "Consensus Playground" },
  { track: "fundamentals", slug: "state-explorer", label: "State Explorer" },
  { track: "fundamentals", slug: "gas-estimator", label: "Gas Estimator" },
  // DeFi (11)
  { track: "defi", slug: "simple-swap", label: "Simple Swap" },
  { track: "defi", slug: "liquidity-pool", label: "Liquidity Pool" },
  { track: "defi", slug: "impermanent-loss", label: "Impermanent Loss" },
  { track: "defi", slug: "lending-protocol", label: "Lending Protocol" },
  { track: "defi", slug: "interest-rate-explorer", label: "Interest Rate Explorer" },
  { track: "defi", slug: "staking-rewards", label: "Staking Rewards" },
  { track: "defi", slug: "flash-loan", label: "Flash Loan" },
  { track: "defi", slug: "arbitrage-simulator", label: "Arbitrage Simulator" },
  { track: "defi", slug: "oracle-price-feed", label: "Oracle Price Feed" },
  { track: "defi", slug: "liquidation-simulator", label: "Liquidation Simulator" },
  { track: "defi", slug: "yield-calculator", label: "Yield Calculator" },
  // Solidity (11)
  { track: "solidity", slug: "storage-layout", label: "Storage Layout" },
  { track: "solidity", slug: "abi-encoder", label: "ABI Encoder" },
  { track: "solidity", slug: "data-types", label: "Data Types" },
  { track: "solidity", slug: "access-control", label: "Access Control" },
  { track: "solidity", slug: "gas-optimizer", label: "Gas Optimizer" },
  { track: "solidity", slug: "event-log-inspector", label: "Event Log Inspector" },
  { track: "solidity", slug: "data-locations", label: "Data Locations" },
  { track: "solidity", slug: "contract-interactions", label: "Contract Interactions" },
  { track: "solidity", slug: "reentrancy-attack", label: "Reentrancy Attack" },
  { track: "solidity", slug: "proxy-patterns", label: "Proxy Patterns" },
  { track: "solidity", slug: "assembly-playground", label: "Assembly Playground" },
  // Tokens (11)
  { track: "tokens", slug: "erc20-creator", label: "ERC-20 Creator" },
  { track: "tokens", slug: "token-allowance", label: "Token Allowance" },
  { track: "tokens", slug: "erc721-minter", label: "ERC-721 Minter" },
  { track: "tokens", slug: "erc1155-multi-token", label: "ERC-1155 Multi Token" },
  { track: "tokens", slug: "token-vesting", label: "Token Vesting" },
  { track: "tokens", slug: "nft-metadata", label: "NFT Metadata" },
  { track: "tokens", slug: "nft-marketplace", label: "NFT Marketplace" },
  { track: "tokens", slug: "dutch-auction", label: "Dutch Auction" },
  { track: "tokens", slug: "eip2981-royalties", label: "EIP-2981 Royalties" },
  { track: "tokens", slug: "token-governance", label: "Token Governance" },
  { track: "tokens", slug: "soulbound-tokens", label: "Soulbound Tokens" },
  // ZK (11)
  { track: "zk", slug: "hash-commitment", label: "Hash Commitment" },
  { track: "zk", slug: "zk-concepts", label: "ZK Concepts" },
  { track: "zk", slug: "schnorr-protocol", label: "Schnorr Protocol" },
  { track: "zk", slug: "pedersen-commitment", label: "Pedersen Commitment" },
  { track: "zk", slug: "range-proof", label: "Range Proof" },
  { track: "zk", slug: "zk-set-membership", label: "ZK Set Membership" },
  { track: "zk", slug: "arithmetic-circuits", label: "Arithmetic Circuits" },
  { track: "zk", slug: "r1cs-qap", label: "R1CS & QAP" },
  { track: "zk", slug: "snark-pipeline", label: "SNARK Pipeline" },
  { track: "zk", slug: "zk-rollup", label: "ZK Rollup" },
  { track: "zk", slug: "private-transfer", label: "Private Transfer" },
  // Applied ZK (11)
  { track: "applied-zk", slug: "hash-preimage", label: "Hash Preimage" },
  { track: "applied-zk", slug: "age-verification", label: "Age Verification" },
  { track: "applied-zk", slug: "secret-voting", label: "Secret Voting" },
  { track: "applied-zk", slug: "private-airdrop", label: "Private Airdrop" },
  { track: "applied-zk", slug: "password-proof", label: "Password Proof" },
  { track: "applied-zk", slug: "sudoku", label: "Sudoku Verifier" },
  { track: "applied-zk", slug: "credential", label: "Credential Proof" },
  { track: "applied-zk", slug: "mastermind", label: "Mastermind Game" },
  { track: "applied-zk", slug: "mixer", label: "Privacy Mixer" },
  { track: "applied-zk", slug: "private-club", label: "Private Club" },
  { track: "applied-zk", slug: "sealed-auction", label: "Sealed Bid Auction" },
];

const tracks = Object.keys(trackMeta);

function groupByTrack(items: readonly Demo[]): Record<string, readonly Demo[]> {
  const grouped: Record<string, Demo[]> = {};
  for (const demo of items) {
    if (!grouped[demo.track]) {
      grouped[demo.track] = [];
    }
    grouped[demo.track].push(demo);
  }
  return grouped;
}

const demosByTrack = groupByTrack(demos);

interface CommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const locale = useLocale();
  const router = useRouter();

  const handleSelect = useCallback(
    (track: string, slug: string) => {
      onOpenChange(false);
      router.push(`/${locale}/${track}/demo/${slug}`);
    },
    [locale, router, onOpenChange],
  );

  const handleNavigate = useCallback(
    (path: string) => {
      onOpenChange(false);
      router.push(`/${locale}${path}`);
    },
    [locale, router, onOpenChange],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Demos"
      description="Search across all blockchain learning demos"
    >
      <CommandInput placeholder="Search demos..." />
      <CommandList>
        <CommandEmpty>No demos found.</CommandEmpty>
        {tracks.map((track) => {
          const meta = trackMeta[track];
          const trackDemos = demosByTrack[track];
          if (!trackDemos || trackDemos.length === 0) return null;
          const Icon = meta.icon;
          return (
            <CommandGroup key={track} heading={meta.label}>
              {trackDemos.map((demo) => (
                <CommandItem
                  key={`${demo.track}/${demo.slug}`}
                  value={`${demo.label} ${meta.label}`}
                  onSelect={() => handleSelect(demo.track, demo.slug)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{demo.label}</span>
                </CommandItem>
              ))}
              {track === "applied-zk" && (
                <>
                  <CommandItem
                    key="applied-zk/education/snark"
                    value="SNARK Education Applied ZK"
                    onSelect={() => handleNavigate("/applied-zk/education/snark")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>Education: SNARK</span>
                  </CommandItem>
                  <CommandItem
                    key="applied-zk/education/stark"
                    value="STARK Education Applied ZK"
                    onSelect={() => handleNavigate("/applied-zk/education/stark")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>Education: STARK</span>
                  </CommandItem>
                  <CommandItem
                    key="applied-zk/education/comparison"
                    value="Comparison Education Applied ZK"
                    onSelect={() => handleNavigate("/applied-zk/education/comparison")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>Education: Comparison</span>
                  </CommandItem>
                  <CommandItem
                    key="applied-zk/visualization/circuit"
                    value="Circuit Visualization Applied ZK"
                    onSelect={() => handleNavigate("/applied-zk/visualization/circuit")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>Visualization: Circuit</span>
                  </CommandItem>
                  <CommandItem
                    key="applied-zk/visualization/proof"
                    value="Proof Visualization Applied ZK"
                    onSelect={() => handleNavigate("/applied-zk/visualization/proof")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>Visualization: Proof</span>
                  </CommandItem>
                </>
              )}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
