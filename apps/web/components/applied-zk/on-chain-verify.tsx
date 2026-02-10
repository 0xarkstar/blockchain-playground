"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, ExternalLink, Loader2, Copy, Globe } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { type Address, isAddress } from "viem";
import {
  exportSolidityCalldata,
  parseCalldata,
} from "../../lib/applied-zk/snarkjs";
import type { ProofGenerationResult } from "../../lib/applied-zk/snarkjs";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface OnChainVerifyProps {
  readonly proofResult: ProofGenerationResult;
  readonly verifierAbi: readonly object[];
  readonly defaultAddress?: Address | null;
  readonly circuitName: string;
}

export function OnChainVerify({
  proofResult,
  verifierAbi,
  defaultAddress,
  circuitName,
}: OnChainVerifyProps) {
  const { isConnected } = useAccount();
  const [contractAddress, setContractAddress] = useState(
    defaultAddress ?? "",
  );
  const [calldata, setCalldata] = useState<{
    pA: [string, string];
    pB: [[string, string], [string, string]];
    pC: [string, string];
    pubSignals: string[];
  } | null>(null);
  const [rawCalldata, setRawCalldata] = useState("");
  const [verifyEnabled, setVerifyEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  // Export calldata on mount / proof change
  useEffect(() => {
    async function exportData() {
      try {
        const raw = await exportSolidityCalldata(
          proofResult.proof,
          proofResult.publicSignals,
        );
        setRawCalldata(raw);
        const parsed = parseCalldata(raw);
        setCalldata(parsed);
      } catch {
        setRawCalldata("Failed to export calldata");
      }
    }
    exportData();
  }, [proofResult]);

  // Prepare contract call args
  const contractArgs = calldata
    ? [
        calldata.pA.map(BigInt),
        calldata.pB.map((row) => row.map(BigInt)),
        calldata.pC.map(BigInt),
        calldata.pubSignals.map(BigInt),
      ]
    : undefined;

  const validAddress =
    typeof contractAddress === "string" && isAddress(contractAddress);

  const {
    data: onChainResult,
    isLoading: isVerifying,
    error: verifyError,
    refetch,
  } = useReadContract({
    address: validAddress ? (contractAddress as Address) : undefined,
    abi: verifierAbi,
    functionName: "verifyProof",
    args: contractArgs,
    query: {
      enabled: verifyEnabled && validAddress && !!contractArgs && isConnected,
    },
  });

  const handleVerify = useCallback(() => {
    setVerifyEnabled(true);
    refetch();
  }, [refetch]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(rawCalldata);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [rawCalldata]);

  const explorerUrl = validAddress
    ? `https://sepolia.basescan.org/address/${contractAddress}`
    : null;

  return (
    <div className="flex flex-col gap-4">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">
          On-Chain Verification
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Verify this ZK proof on-chain using the deployed Groth16 verifier
          contract on Base Sepolia. The verifier&apos;s{" "}
          <code className="text-xs font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">
            verifyProof()
          </code>{" "}
          function is a view call — no gas required.
        </AlertDescription>
      </Alert>

      {/* Solidity Calldata */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Solidity Calldata</p>
            <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy calldata">
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This is the exact calldata that would be passed to the Groth16
            verifier contract&apos;s{" "}
            <code className="font-mono">verifyProof()</code> function.
          </p>
          <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto font-mono max-h-40">
            <code>
              {calldata
                ? `verifyProof(\n  [${calldata.pA.join(",\n   ")}],\n  [[${calldata.pB[0].join(",")}],\n   [${calldata.pB[1].join(",")}]],\n  [${calldata.pC.join(",\n   ")}],\n  [${calldata.pubSignals.join(",\n   ")}]\n)`
                : "Exporting..."}
            </code>
          </pre>
        </div>
      </div>

      {/* Contract Address */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="verifier-address">Verifier Contract Address</Label>
            <Badge variant="secondary">Base Sepolia</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the address of the deployed {circuitName} Groth16 verifier
            contract.
            {!defaultAddress &&
              " Deploy the verifier first using the Hardhat deploy script."}
          </p>
          <div className="flex gap-2">
            <Input
              id="verifier-address"
              value={contractAddress}
              onChange={(e) => {
                setContractAddress(e.target.value);
                setVerifyEnabled(false);
              }}
              placeholder="0x..."
              className="font-mono text-sm"
            />
            {explorerUrl && (
              <Button variant="ghost" size="icon" asChild aria-label="Open block explorer">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Verify Button */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Verify On-Chain</p>
          {!isConnected && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Connect your wallet to verify on-chain.
            </p>
          )}
          {!validAddress && contractAddress && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Invalid contract address.
            </p>
          )}
          <Button
            onClick={handleVerify}
            disabled={!isConnected || !validAddress || isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying on-chain...
              </>
            ) : (
              "Verify On-Chain (View Call)"
            )}
          </Button>

          {onChainResult !== undefined && (
            <Alert
              className={
                onChainResult
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              }
            >
              {onChainResult ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <AlertDescription>
                {onChainResult
                  ? "On-chain verification succeeded! The Groth16 verifier contract confirmed the proof is valid."
                  : "On-chain verification failed. The proof was rejected by the verifier contract."}
              </AlertDescription>
            </Alert>
          )}

          {verifyError && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <X className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Error: {verifyError.message.slice(0, 200)}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
