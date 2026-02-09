"use client";

import { Badge } from "../ui/badge";

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface ResultsPanelProps {
  readonly nullifierHash: string;
  readonly merkleRoot: string;
  readonly proofResult: {
    proof: {
      pi_a: string[];
    };
    publicSignals: unknown[];
  } | null;
}

export function ResultsPanel({
  nullifierHash,
  merkleRoot,
  proofResult,
}: ResultsPanelProps) {
  return (
    <>
      {nullifierHash && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Nullifier (Anti-Double-Vote)
            </p>
            <p className="text-xs text-muted-foreground">
              The nullifier is derived from your secret and the proposal ID. If
              submitted twice, it will be detected and rejected. It does not
              reveal your identity.
            </p>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                Unique per proposal
              </Badge>
            </div>
            <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
              <code>{truncateHex(nullifierHash, 16)}</code>
            </pre>
          </div>
        </div>
      )}

      {merkleRoot && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Merkle Root (Voter Registry)
            </p>
            <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
              <code>{truncateHex(merkleRoot, 16)}</code>
            </pre>
          </div>
        </div>
      )}

      {proofResult && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Vote Proof
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Generated
              </Badge>
            </div>
            <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
              <code>
                {`pi_a: [${proofResult.proof.pi_a
                  .slice(0, 2)
                  .map((v) => truncateHex(v, 8))
                  .join(", ")}]\n`}
                {`public signals: ${proofResult.publicSignals.length} values`}
              </code>
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
