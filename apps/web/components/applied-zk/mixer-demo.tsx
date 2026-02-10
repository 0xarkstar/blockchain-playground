"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Check,
  X,
  Loader2,
  Shuffle,
  Lock,
  Shield,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ProgressPipeline } from "../shared";
import { EducationPanel } from "../shared";
import {
  generateProof,
  verifyProof,
  type ProofGenerationResult,
} from "../../lib/applied-zk/snarkjs";
import {
  poseidonHashTwo,
  poseidonHashSingle,
  bigintToHex,
  generateIdentitySecret,
} from "../../lib/applied-zk/poseidon";
import { MerkleTree, formatMerkleProofForCircuit } from "../../lib/applied-zk/merkle";
import { OnChainVerify } from "./on-chain-verify";
import { mixerVerifierAbi } from "../../lib/applied-zk/abis";
import { ZK_CONTRACTS } from "../../lib/applied-zk/contracts";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShineBorder } from "../ui/shine-border";

const TREE_DEPTH = 10;

type DemoPhase =
  | "init"
  | "depositing"
  | "deposited"
  | "withdrawing"
  | "withdrawn"
  | "verifying"
  | "verified";

const pipelineSteps = [
  { id: "deposit", label: "Deposit" },
  { id: "pool", label: "Mix in Pool" },
  { id: "prove", label: "ZK Proof" },
  { id: "withdraw", label: "Withdraw" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "init":
      return 0;
    case "depositing":
      return 0;
    case "deposited":
      return 1;
    case "withdrawing":
      return 2;
    case "withdrawn":
      return 3;
    case "verifying":
      return 3;
    case "verified":
      return 4;
  }
}

