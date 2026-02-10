"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "../ui/button";

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface MerkleTreeViewProps {
  readonly merkleRoot: string;
  readonly nullifierHash: string;
}

export function MerkleTreeView({
  merkleRoot,
  nullifierHash,
}: MerkleTreeViewProps) {
  const [copiedField, setCopiedField] = useState("");

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  return (
    <>
      {merkleRoot && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Merkle Root (On-chain)
            </p>
            <div className="flex items-center gap-1">
              <pre className="flex-1 rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                <code>{truncateHex(merkleRoot, 16)}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(merkleRoot, "root")}
                title={copiedField === "root" ? "Copied" : "Copy"}
                aria-label="Copy to clipboard"
              >
                {copiedField === "root" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {nullifierHash && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Nullifier (Anti-Double-Claim)
            </p>
            <p className="text-xs text-muted-foreground">
              Derived from the address and airdrop ID. Prevents the same address
              from claiming twice without revealing which address claimed.
            </p>
            <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
              <code>{truncateHex(nullifierHash, 16)}</code>
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
