"use client";

import { useState, useCallback } from "react";
import {
  Check,
  X,
  Key,
  Copy,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Lock,
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
import { poseidonHash, bigintToHex } from "../../lib/applied-zk/poseidon";
import { OnChainVerify } from "./on-chain-verify";
import { passwordVerifierAbi } from "../../lib/applied-zk/abis";
import { ZK_CONTRACTS } from "../../lib/applied-zk/contracts";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShineBorder } from "../ui/shine-border";

type DemoPhase =
  | "input"
  | "registering"
  | "registered"
  | "proving"
  | "proved"
  | "verifying"
  | "verified";

const pipelineSteps = [
  { id: "register", label: "Register" },
  { id: "hash", label: "Hash" },
  { id: "prove", label: "Generate Proof" },
  { id: "verify", label: "Verify" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "input":
      return 0;
    case "registering":
      return 1;
    case "registered":
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
  if (phase === "registering") {
    statuses["register"] = "complete";
    statuses["hash"] = "active";
  } else if (phase === "registered") {
    statuses["register"] = "complete";
    statuses["hash"] = "complete";
  } else if (phase === "proving") {
    statuses["register"] = "complete";
    statuses["hash"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "proved") {
    statuses["register"] = "complete";
    statuses["hash"] = "complete";
    statuses["prove"] = "complete";
  } else if (phase === "verifying") {
    statuses["register"] = "complete";
    statuses["hash"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "active";
  } else if (phase === "verified") {
    statuses["register"] = "complete";
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

/** Convert a password string to a field element (max 31 bytes) */
function passwordToField(pwd: string): bigint {
  const bytes = new TextEncoder().encode(pwd);
  let num = BigInt(0);
  for (let i = 0; i < Math.min(bytes.length, 31); i++) {
    num = (num << BigInt(8)) + BigInt(bytes[i]);
  }
  return num;
}

/** Generate a random salt as a bigint */
function generateSalt(): bigint {
  const randomBytes = new Uint8Array(31);
  crypto.getRandomValues(randomBytes);
  let hex = "0x";
  for (const byte of randomBytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return BigInt(hex);
}

const phaseTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export function PasswordProofDemo() {
  const [passwordInput, setPasswordInput] = useState("mySecret123");
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("input");
  const [salt, setSalt] = useState<bigint | null>(null);
  const [passwordHashHex, setPasswordHashHex] = useState("");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(passwordHashHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegister = useCallback(async () => {
    try {
      setError("");
      setPhase("registering");

      const newSalt = generateSalt();
      setSalt(newSalt);

      const passwordField = passwordToField(passwordInput);
      const hash = await poseidonHash([passwordField, newSalt]);
      setPasswordHashHex(bigintToHex(hash));

      setPhase("registered");
      setProofResult(null);
      setVerificationResult(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to register password",
      );
      setPhase("input");
    }
  }, [passwordInput]);

  const handleGenerateProof = useCallback(async () => {
    if (!salt) return;
    try {
      setError("");
      setPhase("proving");
      setProgressMessage("Starting proof generation...");

      const passwordField = passwordToField(passwordInput);
      const input = {
        password: passwordField.toString(),
        salt: salt.toString(),
        passwordHash: passwordHashHex
          ? BigInt(passwordHashHex).toString()
          : "0",
      };

      const result = await generateProof(
        input,
        "/circuits/password_proof.wasm",
        "/circuits/password_proof_final.zkey",
        (_progress, message) => {
          setProgressMessage(message);
        },
      );

      setProofResult(result);
      setPhase("proved");
      setProgressMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proof generation failed");
      setPhase("registered");
      setProgressMessage("");
    }
  }, [passwordInput, salt, passwordHashHex]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;
    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/password_proof_verification_key.json",
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
    setSalt(null);
    setPasswordHashHex("");
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
            <motion.div key="step1" {...phaseTransition}>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <p className="text-sm font-semibold">
                      Step 1: Enter Password
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a password to register. A random salt will be
                    generated and the password will be hashed with Poseidon.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password-input">Password</Label>
                    <div className="relative">
                      <Input
                        id="password-input"
                        type={showPassword ? "text" : "password"}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter a password"
                        disabled={phase !== "input"}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleRegister}
                    disabled={phase !== "input" || !passwordInput.trim()}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Register Password (Hash with Salt)
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {passwordHashHex && (
            <AnimatePresence mode="wait">
              <motion.div key="step2" {...phaseTransition}>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <p className="text-sm font-semibold">
                        Step 2: Stored Credential (Public)
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        Public
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Only the hash and salt are stored. The password is never
                        saved.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1">
                        Password Hash:
                      </p>
                      <div className="flex items-center gap-1">
                        <pre className="flex-1 rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                          <code>{truncateHex(passwordHashHex, 16)}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopy}
                          title={copied ? "Copied" : "Copy"}
                          aria-label="Copy to clipboard"
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {salt && (
                      <div>
                        <p className="text-xs font-medium mb-1">Salt:</p>
                        <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                          <code>{truncateHex(bigintToHex(salt), 12)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {passwordHashHex && (
            <AnimatePresence mode="wait">
              <motion.div key="step3" {...phaseTransition}>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">
                      Step 3: Generate ZK Proof
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Prove you know the password that hashes to the stored
                      value, without revealing the password itself.
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
                      disabled={
                        phase !== "registered" &&
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
                        Public Signals ({proofResult.publicSignals.length}):
                      </p>
                      <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                        <code>
                          {proofResult.publicSignals
                            .map((s) => truncateHex(s, 16))
                            .join("\n")}
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
                    <p className="text-sm font-semibold">
                      Step 4: Verify Proof
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Verify the proof using the verification key. No password
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
                            ? "The proof is valid! You proved knowledge of the password without revealing it."
                            : "The proof is invalid. The password does not match the stored hash."}
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
              title: "Register with Salted Hash",
              description:
                "The user's password is combined with a random salt and hashed using Poseidon. Only the hash and salt are stored — never the password.",
              details: [
                "The salt prevents rainbow table and precomputation attacks",
                "Poseidon is a ZK-friendly hash function with ~8x fewer constraints than SHA-256",
                "The stored hash serves as a public commitment to the password",
              ],
            },
            {
              title: "Generate a Groth16 Proof",
              description:
                "To authenticate, the user generates a ZK proof that they know a password which, when hashed with the stored salt, produces the stored hash.",
              details: [
                "The circuit checks: Poseidon(password, salt) == storedHash",
                "The password (private input) is never transmitted or revealed",
                "Proof generation uses the circuit WASM and proving key (zkey)",
              ],
            },
            {
              title: "Verify Without Secrets",
              description:
                "Anyone can verify the proof using only the public signals (salt, hash) and the verification key. The password remains completely private.",
              details: [
                "Verification is fast and can be done on-chain in a smart contract",
                "This enables passwordless authentication on blockchain",
                "The verifier never learns anything about the actual password",
              ],
            },
          ]}
          whyItMatters="ZK password proofs enable authentication without ever transmitting or storing passwords in plaintext. Unlike traditional systems where servers must see your password to verify it, ZK proofs let you prove knowledge without revelation — eliminating password breach risks entirely."
          tips={[
            "Salted Poseidon hashing prevents precomputation attacks (rainbow tables)",
            "The private input (password) never leaves the browser — only the proof is sent",
            "This pattern can be extended with challenge-response nonces to prevent replay attacks",
            "On-chain verification enables decentralized, trustless authentication",
          ]}
          defaultExpanded
        />
      </TabsContent>

      {proofResult && (
        <TabsContent value="on-chain" className="mt-4">
          <OnChainVerify
            proofResult={proofResult}
            verifierAbi={passwordVerifierAbi}
            defaultAddress={ZK_CONTRACTS.passwordVerifier}
            circuitName="Password Proof"
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
