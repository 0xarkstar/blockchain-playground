"use client";

import { Plane, Plus, Trash2, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface EligibleAddress {
  readonly id: number;
  readonly address: string;
  readonly commitment: string;
}

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface AirdropSetupPanelProps {
  readonly addresses: readonly EligibleAddress[];
  readonly newAddress: string;
  readonly claimIndex: number;
  readonly phase: string;
  readonly onAddAddress: () => void;
  readonly onRemoveAddress: (id: number) => void;
  readonly onNewAddressChange: (value: string) => void;
  readonly onBuildTree: () => void;
  readonly progressMessage: string;
}

export function AirdropSetupPanel({
  addresses,
  newAddress,
  claimIndex,
  phase,
  onAddAddress,
  onRemoveAddress,
  onNewAddressChange,
  onBuildTree,
  progressMessage,
}: AirdropSetupPanelProps) {
  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Step 1: Eligible Addresses
          </p>
          <p className="text-xs text-muted-foreground">
            These addresses are eligible for the airdrop. In production, this
            list would be compiled off-chain (e.g., early users, token holders
            at a snapshot).
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Address</TableHead>
                {addresses.some((a) => a.commitment) && (
                  <TableHead>Commitment</TableHead>
                )}
                {phase === "setup" && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.map((addr, idx) => (
                <TableRow key={addr.id}>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        idx === claimIndex && phase !== "setup"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : ""
                      }
                    >
                      {idx + 1}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{truncateHex(addr.address, 8)}</code>
                  </TableCell>
                  {addresses.some((a) => a.commitment) && (
                    <TableCell>
                      {addr.commitment ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{truncateHex(addr.commitment, 6)}</code>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          pending
                        </p>
                      )}
                    </TableCell>
                  )}
                  {phase === "setup" && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                        onClick={() => onRemoveAddress(addr.id)}
                        disabled={addresses.length <= 2}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {phase === "setup" && (
            <div className="flex items-center gap-1">
              <Input
                placeholder="0x... (Ethereum address)"
                value={newAddress}
                onChange={(e) => onNewAddressChange(e.target.value)}
                className="flex-1 text-xs"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={onAddAddress}
                disabled={!newAddress.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Step 2: Build Eligibility Tree
          </p>
          <p className="text-xs text-muted-foreground">
            Hash each address with Poseidon and insert into a Merkle tree. Only
            the Merkle root is published on-chain.
          </p>
          {progressMessage && phase === "building" && (
            <div className="flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {progressMessage}
              </p>
            </div>
          )}
          <Button
            onClick={onBuildTree}
            disabled={phase !== "setup" || addresses.length < 2}
          >
            <Plane className="mr-2 h-4 w-4" />
            Build Merkle Tree
          </Button>
        </div>
      </div>
    </>
  );
}
