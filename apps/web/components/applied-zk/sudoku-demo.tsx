"use client";

import { useState, useCallback } from "react";
import {
  Check,
  X,
  Grid3X3,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  RotateCcw,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { ProgressPipeline } from "../shared";
import { EducationPanel } from "../shared";
import {
  generateProof,
  verifyProof,
  type ProofGenerationResult,
} from "../../lib/applied-zk/snarkjs";
import { OnChainVerify } from "./on-chain-verify";
import { sudokuVerifierAbi } from "../../lib/applied-zk/abis";
import { ZK_CONTRACTS } from "../../lib/applied-zk/contracts";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShineBorder } from "../ui/shine-border";

type DemoPhase =
  | "input"
  | "validating"
  | "validated"
  | "proving"
  | "proved"
  | "verifying"
  | "verified";

const PUZZLE: readonly number[][] = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const SOLUTION: readonly number[][] = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

const pipelineSteps = [
  { id: "fill", label: "Fill Grid" },
  { id: "validate", label: "Validate" },
  { id: "prove", label: "Generate Proof" },
  { id: "verify", label: "Verify" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "input":
      return 0;
    case "validating":
      return 1;
    case "validated":
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
  if (phase === "validating") {
    statuses["fill"] = "complete";
    statuses["validate"] = "active";
  } else if (phase === "validated") {
    statuses["fill"] = "complete";
    statuses["validate"] = "complete";
  } else if (phase === "proving") {
    statuses["fill"] = "complete";
    statuses["validate"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "proved") {
    statuses["fill"] = "complete";
    statuses["validate"] = "complete";
    statuses["prove"] = "complete";
  } else if (phase === "verifying") {
    statuses["fill"] = "complete";
    statuses["validate"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "active";
  } else if (phase === "verified") {
    statuses["fill"] = "complete";
    statuses["validate"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "complete";
  }
  return statuses;
}

function validateSudoku(grid: readonly number[][]): string | null {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] < 1 || grid[i][j] > 9) {
        return `Cell (${i + 1},${j + 1}) must be 1-9`;
      }
    }
  }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (PUZZLE[i][j] !== 0 && grid[i][j] !== PUZZLE[i][j]) {
        return `Cell (${i + 1},${j + 1}) doesn't match the puzzle clue`;
      }
    }
  }

  for (let i = 0; i < 9; i++) {
    const row = new Set(grid[i]);
    if (row.size !== 9) return `Row ${i + 1} has duplicate values`;
  }

  for (let j = 0; j < 9; j++) {
    const col = new Set(grid.map((row) => row[j]));
    if (col.size !== 9) return `Column ${j + 1} has duplicate values`;
  }

  for (let box = 0; box < 9; box++) {
    const boxRow = Math.floor(box / 3) * 3;
    const boxCol = (box % 3) * 3;
    const values = new Set<number>();
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        values.add(grid[boxRow + i][boxCol + j]);
      }
    }
    if (values.size !== 9) return `Box ${box + 1} has duplicate values`;
  }

  return null;
}

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

const phaseTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export function SudokuDemo() {
  const [userGrid, setUserGrid] = useState<number[][]>(
    SOLUTION.map((row) => [...row]),
  );
  const [showSolution, setShowSolution] = useState(true);
  const [phase, setPhase] = useState<DemoPhase>("input");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  const handleCellChange = useCallback(
    (row: number, col: number, value: string) => {
      if (PUZZLE[row][col] !== 0) return;
      const num = parseInt(value) || 0;
      if (num >= 0 && num <= 9) {
        setUserGrid((prev) => {
          const newGrid = prev.map((r) => [...r]);
          newGrid[row] = [...newGrid[row]];
          newGrid[row][col] = num;
          return newGrid;
        });
      }
    },
    [],
  );

  const handleValidate = useCallback(() => {
    setError("");
    setPhase("validating");

    const validationError = validateSudoku(userGrid);
    if (validationError) {
      setError(validationError);
      setPhase("input");
      return;
    }

    setPhase("validated");
    setProofResult(null);
    setVerificationResult(null);
  }, [userGrid]);

  const handleGenerateProof = useCallback(async () => {
    try {
      setError("");
      setPhase("proving");
      setProgressMessage("Starting proof generation...");

      const solution = userGrid.map((row) => row.map((v) => v.toString()));
      const puzzle = PUZZLE.map((row) => row.map((v) => v.toString()));

      const input = { solution, puzzle };

      const result = await generateProof(
        input,
        "/circuits/sudoku.wasm",
        "/circuits/sudoku_final.zkey",
        (_progress, message) => {
          setProgressMessage(message);
        },
      );

      setProofResult(result);
      setPhase("proved");
      setProgressMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proof generation failed");
      setPhase("validated");
      setProgressMessage("");
    }
  }, [userGrid]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;
    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/sudoku_verification_key.json",
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
      setPhase("proved");
    }
  }, [proofResult]);

  const handleReset = useCallback(() => {
    setPhase("input");
    setUserGrid(SOLUTION.map((row) => [...row]));
    setProofResult(null);
    setVerificationResult(null);
    setError("");
    setProgressMessage("");
  }, []);

  const handleClearSolution = useCallback(() => {
    setUserGrid(
      PUZZLE.map((row) =>
        row.map((v) => (v !== 0 ? v : 0)),
      ),
    );
    setPhase("input");
    setProofResult(null);
    setVerificationResult(null);
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
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleClearSolution}>
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </div>
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

          <AnimatePresence mode="wait">
            <motion.div key="grid-section" {...phaseTransition}>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Grid3X3 className="h-4 w-4" />
                      <p className="text-sm font-semibold">
                        Step 1: Fill the Sudoku Grid
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSolution(!showSolution)}
                      title={showSolution ? "Hide solution" : "Show solution"}
                      aria-label={showSolution ? "Hide solution" : "Show solution"}
                    >
                      {showSolution ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fill in the empty cells with numbers 1-9. Bold cells are
                    puzzle clues and cannot be changed. The solution is
                    pre-filled for convenience.
                  </p>

                  <div className="flex justify-center">
                    <div className="inline-grid grid-cols-9 border-2 border-foreground rounded overflow-hidden">
                      {userGrid.map((row, i) =>
                        row.map((cell, j) => {
                          const isClue = PUZZLE[i][j] !== 0;
                          const borderRight = (j + 1) % 3 === 0 && j < 8;
                          const borderBottom = (i + 1) % 3 === 0 && i < 8;
                          return (
                            <input
                              key={`${i}-${j}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={
                                showSolution
                                  ? cell || ""
                                  : isClue
                                    ? cell.toString()
                                    : ""
                              }
                              onChange={(e) =>
                                handleCellChange(i, j, e.target.value)
                              }
                              disabled={isClue || phase !== "input"}
                              className={[
                                "w-9 h-9 sm:w-10 sm:h-10 text-center text-sm sm:text-lg font-medium",
                                "border border-muted bg-background",
                                borderRight
                                  ? "border-r-2 border-r-foreground"
                                  : "",
                                borderBottom
                                  ? "border-b-2 border-b-foreground"
                                  : "",
                                isClue ? "bg-muted font-bold" : "",
                                "focus:outline-none focus:ring-2 focus:ring-primary focus:z-10",
                              ].join(" ")}
                            />
                          );
                        }),
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleValidate}
                      disabled={phase !== "input"}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Validate Solution
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setUserGrid(SOLUTION.map((row) => [...row]))
                      }
                      title="Fill with correct solution"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {phase !== "input" && phase !== "validating" && (
            <AnimatePresence mode="wait">
              <motion.div key="step3" {...phaseTransition}>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">
                      Step 2: Generate ZK Proof
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Generate a Groth16 proof that your solution is valid
                      without revealing the actual cell values. The puzzle clues
                      (81 cells) are public signals.
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      >
                        82 public signals
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        81 puzzle cells + 1 solution commitment
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
                      onClick={handleGenerateProof}
                      disabled={
                        phase !== "validated" &&
                        phase !== "proved" &&
                        phase !== "verified"
                      }
                    >
                      Generate Proof
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {proofResult && (
            <AnimatePresence mode="wait">
              <motion.div key="proof-data" {...phaseTransition}>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Proof Data</p>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        Generated
                      </Badge>
                    </div>
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
                        Public Signals (first 5 of{" "}
                        {proofResult.publicSignals.length}):
                      </p>
                      <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                        <code>
                          {proofResult.publicSignals
                            .slice(0, 5)
                            .map((s) => truncateHex(s, 16))
                            .join("\n")}
                          {proofResult.publicSignals.length > 5
                            ? `\n... and ${proofResult.publicSignals.length - 5} more`
                            : ""}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {proofResult && (
            <AnimatePresence mode="wait">
              <motion.div key="step4" {...phaseTransition}>
                <div
                  className={`rounded-lg border bg-card p-4 relative ${
                    verificationResult === true
                      ? "border-green-300 dark:border-green-700"
                      : "border-border"
                  }`}
                >
                  {verificationResult === true && (
                    <ShineBorder shineColor={["#22c55e", "#10b981"]} />
                  )}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <p className="text-sm font-semibold">
                        Step 3: Verify Proof
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Verify the proof using the verification key. The verifier
                      confirms a valid solution exists without seeing it.
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
                            ? "The proof is valid! A valid Sudoku solution exists for this puzzle — without revealing the solution."
                            : "The proof is invalid. The solution does not satisfy the puzzle constraints."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </TabsContent>

      <TabsContent value="learn" className="mt-4">
        <EducationPanel
          howItWorks={[
            {
              title: "Encode the Puzzle as Constraints",
              description:
                "The 9x9 Sudoku puzzle is encoded as an arithmetic circuit with constraints for rows, columns, and 3x3 boxes.",
              details: [
                "Each row must contain digits 1-9 exactly once (verified by sum=45 and sum-of-squares=285)",
                "Each column must contain digits 1-9 exactly once",
                "Each 3x3 box must contain digits 1-9 exactly once",
                "The solution must match all given puzzle clues",
              ],
            },
            {
              title: "Generate a Groth16 Proof",
              description:
                "The solver generates a proof that they know a valid solution, without revealing any of the filled-in cells.",
              details: [
                "The puzzle clues (81 cells) are public inputs — everyone can see the starting grid",
                "The solution (81 cells) is a private input — only the prover knows it",
                "A solution commitment hash is computed inside the circuit as a public output",
              ],
            },
            {
              title: "Verify the Proof",
              description:
                "The verifier checks the proof against the puzzle and commitment, confirming a valid solution exists.",
              details: [
                "Verification uses 82 public signals: 81 puzzle cells + 1 commitment",
                "The verifier learns nothing about the actual solution values",
                "On-chain verification enables trustless puzzle competitions",
              ],
            },
          ]}
          whyItMatters="ZK Sudoku verification demonstrates how constraint satisfaction problems can be proven without revealing solutions. This pattern extends to any verifiable computation: proving you solved a problem correctly without showing your work."
          tips={[
            "The circuit uses sum and sum-of-squares to efficiently check uniqueness of 9 values",
            "This is one of the larger circuits — 82 public signals make proof generation slower",
            "The pattern generalizes to any NP-complete problem (e.g., graph coloring, SAT)",
            "On-chain verification enables decentralized puzzle competitions with prize pools",
          ]}
          defaultExpanded
        />
      </TabsContent>

      {proofResult && (
        <TabsContent value="on-chain" className="mt-4">
          <OnChainVerify
            proofResult={proofResult}
            verifierAbi={sudokuVerifierAbi}
            defaultAddress={ZK_CONTRACTS.sudokuVerifier}
            circuitName="Sudoku"
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
