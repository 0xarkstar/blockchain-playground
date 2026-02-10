"use client";

import { useState, useCallback } from "react";
import {
  Check,
  X,
  Loader2,
  Gamepad2,
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
  poseidonHash,
  bigintToHex,
  generateIdentitySecret,
} from "../../lib/applied-zk/poseidon";
import { OnChainVerify } from "./on-chain-verify";
import { mastermindVerifierAbi } from "../../lib/applied-zk/abis";
import { ZK_CONTRACTS } from "../../lib/applied-zk/contracts";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShineBorder } from "../ui/shine-border";

type DemoPhase =
  | "setup"
  | "committing"
  | "committed"
  | "guessing"
  | "proving"
  | "proved"
  | "verifying"
  | "verified";

const COLOR_LABELS = ["R", "O", "Y", "G", "B", "P"];

const pipelineSteps = [
  { id: "commit", label: "Commit Code" },
  { id: "guess", label: "Make Guess" },
  { id: "prove", label: "ZK Proof" },
  { id: "verify", label: "Verify" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "setup":
      return 0;
    case "committing":
      return 0;
    case "committed":
      return 1;
    case "guessing":
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
  if (phase === "committing") {
    statuses["commit"] = "active";
  } else if (phase === "committed" || phase === "guessing") {
    statuses["commit"] = "complete";
    statuses["guess"] = phase === "guessing" ? "active" : "pending";
  } else if (phase === "proving") {
    statuses["commit"] = "complete";
    statuses["guess"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "proved") {
    statuses["commit"] = "complete";
    statuses["guess"] = "complete";
    statuses["prove"] = "complete";
  } else if (phase === "verifying") {
    statuses["commit"] = "complete";
    statuses["guess"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "active";
  } else if (phase === "verified") {
    statuses["commit"] = "complete";
    statuses["guess"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "complete";
  }
  return statuses;
}

function getColorClass(colorIndex: number): string {
  const classes = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-purple-500",
  ];
  return classes[colorIndex] ?? "bg-gray-500";
}

interface GuessRecord {
  readonly colors: readonly number[];
  readonly blackPegs: number;
  readonly whitePegs: number;
  readonly verified: boolean;
}

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

export function MastermindDemo() {
  const [secretCode, setSecretCode] = useState<number[]>([0, 1, 2, 3]);
  const [codeSalt, setCodeSalt] = useState<bigint | null>(null);
  const [codeCommitment, setCodeCommitment] = useState<bigint | null>(null);
  const [showSecret, setShowSecret] = useState(true);
  const [currentGuess, setCurrentGuess] = useState<number[]>([0, 0, 0, 0]);
  const [guesses, setGuesses] = useState<GuessRecord[]>([]);
  const [phase, setPhase] = useState<DemoPhase>("setup");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [gameWon, setGameWon] = useState(false);

  const cycleColor = useCallback(
    (index: number, arr: number[], setter: (v: number[]) => void) => {
      const next = [...arr];
      next[index] = (next[index] + 1) % 6;
      setter(next);
    },
    [],
  );

  const handleCommitCode = useCallback(async () => {
    try {
      setError("");
      setPhase("committing");

      const salt = generateIdentitySecret();
      setCodeSalt(salt);

      const commitment = await poseidonHash([
        BigInt(secretCode[0]),
        BigInt(secretCode[1]),
        BigInt(secretCode[2]),
        BigInt(secretCode[3]),
        salt,
      ]);
      setCodeCommitment(commitment);
      setShowSecret(false);
      setPhase("committed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to commit code");
      setPhase("setup");
    }
  }, [secretCode]);

  const handleSubmitGuess = useCallback(async () => {
    if (!codeCommitment || !codeSalt) return;

    try {
      setError("");
      setPhase("proving");
      setProgressMessage("Computing hint...");

      // Compute black and white pegs
      let blackPegs = 0;
      const secretCounts = Array(6).fill(0) as number[];
      const guessCounts = Array(6).fill(0) as number[];

      for (let i = 0; i < 4; i++) {
        if (currentGuess[i] === secretCode[i]) {
          blackPegs++;
        } else {
          secretCounts[secretCode[i]]++;
          guessCounts[currentGuess[i]]++;
        }
      }

      let whitePegs = 0;
      for (let i = 0; i < 6; i++) {
        whitePegs += Math.min(secretCounts[i], guessCounts[i]);
      }

      setProgressMessage("Preparing circuit inputs...");

      const circuitInput = {
        secretCode: secretCode.map((c) => c.toString()),
        salt: codeSalt.toString(),
        guess: currentGuess.map((c) => c.toString()),
        blackPegs: blackPegs.toString(),
        whitePegs: whitePegs.toString(),
        codeCommitment: codeCommitment.toString(),
      };

      const result = await generateProof(
        circuitInput,
        "/circuits/mastermind.wasm",
        "/circuits/mastermind_final.zkey",
        (_progress, message) => {
          setProgressMessage(message);
        },
      );

      setProofResult(result);

      // Record guess
      const newGuess: GuessRecord = {
        colors: [...currentGuess],
        blackPegs,
        whitePegs,
        verified: true,
      };
      setGuesses((prev) => [...prev, newGuess]);

      if (blackPegs === 4) {
        setGameWon(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      setPhase("proved");
      setProgressMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Proof generation failed",
      );
      setPhase("committed");
      setProgressMessage("");
    }
  }, [currentGuess, secretCode, codeCommitment, codeSalt]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;

    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/mastermind_verification_key.json",
        proofResult.publicSignals,
        proofResult.proof,
      );

      setVerificationResult(isValid);
      setPhase("verified");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setPhase("proved");
    }
  }, [proofResult]);

  const handleReset = useCallback(() => {
    setPhase("setup");
    setSecretCode([0, 1, 2, 3]);
    setCodeSalt(null);
    setCodeCommitment(null);
    setShowSecret(true);
    setCurrentGuess([0, 0, 0, 0]);
    setGuesses([]);
    setProofResult(null);
    setVerificationResult(null);
    setError("");
    setProgressMessage("");
    setGameWon(false);
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
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <ProgressPipeline
              steps={pipelineSteps}
              currentStepIndex={getPipelineIndex(phase)}
              stepStatuses={getPipelineStatuses(phase)}
              showElapsedTime={phase === "proving" || phase === "verifying"}
            />
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Set Secret Code */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  <Gamepad2 className="mr-1 inline h-4 w-4" />
                  Step 1: Set Secret Code
                </p>
                {codeCommitment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSecret((s) => !s)}
                    aria-label={showSecret ? "Hide secret code" : "Show secret code"}
                  >
                    {showSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Choose 4 colors for your secret code, then commit it using
                Poseidon hash.
              </p>

              <div className="flex gap-2 justify-center">
                {secretCode.map((color, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className={`w-12 h-12 ${showSecret || !codeCommitment ? getColorClass(color) : "bg-muted"} text-white font-bold`}
                    onClick={() =>
                      !codeCommitment &&
                      cycleColor(i, secretCode, setSecretCode)
                    }
                    disabled={!!codeCommitment}
                  >
                    {showSecret || !codeCommitment
                      ? COLOR_LABELS[color]
                      : "?"}
                  </Button>
                ))}
              </div>

              {!codeCommitment && (
                <Button
                  onClick={handleCommitCode}
                  disabled={phase !== "setup"}
                >
                  Commit Secret Code
                </Button>
              )}

              {codeCommitment && (
                <div className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  >
                    Committed
                  </Badge>
                  <code className="text-xs font-mono text-muted-foreground">
                    {truncateHex(bigintToHex(codeCommitment), 12)}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Make a Guess */}
          {codeCommitment && !gameWon && (
            <AnimatePresence mode="wait">
              <motion.div
                key="guess-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold">
                    Step 2: Make a Guess
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click colors to cycle through options. ZK proof verifies
                    black/white pegs without revealing the secret code.
                  </p>

                  <div className="flex gap-2 justify-center">
                    {currentGuess.map((color, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className={`w-12 h-12 ${getColorClass(color)} text-white font-bold`}
                        onClick={() =>
                          cycleColor(i, currentGuess, setCurrentGuess)
                        }
                        disabled={phase === "proving"}
                      >
                        {COLOR_LABELS[color]}
                      </Button>
                    ))}
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
                    onClick={handleSubmitGuess}
                    disabled={
                      phase === "proving" ||
                      phase === "verifying"
                    }
                  >
                    Submit Guess & Generate Proof
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Previous Guesses */}
          {guesses.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-semibold mb-2">Guess History</p>
              <div className="flex flex-col gap-2">
                {guesses.map((g, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-muted p-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      #{i + 1}
                    </span>
                    <div className="flex gap-1">
                      {g.colors.map((c, j) => (
                        <span
                          key={j}
                          className={`w-6 h-6 rounded ${getColorClass(c)} flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {COLOR_LABELS[c]}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1 ml-auto items-center">
                      {Array.from({ length: g.blackPegs }).map((_, j) => (
                        <span
                          key={`b${j}`}
                          className="w-3 h-3 bg-foreground rounded-full"
                        />
                      ))}
                      {Array.from({ length: g.whitePegs }).map((_, j) => (
                        <span
                          key={`w${j}`}
                          className="w-3 h-3 border-2 border-foreground rounded-full"
                        />
                      ))}
                      {g.verified && (
                        <Check className="h-3 w-3 text-green-500 dark:text-green-400 ml-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Won */}
          {gameWon && (
            <div className="relative rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <ShineBorder shineColor={["#22c55e", "#16a34a"]} />
              <div className="flex flex-col items-center gap-2">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                <p className="font-bold text-green-700 dark:text-green-300">
                  Code Cracked in {guesses.length} guess
                  {guesses.length > 1 ? "es" : ""}!
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Verify Proof */}
          {proofResult && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Step 3: Verify Latest Proof
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  >
                    Generated
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Verify the ZK proof confirms the hint is correct without
                  revealing the secret code.
                </p>
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
                {verificationResult !== null && (
                  <Alert
                    className={
                      verificationResult
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                        : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                    }
                  >
                    {verificationResult ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {verificationResult
                        ? "The proof is valid! The hint (black/white pegs) is correctly computed for this guess, without revealing the secret code."
                        : "The proof is invalid. The hint does not match the committed secret code."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-medium mb-1">Peg Legend</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-foreground rounded-full" />
                Black = correct color & position
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-foreground rounded-full" />
                White = correct color, wrong position
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="learn" className="mt-4">
        <EducationPanel
          howItWorks={[
            {
              title: "Commit the Secret Code",
              description:
                "The code setter chooses a 4-color secret code and commits to it using Poseidon(code[0..3], salt). This commitment is public — it locks the code without revealing it.",
              details: [
                "6 possible colors per position: red, orange, yellow, green, blue, purple",
                "The salt prevents brute-force attacks on the commitment",
                "Once committed, the code setter cannot change the secret code",
              ],
            },
            {
              title: "Generate Hint with ZK Proof",
              description:
                "After each guess, the code setter generates a Groth16 proof that the black/white peg counts are correct for the committed code.",
              details: [
                "Black pegs: correct color in the correct position",
                "White pegs: correct color in the wrong position",
                "The circuit verifies hint computation against the committed code",
                "The proof reveals nothing about which positions match",
              ],
            },
            {
              title: "Verify the Hint",
              description:
                "Anyone can verify the proof to confirm the hint is honest — the code setter cannot cheat.",
              details: [
                "Verification uses only the public signals and verification key",
                "On-chain verification enables trustless Mastermind games",
                "No trusted third party needed to enforce fair play",
              ],
            },
          ]}
          whyItMatters="ZK Mastermind demonstrates how zero-knowledge proofs enable fair games without a trusted referee. The code setter proves hint correctness without revealing the secret — a pattern applicable to any game with hidden information, from poker to battleship."
          tips={[
            "The circuit has 7 public signals: guess[4], blackPegs, whitePegs, codeCommitment",
            "Proof generation is computationally heavy but verification is fast",
            "The commitment prevents the code setter from changing the code mid-game",
            "This pattern generalizes to any 'prove computation on hidden data' scenario",
          ]}
          defaultExpanded
        />
      </TabsContent>

      {proofResult && (
        <TabsContent value="on-chain" className="mt-4">
          <OnChainVerify
            proofResult={proofResult}
            verifierAbi={mastermindVerifierAbi}
            defaultAddress={ZK_CONTRACTS.mastermindVerifier}
            circuitName="Mastermind"
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
