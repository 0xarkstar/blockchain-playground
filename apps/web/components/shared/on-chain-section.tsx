"use client";

import { Info, FileCode } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";

interface ContractFunction {
  readonly name: string;
  readonly signature: string;
  readonly description: string;
}

interface OnChainSectionProps {
  readonly contractName: string;
  readonly contractDescription: string;
  readonly network: string;
  readonly functions: readonly ContractFunction[];
}

export function OnChainSection({
  contractName,
  contractDescription,
  network,
  functions,
}: OnChainSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Optional: On-Chain Verification</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          This demo includes a companion Solidity contract that can perform the
          same operation on-chain. Connect your wallet to explore the contract
          interface. The contract is designed for deployment on {network}.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Connect Wallet</p>
          <ConnectButton />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <FileCode className="h-4.5 w-4.5" />
            <span className="text-sm font-semibold">{contractName}</span>
            <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300">
              Solidity ^0.8.24
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{contractDescription}</p>

          <p className="text-xs font-semibold mt-1">Contract Functions</p>

          {functions.map((fn) => (
            <div key={fn.name} className="rounded-md border border-border bg-muted p-3">
              <div className="flex flex-col gap-1">
                <code className="text-xs font-mono">{fn.signature}</code>
                <span className="text-xs text-muted-foreground">{fn.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Alert className="border-border bg-muted">
        <Info className="h-4 w-4 text-muted-foreground" />
        <AlertDescription className="text-muted-foreground">
          Contract deployment and on-chain execution are not included in this
          demo. The ABI and function signatures above are provided for reference
          and educational purposes.
        </AlertDescription>
      </Alert>
    </div>
  );
}
