"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, X, Hash, Copy, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProgressPipeline } from "../shared";
import { EducationPanel } from "../shared";
import { ShineBorder } from "../ui/shine-border";
import {
  generateProof,
  verifyProof,
  type ProofGenerationResult,
} from "../../lib/applied-zk/snarkjs";
import { poseidonHashSingle, bigintToHex } from "../../lib/applied-zk/poseidon";
import { OnChainVerify } from "./on-chain-verify";
import { hashPreimageVerifierAbi } from "../../lib/applied-zk/abis";
import { ZK_CONTRACTS } from "../../lib/applied-zk/contracts";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type DemoPhase =
  | "input"
  | "hashing"
  | "proving"
  | "proved"
  | "verifying"
  | "verified";

const pipelineSteps = [
  { id: "input", label: "Input Secret" },
  { id: "hash", label: "Hash" },
  { id: "prove", label: "Generate Proof" },
  { id: "verify", label: "Verify" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "input":
      return 0;
    case "hashing":
      return 1;
    case "proving":
      return 2;
    case "proved":
      return 2;
    case "verifying":
      return 3;
    case "verified":
      return 4;
  }
}

function getPipelineStatuses(phase: DemoPhase) {
  const statuses: Record<string, "pending" | "active" | "complete" | "error"> =
    {};
  if (phase === "hashing") {
    statuses["input"] = "complete";
    statuses["hash"] = "active";
  } else if (phase === "proving") {
    statuses["input"] = "complete";
    statuses["hash"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "proved") {
    statuses["input"] = "complete";
    statuses["hash"] = "complete";
    statuses["prove"] = "complete";
  } else if (phase === "verifying") {
    statuses["input"] = "complete";
    statuses["hash"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "active";
  } else if (phase === "verified") {
    statuses["input"] = "complete";
    statuses["hash"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "complete";
  }
  return statuses;
}

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

export function HashPreimageDemo() {
  const [secretInput, setSecretInput] = useState("42");
  const [phase, setPhase] = useState<DemoPhase>("input");
  const [poseidonHash, setPoseidonHash] = useState("");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [proofExpanded, setProofExpanded] = useState(false);
  const confettiFiredRef = useRef(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(poseidonHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHash = useCallback(async () => {
    try {
      setError("");
      setPhase("hashing");
      const secretBigint = BigInt(secretInput);
      const hash = await poseidonHashSingle(secretBigint);
      setPoseidonHash(bigintToHex(hash));
      setPhase("proving");
      setProofResult(null);
      setVerificationResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compute hash");
      setPhase("input");
    }
  }, [secretInput]);

  const handleGenerateProof = useCallback(async () => {
    try {
      setError("");
      setPhase("proving");
      setProgressMessage("Starting proof generation...");

      const secretBigint = BigInt(secretInput);
      const input = { secret: secretBigint.toString() };

      const result = await generateProof(
        input,
        "/circuits/hash_preimage.wasm",
        "/circuits/hash_preimage_final.zkey",
        (_progress, message) => {
          setProgressMessage(message);
        },
      );

      setProofResult(result);
      setPhase("proved");
      setProgressMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proof generation failed");
      setPhase("input");
      setProgressMessage("");
    }
  }, [secretInput]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;

    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/hash_preimage_verification_key.json",
        proofResult.publicSignals,
        proofResult.proof,
      );

      setVerificationResult(isValid);
      setPhase("verified");
      if (isValid && !confettiFiredRef.current) {
        confettiFiredRef.current = true;
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setPhase("proved");
    }
  }, [proofResult]);

  const handleReset = useCallback(() => {
    setPhase("input");
    setPoseidonHash("");
    setProofResult(null);
    setVerificationResult(null);
    setError("");
    setProgressMessage("");
    setProofExpanded(false);
    confettiFiredRef.current = false;
  }, []);

  return (
    <Tabs defaultValue="demo">
      <TabsList>
        <TabsTrigger value="demo">Demo</TabsTrigger>
        <TabsTrigger value="learn">Learn</TabsTrigger>
        {proofResult && <TabsTrigger value="on-chain">On-Chain</TabsTrigger>}
      </TabsList>

      <TabsContent value="demo" className="mt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <ConnectButton />
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <ProgressPipeline
              steps={pipelineSteps}
              currentStepIndex={getPipelineIndex(phase)}
              stepStatuses={getPipelineStatuses(phase)}
              showElapsedTime={true}
            />
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">
                    Step 1: Enter Secret
                  </p>
                  <div>
                    <Label htmlFor="azk-hashpreimage-secret">Secret number</Label>
                    <p className="text-xs text-muted-foreground mb-1">
                      The value you want to prove knowledge of without revealing it
                    </p>
                    <Input
                      id="azk-hashpreimage-secret"
                      value={secretInput}
                      onChange={(e) => setSecretInput(e.target.value)}
                      placeholder="Enter a number"
                      disabled={phase !== "input"}
                    />
                  </div>
                  <Button
                    onClick={handleHash}
                    disabled={phase !== "input" || !secretInput}
                  >
                    <Hash className="mr-2 h-4 w-4" />
                    Compute Poseidon Hash
                  </Button>
                </div>
              </div>

              {poseidonHash && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">
                      Step 2: Poseidon Hash (Public)
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Public Output
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        This hash is shared publicly. The secret remains private.
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <pre className="flex-1 rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                        <code>{truncateHex(poseidonHash, 16)}</code>
                      </pre>
                      <Button variant="ghost" size="icon" onClick={handleCopy} title={copied ? "Copied" : "Copy"} aria-label="Copy to clipboard">
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {poseidonHash && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">
                      Step 3: Generate ZK Proof
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Generate a Groth16 proof that you know the preimage of the
                      hash, without revealing the secret.
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
                      onClick={handleGenerateProof}
                      disabled={phase !== "proved" && phase !== "verified"}
                    >
                      Generate Proof
                    </Button>
                  </div>
                </div>
              )}

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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProofExpanded(!proofExpanded)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground h-auto p-0"
                    >
                      {proofExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {proofExpanded ? "Hide" : "Show"} proof data
                    </Button>
                    {proofExpanded && (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium">
                          pi_a (2 elements):
                        </p>
                        <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                          <code>
                            {proofResult.proof.pi_a
                              .slice(0, 2)
                              .map((v) => truncateHex(v, 12))
                              .join("\n")}
                          </code>
                        </pre>
                        <p className="text-xs font-medium">
                          pi_b (2x2 elements):
                        </p>
                        <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                          <code>
                            {proofResult.proof.pi_b
                              .slice(0, 2)
                              .map(
                                (row) =>
                                  `[${row.map((v) => truncateHex(v, 8)).join(", ")}]`,
                              )
                              .join("\n")}
                          </code>
                        </pre>
                        <p className="text-xs font-medium">
                          pi_c (2 elements):
                        </p>
                        <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                          <code>
                            {proofResult.proof.pi_c
                              .slice(0, 2)
                              .map((v) => truncateHex(v, 12))
                              .join("\n")}
                          </code>
                        </pre>
                        <p className="text-xs font-medium">
                          Public Signals:
                        </p>
                        <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                          <code>
                            {proofResult.publicSignals
                              .map((s) => truncateHex(s, 16))
                              .join("\n")}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {proofResult && (
                <div className="relative rounded-lg border border-border bg-card p-4">
                  {verificationResult === true && (
                    <ShineBorder shineColor={["#22c55e", "#10b981"]} />
                  )}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">
                      Step 4: Verify Proof
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Verify the proof using the verification key. No secret
                      knowledge needed.
                    </p>
                    <Button
                      onClick={handleVerifyProof}
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
                          ? "Proof Valid"
                          : "Proof Invalid"}
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
                            ? "The proof is valid! The prover knows the secret preimage without revealing it."
                            : "The proof is invalid. The prover does not know the correct preimage."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </TabsContent>

      <TabsContent value="learn" className="mt-4">
        <EducationPanel
          howItWorks={[
            {
              title: "Hash the Secret",
              description:
                "The prover computes a Poseidon hash of their secret number. This hash is shared publicly as a commitment.",
              details: [
                "Poseidon is a ZK-friendly hash function optimized for use inside arithmetic circuits",
                "The hash output becomes the public input to the ZK circuit",
              ],
            },
            {
              title: "Generate a Groth16 Proof",
              description:
                "Using snarkjs, the prover generates a zero-knowledge proof that they know a value that hashes to the public hash.",
              details: [
                "The circuit checks: Poseidon(secret) == publicHash",
                "The proof reveals nothing about the secret itself",
                "Proof generation requires the circuit WASM and proving key (zkey)",
              ],
            },
            {
              title: "Verify the Proof",
              description:
                "Anyone can verify the proof using only the verification key and public signals, without knowing the secret.",
              details: [
                "Verification is fast and can be done on-chain in a Solidity smart contract",
                "The verification key is derived during the trusted setup ceremony",
              ],
            },
          ]}
          whyItMatters="Hash preimage proofs are the building block of many ZK applications: anonymous authentication, private voting eligibility, and confidential transaction systems. By proving knowledge of a preimage without revealing it, you can authenticate without exposing credentials."
          tips={[
            "Poseidon hash is preferred over SHA-256 in ZK circuits because it requires far fewer constraints",
            "The trusted setup (powers of tau + circuit-specific) is done once per circuit",
            "Proof generation is computationally expensive but verification is very fast",
            "Public signals are visible to everyone; private inputs (the secret) are not",
          ]}
          defaultExpanded
        />
      </TabsContent>

      {proofResult && (
        <TabsContent value="on-chain" className="mt-4">
          <OnChainVerify
            proofResult={proofResult}
            verifierAbi={hashPreimageVerifierAbi}
            defaultAddress={ZK_CONTRACTS.hashPreimageVerifier}
            circuitName="Hash Preimage"
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
