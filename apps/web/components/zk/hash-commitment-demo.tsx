"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  createCommitment,
  verifyCommitment,
  generateNonce,
  type HashScheme,
} from "../../lib/zk/commitment";
import { StepCard } from "../shared";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../ui/table";

type Phase = "commit" | "reveal";

export function HashCommitmentDemo() {
  const [secret, setSecret] = useState("42");
  const [nonce, setNonce] = useState(() => generateNonce());
  const [scheme, setScheme] = useState<HashScheme>("sha256");
  const [phase, setPhase] = useState<Phase>("commit");
  const [commitHash, setCommitHash] = useState("");
  const [revealSecret, setRevealSecret] = useState("");
  const [revealNonce, setRevealNonce] = useState("");
  const [result, setResult] = useState("");
  const [resultValid, setResultValid] = useState<boolean | null>(null);

  const handleCommit = () => {
    const c = createCommitment(secret, nonce, scheme);
    setCommitHash(c.commitHash);
    setPhase("reveal");
    setResult(`Commitment created with ${scheme}`);
    setResultValid(null);
  };

  const handleReveal = () => {
    const v = verifyCommitment(revealSecret, revealNonce, commitHash, scheme);
    setResult(v.message);
    setResultValid(v.valid);
  };

  const handleReset = () => {
    setPhase("commit");
    setCommitHash("");
    setRevealSecret("");
    setRevealNonce("");
    setResult("");
    setResultValid(null);
    setNonce(generateNonce());
  };

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          A commitment scheme lets you &quot;lock in&quot; a value without
          revealing it. Later, you reveal the value and nonce to prove you
          committed to it.
        </AlertDescription>
      </Alert>

      {phase === "commit" ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Phase 1: Commit</p>
            <div>
              <Label htmlFor="secret-value">Secret value</Label>
              <Input
                id="secret-value"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="random-nonce">Random nonce</Label>
              <p className="text-xs text-muted-foreground mb-1">
                Random blinding factor prevents guessing
              </p>
              <Input
                id="random-nonce"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="zk-hashcommit-scheme">Hash scheme</Label>
              <Select value={scheme} onValueChange={(v) => setScheme(v as HashScheme)}>
                <SelectTrigger id="zk-hashcommit-scheme" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sha256">SHA-256</SelectItem>
                  <SelectItem value="keccak256">Keccak-256 (Ethereum)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" onClick={handleCommit}>
              Create Commitment
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Commitment (public)</p>
              <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                <code>{commitHash}</code>
              </pre>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {scheme}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold">Phase 2: Reveal</p>
              <div>
                <Label htmlFor="zk-hashcommit-reveal-secret">Reveal secret</Label>
                <Input
                  id="zk-hashcommit-reveal-secret"
                  value={revealSecret}
                  onChange={(e) => setRevealSecret(e.target.value)}
                  placeholder="Enter the original secret"
                />
              </div>
              <div>
                <Label htmlFor="zk-hashcommit-reveal-nonce">Reveal nonce</Label>
                <Input
                  id="zk-hashcommit-reveal-nonce"
                  value={revealNonce}
                  onChange={(e) => setRevealNonce(e.target.value)}
                  placeholder="Enter the original nonce"
                />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300" onClick={handleReveal}>
                  Verify
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <Alert
          className={
            resultValid === null
              ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
              : resultValid
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
          }
        >
          <Info className="h-4 w-4" />
          <AlertDescription>{result}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Commit-Reveal Process</p>
          <StepCard
            stepNumber={1}
            title="Commit"
            description="Hash your secret with a random nonce. Publish only the hash."
            color={phase === "commit" ? "blue" : commitHash ? "green" : "gray"}
          />
          <StepCard
            stepNumber={2}
            title="Wait"
            description="The commitment is public but reveals nothing about the secret."
            color={
              phase === "reveal" && !resultValid
                ? "blue"
                : resultValid !== null
                  ? "green"
                  : "gray"
            }
          />
          <StepCard
            stepNumber={3}
            title="Reveal"
            description="Publish your secret and nonce. Anyone can verify they match."
            color={
              resultValid === true
                ? "green"
                : resultValid === false
                  ? "red"
                  : "gray"
            }
          />
          <StepCard
            stepNumber={4}
            title="Verify"
            description="Recompute hash(secret || nonce) and compare with the commitment."
            isLast
            color={
              resultValid === true
                ? "green"
                : resultValid === false
                  ? "red"
                  : "gray"
            }
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">How It Works</p>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge variant="secondary">Commit</Badge>
                </TableCell>
                <TableCell>hash(secret || nonce) → commitment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Reveal
                  </Badge>
                </TableCell>
                <TableCell>
                  Publish (secret, nonce). Anyone can verify hash matches.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    Hiding
                  </Badge>
                </TableCell>
                <TableCell>Commitment reveals nothing about the secret</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    Binding
                  </Badge>
                </TableCell>
                <TableCell>
                  Cannot find another (secret, nonce) that gives the same hash
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
