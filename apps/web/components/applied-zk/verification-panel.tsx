"use client";

import { Check, X, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface VerificationPanelProps {
  readonly identityCommitment: string;
  readonly minAge: number | "";
  readonly phase: string;
  readonly progressMessage: string;
  readonly proofResult: {
    proof: {
      pi_a: string[];
      pi_c: string[];
    };
    publicSignals: unknown[];
  } | null;
  readonly verificationResult: boolean | null;
  readonly onGenerateProof: () => void;
  readonly onVerifyProof: () => void;
}

export function VerificationPanel({
  identityCommitment,
  minAge,
  phase,
  progressMessage,
  proofResult,
  verificationResult,
  onGenerateProof,
  onVerifyProof,
}: VerificationPanelProps) {
  if (!identityCommitment) {
    return null;
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Step 3: Generate Age Proof
          </p>
          <p className="text-xs text-muted-foreground">
            Prove that your age meets the threshold without revealing your exact
            birthday.
          </p>
          {progressMessage && (
            <div className="flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {progressMessage}
              </p>
            </div>
          )}
          <Button
            onClick={onGenerateProof}
            disabled={
              phase === "proving" ||
              (phase !== "proving" && phase !== "proved" && phase !== "verified")
            }
          >
            Prove Age &ge; {typeof minAge === "number" ? minAge : 18}
          </Button>
        </div>
      </div>

      {proofResult && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Proof Data
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Generated
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              The proof shows age &ge;{" "}
              {typeof minAge === "number" ? minAge : 18} without revealing the
              exact birthday.
            </p>
            <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
              <code>
                {`pi_a: [${proofResult.proof.pi_a
                  .slice(0, 2)
                  .map((v) => truncateHex(v, 8))
                  .join(", ")}]\n`}
                {`pi_c: [${proofResult.proof.pi_c
                  .slice(0, 2)
                  .map((v) => truncateHex(v, 8))
                  .join(", ")}]\n`}
                {`public signals: ${proofResult.publicSignals.length} values`}
              </code>
            </pre>
          </div>
        </div>
      )}

      {proofResult && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Step 4: Verify Age Proof
            </p>
            <Button
              onClick={onVerifyProof}
              disabled={phase === "verifying"}
              className={
                verificationResult === true
                  ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                  : verificationResult === false
                    ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                    : ""
              }
            >
              {verificationResult === null
                ? "Verify Proof"
                : verificationResult
                  ? "Age Verified"
                  : "Verification Failed"}
            </Button>
            {verificationResult !== null && (
              <Alert className={
                verificationResult
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              }>
                {verificationResult ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <AlertDescription>
                  {verificationResult
                    ? `Age verification passed! The prover is at least ${typeof minAge === "number" ? minAge : 18} years old, without revealing their exact birthday.`
                    : "Age verification failed. The prover could not prove they meet the age threshold."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </>
  );
}