function getPipelineStatuses(phase: DemoPhase) {
  const statuses: Record<string, "pending" | "active" | "complete" | "error"> =
    {};
  if (phase === "depositing") {
    statuses["deposit"] = "active";
  } else if (phase === "deposited") {
    statuses["deposit"] = "complete";
    statuses["pool"] = "complete";
  } else if (phase === "withdrawing") {
    statuses["deposit"] = "complete";
    statuses["pool"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "withdrawn") {
    statuses["deposit"] = "complete";
    statuses["pool"] = "complete";
    statuses["prove"] = "complete";
    statuses["withdraw"] = "complete";
  } else if (phase === "verifying") {
    statuses["deposit"] = "complete";
    statuses["pool"] = "complete";
    statuses["prove"] = "complete";
    statuses["withdraw"] = "active";
  } else if (phase === "verified") {
    statuses["deposit"] = "complete";
    statuses["pool"] = "complete";
    statuses["prove"] = "complete";
    statuses["withdraw"] = "complete";
  }
  return statuses;
}

interface Deposit {
  readonly commitment: bigint;
  readonly commitmentHex: string;
  readonly timestamp: number;
}

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

export function MixerDemo() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [myDeposit, setMyDeposit] = useState<{
    nullifier: bigint;
    secret: bigint;
    commitment: bigint;
    leafIndex: number;
  } | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("init");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  // Initialize with dummy deposits
  useEffect(() => {
    const initDummyDeposits = async () => {
      const dummyDeposits: Deposit[] = [];
      for (let i = 0; i < 3; i++) {
        const nullifier = generateIdentitySecret();
        const secret = generateIdentitySecret();
        const commitment = await poseidonHashTwo(nullifier, secret);
        dummyDeposits.push({
          commitment,
          commitmentHex: bigintToHex(commitment),
          timestamp: Date.now() - 3600000 * (i + 1),
        });
      }
      setDeposits(dummyDeposits);
    };
    initDummyDeposits();
  }, []);

  const handleDeposit = useCallback(async () => {
    try {
      setError("");
      setPhase("depositing");
      setProgressMessage("Generating secrets...");

      const nullifier = generateIdentitySecret();
      const secret = generateIdentitySecret();

      setProgressMessage("Computing commitment...");
      const commitment = await poseidonHashTwo(nullifier, secret);

      const newDeposit: Deposit = {
        commitment,
        commitmentHex: bigintToHex(commitment),
        timestamp: Date.now(),
      };

      const updatedDeposits = [...deposits, newDeposit];
      setDeposits(updatedDeposits);

      setMyDeposit({
        nullifier,
        secret,
        commitment,
        leafIndex: updatedDeposits.length - 1,
      });

      setPhase("deposited");
      setProgressMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
      setPhase("init");
      setProgressMessage("");
    }
  }, [deposits]);

  const handleWithdraw = useCallback(async () => {
    if (!myDeposit) return;

    try {
      setError("");
      setPhase("withdrawing");
      setProgressMessage("Building Merkle tree...");

      const tree = new MerkleTree(TREE_DEPTH);
      await tree.initialize();
      for (const dep of deposits) {
        await tree.insert(dep.commitment);
      }

      const merkleRoot = tree.getRoot();

      setProgressMessage("Generating Merkle proof...");
      const merkleProof = await tree.getProof(myDeposit.leafIndex);
      const formattedProof = formatMerkleProofForCircuit(merkleProof);

      setProgressMessage("Computing nullifier hash...");
      const nullifierHash = await poseidonHashSingle(myDeposit.nullifier);

      const recipient = BigInt(0);
      const relayer = BigInt(0);
      const fee = BigInt(0);

      const circuitInput = {
        nullifier: myDeposit.nullifier.toString(),
        secret: myDeposit.secret.toString(),
        pathElements: formattedProof.pathElements,
        pathIndices: formattedProof.pathIndices,
        merkleRoot: merkleRoot.toString(),
        nullifierHash: nullifierHash.toString(),
        recipient: recipient.toString(),
        relayer: relayer.toString(),
        fee: fee.toString(),
      };

      setProgressMessage("Generating withdrawal proof...");

      const result = await generateProof(
        circuitInput,
        "/circuits/mixer_demo.wasm",
        "/circuits/mixer_demo_final.zkey",
        (_progress, message) => {
          setProgressMessage(message);
        },
      );

      setProofResult(result);
      setPhase("withdrawn");
      setProgressMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Withdrawal proof failed",
      );
      setPhase("deposited");
      setProgressMessage("");
    }
  }, [myDeposit, deposits]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;

    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/mixer_demo_verification_key.json",
        proofResult.publicSignals,
        proofResult.proof,
      );

      setVerificationResult(isValid);
      setPhase("verified");

      if (isValid) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setPhase("withdrawn");
    }
  }, [proofResult]);

  const handleReset = useCallback(() => {
    setPhase("init");
    setMyDeposit(null);
    setShowSecrets(false);
    setProofResult(null);
    setVerificationResult(null);
    setError("");
    setProgressMessage("");
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
          {/* Educational Disclaimer */}
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Educational Only.</strong> This demo illustrates
              mixer/pool cryptographic concepts. It does not handle real funds
              and should not be used for actual privacy applications.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <ConnectButton />
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <ProgressPipeline
              steps={pipelineSteps}
              currentStepIndex={getPipelineIndex(phase)}
              stepStatuses={getPipelineStatuses(phase)}
              showElapsedTime={phase === "withdrawing" || phase === "verifying"}
            />
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Flow Diagram */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-center p-3 bg-muted rounded-lg min-w-[100px]">
                <Lock className="h-5 w-5 mx-auto mb-1" />
                <p className="text-sm font-medium">Deposit</p>
                <p className="text-xs text-muted-foreground">0.01 ETH</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center p-3 bg-primary/10 rounded-lg min-w-[100px]">
                <Shuffle className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-sm font-medium">Mixer Pool</p>
                <p className="text-xs text-muted-foreground">
                  {deposits.length} deposits
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center p-3 bg-muted rounded-lg min-w-[100px]">
                <Shield className="h-5 w-5 mx-auto mb-1" />
                <p className="text-sm font-medium">Withdraw</p>
                <p className="text-xs text-muted-foreground">Unlinkable</p>
              </div>
            </div>
          </div>

          {/* Step 1: Deposit */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  <Lock className="mr-1 inline h-4 w-4" />
                  Step 1: Deposit
                </p>
                {myDeposit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSecrets((s) => !s)}
                    aria-label={showSecrets ? "Hide secrets" : "Show secrets"}
                  >
                    {showSecrets ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Generate a commitment from a random nullifier and secret, then
                add it to the mixer pool.
              </p>

              {!myDeposit ? (
                <>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold">0.01 ETH</p>
                    <p className="text-xs text-muted-foreground">
                      Fixed denomination
                    </p>
                  </div>

                  {progressMessage && (
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {progressMessage}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleDeposit}
                    disabled={phase !== "init"}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Deposit to Mixer
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      Deposited
                    </Badge>
                    <code className="text-xs font-mono text-muted-foreground">
                      {truncateHex(bigintToHex(myDeposit.commitment), 12)}
                    </code>
                  </div>
                  <AnimatePresence>
                    {showSecrets && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-lg bg-muted p-3 text-xs font-mono flex flex-col gap-1">
                          <p>
                            <span className="text-muted-foreground">
                              nullifier:{" "}
                            </span>
                            {truncateHex(
                              bigintToHex(myDeposit.nullifier),
                              16,
                            )}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              secret:{" "}
                            </span>
                            {truncateHex(
                              bigintToHex(myDeposit.secret),
                              16,
                            )}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Save your nullifier and secret! They are needed to
                      withdraw.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Withdraw with ZK Proof */}
          {myDeposit && (
            <AnimatePresence mode="wait">
              <motion.div
                key="withdraw-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">
                    <Shield className="mr-1 inline h-4 w-4" />
                    Step 2: Withdraw with ZK Proof
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Prove you made one of the deposits without revealing which
                    one. The nullifier prevents double-spending.
                  </p>

                  {progressMessage && phase === "withdrawing" && (
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {progressMessage}
                      </p>
                    </div>
                  )}

                  {!proofResult && (
                    <Button
                      onClick={handleWithdraw}
                      disabled={phase === "withdrawing"}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Generate Withdrawal Proof
                    </Button>
                  )}

                  {proofResult && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        >
                          Proof Generated
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium">
                          Public Signals ({proofResult.publicSignals.length}):
                        </p>
                        <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto font-mono">
                          <code>
                            {proofResult.publicSignals
                              .map((s) => truncateHex(s, 16))
                              .join("\n")}
                          </code>
                        </pre>
                      </div>
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
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Verification Result */}
          {verificationResult !== null && (
            <div
              className={`relative rounded-lg border p-4 ${
                verificationResult
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              }`}
            >
              {verificationResult && (
                <ShineBorder shineColor={["#22c55e", "#16a34a"]} />
              )}
              {!verificationResult && (
                <ShineBorder shineColor={["#ef4444", "#dc2626"]} />
              )}
              <div className="flex items-center gap-2">
                {verificationResult ? (
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <p className="text-sm font-medium">
                  {verificationResult
                    ? "Withdrawal proof verified! Funds unlinkable from deposit."
                    : "Verification failed. The proof does not match."}
                </p>
              </div>
            </div>
          )}

          {/* Pool State */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-semibold mb-2">Mixer Pool</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 bg-muted rounded-lg text-center">
                <p className="text-lg font-bold">{deposits.length}</p>
                <p className="text-xs text-muted-foreground">Total Deposits</p>
              </div>
              <div className="p-2 bg-muted rounded-lg text-center">
                <p className="text-lg font-bold">
                  {(deposits.length * 0.01).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Pool (ETH)</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {deposits.slice(-5).map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded bg-muted/50 p-2 text-xs"
                >
                  <code>{truncateHex(d.commitmentHex, 12)}</code>
                  <span className="text-muted-foreground">
                    {new Date(d.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="learn" className="mt-4">
        <EducationPanel
          howItWorks={[
            {
              title: "Deposit: Create a Commitment",
              description:
                "The depositor generates a random nullifier and secret, computes commitment = Poseidon(nullifier, secret), and submits it to the pool.",
              details: [
                "The commitment is stored in a Merkle tree on-chain",
                "All deposits use the same fixed denomination (0.01 ETH)",
                "The nullifier and secret must be saved for withdrawal",
              ],
            },
            {
              title: "Withdraw: Prove Membership",
              description:
                "To withdraw, generate a ZK proof showing you know a nullifier and secret that map to some leaf in the Merkle tree — without revealing which leaf.",
              details: [
                "The proof includes a Merkle path to the tree root",
                "The nullifier hash is published to prevent double-spending",
                "The withdrawal address is bound to the proof (no front-running)",
                "No link between deposit and withdrawal is revealed",
              ],
            },
            {
              title: "Privacy Guarantee",
              description:
                "The mixer breaks the on-chain link between depositor and withdrawer. The anonymity set equals the number of deposits.",
              details: [
                "Larger anonymity set = stronger privacy",
                "Nullifier prevents withdrawing the same deposit twice",
                "Relayer support allows gas-free withdrawals for extra privacy",
              ],
            },
          ]}
          whyItMatters="Mixer circuits demonstrate how Merkle trees and nullifiers combine to provide unlinkability — the foundation of private transactions. Understanding these primitives is essential for building privacy-preserving DeFi applications."
          tips={[
            "The Merkle tree depth is 10, supporting up to 1024 deposits",
            "Poseidon hash is used because it is ZK-circuit-friendly (few constraints)",
            "The nullifier hash prevents double-spending without revealing identity",
            "Circuit has 5 public signals: merkleRoot, nullifierHash, recipient, relayer, fee",
          ]}
          defaultExpanded
        />
      </TabsContent>

      {proofResult && (
        <TabsContent value="on-chain" className="mt-4">
          <OnChainVerify
            proofResult={proofResult}
            verifierAbi={mixerVerifierAbi}
            defaultAddress={ZK_CONTRACTS.mixerVerifier}
            circuitName="Mixer Demo"
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
