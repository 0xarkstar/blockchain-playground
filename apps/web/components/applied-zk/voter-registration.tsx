"use client";

import { useState } from "react";
import { ThumbsUp, Check, Copy } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface VoterRegistrationData {
  readonly secret: bigint;
  readonly commitment: bigint;
  readonly commitmentHex: string;
}

interface VoterRegistrationProps {
  readonly voter: VoterRegistrationData | null;
  readonly otherVoters: readonly string[];
  readonly phase: string;
  readonly onRegister: () => void;
}

export function VoterRegistration({
  voter,
  otherVoters,
  phase,
  onRegister,
}: VoterRegistrationProps) {
  const [copiedHex, setCopiedHex] = useState("");

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(""), 2000);
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Step 1: Register as Voter
          </p>
          <p className="text-xs text-muted-foreground">
            Generate a secret identity and register your commitment in the voter
            registry (Merkle tree). Three simulated voters are also registered.
          </p>
          <Button
            onClick={onRegister}
            disabled={phase !== "setup"}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Register Identity
          </Button>
        </div>
      </div>

      {voter && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Voter Registry
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voter</TableHead>
                  <TableHead>Identity Commitment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      You
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{truncateHex(voter.commitmentHex, 8)}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(voter.commitmentHex)}
                        title={copiedHex === voter.commitmentHex ? "Copied" : "Copy"}
                        aria-label="Copy to clipboard"
                      >
                        {copiedHex === voter.commitmentHex ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {otherVoters.map((hex, i) => (
                  <TableRow key={`voter-${i}`}>
                    <TableCell>
                      <Badge variant="secondary">
                        Voter {i + 2}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{hex}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}
