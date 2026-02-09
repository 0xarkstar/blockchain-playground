"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface EligibleAddress {
  readonly id: number;
  readonly address: string;
  readonly commitment: string;
}

interface ClaimPanelProps {
  readonly addresses: readonly EligibleAddress[];
  readonly claimIndex: number;
  readonly phase: string;
  readonly progressMessage: string;
  readonly onClaimIndexChange: (index: number) => void;
  readonly onClaim: () => void;
}

export function ClaimPanel({
  addresses,
  claimIndex,
  phase,
  progressMessage,
  onClaimIndexChange,
  onClaim,
}: ClaimPanelProps) {
  if (
    phase !== "ready" &&
    phase !== "proving" &&
    phase !== "proved" &&
    phase !== "verifying" &&
    phase !== "verified"
  ) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">
          Step 3: Claim Airdrop Privately
        </p>
        <p className="text-xs text-muted-foreground">
          Prove you are in the eligibility list without revealing which address
          is yours. Select which address to claim as:
        </p>
        <div className="flex items-center gap-1 flex-wrap">
          {addresses.map((addr, idx) => (
            <Button
              key={addr.id}
              variant={idx === claimIndex ? "default" : "outline"}
              size="sm"
              onClick={() => onClaimIndexChange(idx)}
              disabled={phase !== "ready"}
            >
              Address {idx + 1}
            </Button>
          ))}
        </div>
        {progressMessage && phase === "proving" && (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {progressMessage}
            </p>
          </div>
        )}
        <Button
          onClick={onClaim}
          disabled={phase !== "ready"}
        >
          Generate Claim Proof
        </Button>
      </div>
    </div>
  );
}
