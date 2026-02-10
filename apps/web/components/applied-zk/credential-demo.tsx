"use client";

import { useState, useCallback } from "react";
import {
  Check,
  X,
  GraduationCap,
  Loader2,
  Shield,
  Award,
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
} from "../../lib/applied-zk/poseidon";
import { OnChainVerify } from "./on-chain-verify";
import { credentialVerifierAbi } from "../../lib/applied-zk/abis";
import { ZK_CONTRACTS } from "../../lib/applied-zk/contracts";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShineBorder } from "../ui/shine-border";

type DemoPhase =
  | "input"
  | "issuing"
  | "issued"
  | "proving"
  | "proved"
  | "verifying"
  | "verified";

const CREDENTIAL_TYPES: Record<number, { name: string; icon: string }> = {
  1: { name: "Bachelor's Degree", icon: "🎓" },
  2: { name: "Master's Degree", icon: "📜" },
  3: { name: "PhD", icon: "🏆" },
  4: { name: "Professional Certificate", icon: "📋" },
};

const ISSUERS: Record<number, string> = {
  1: "MIT",
  2: "Stanford",
  3: "Harvard",
  4: "Generic University",
};

const pipelineSteps = [
  { id: "issue", label: "Issue Credential" },
  { id: "commit", label: "Commitment" },
  { id: "prove", label: "Generate Proof" },
  { id: "verify", label: "Verify" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "input":
      return 0;
    case "issuing":
      return 1;
    case "issued":
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
  if (phase === "issuing") {
    statuses["issue"] = "complete";
    statuses["commit"] = "active";
  } else if (phase === "issued") {
    statuses["issue"] = "complete";
    statuses["commit"] = "complete";
  } else if (phase === "proving") {
    statuses["issue"] = "complete";
    statuses["commit"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "proved") {
    statuses["issue"] = "complete";
    statuses["commit"] = "complete";
    statuses["prove"] = "complete";
  } else if (phase === "verifying") {
    statuses["issue"] = "complete";
    statuses["commit"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "active";
  } else if (phase === "verified") {
    statuses["issue"] = "complete";
    statuses["commit"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "complete";
  }
  return statuses;
}

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

function generateRandomBigint(): bigint {
  const randomBytes = new Uint8Array(31);
  crypto.getRandomValues(randomBytes);
  let hex = "0x";
  for (const byte of randomBytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return BigInt(hex);
}

interface CredentialData {
  readonly subjectId: bigint;
  readonly credentialType: number;
  readonly issueDate: bigint;
  readonly expiryDate: bigint;
  readonly attribute1: number;
  readonly attribute2: number;
  readonly issuerSecret: bigint;
  readonly credentialHash: string;
  readonly issuerPublicKey: string;
}

const phaseTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export function CredentialDemo() {
  const [credentialType, setCredentialType] = useState(1);
  const [issuer, setIssuer] = useState(1);
  const [degreeLevel, setDegreeLevel] = useState(3);
  const [verifyMinLevel, setVerifyMinLevel] = useState(2);
  const [phase, setPhase] = useState<DemoPhase>("input");
  const [credential, setCredential] = useState<CredentialData | null>(null);
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  const handleIssue = useCallback(async () => {
    try {
      setError("");
      setPhase("issuing");

      const subjectId = generateRandomBigint();
      const issueDate = BigInt(Math.floor(Date.now() / 1000));
      const expiryDate = BigInt(0);
      const attribute2 = 0;
      const issuerSecret = generateRandomBigint();

      const credHash = await poseidonHash([
        subjectId,
        BigInt(credentialType),
        issueDate,
        expiryDate,
        BigInt(degreeLevel),
        BigInt(attribute2),
      ]);

      const issuerPk = await poseidonHash([credHash, issuerSecret]);

      setCredential({
        subjectId,
        credentialType,
        issueDate,
        expiryDate,
        attribute1: degreeLevel,
        attribute2,
        issuerSecret,
        credentialHash: bigintToHex(credHash),
        issuerPublicKey: bigintToHex(issuerPk),
      });

      setPhase("issued");
      setProofResult(null);
      setVerificationResult(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to issue credential",
      );
      setPhase("input");
    }
  }, [credentialType, degreeLevel]);

  const handleGenerateProof = useCallback(async () => {
    if (!credential) return;
    try {
      setError("");
      setPhase("proving");
      setProgressMessage("Starting proof generation...");

      const currentTime = BigInt(Math.floor(Date.now() / 1000));
      const requiredType = BigInt(0);

      const input = {
        subjectId: credential.subjectId.toString(),
        credentialType: credential.credentialType.toString(),
        issueDate: credential.issueDate.toString(),
        expiryDate: credential.expiryDate.toString(),
        attribute1: credential.attribute1.toString(),
        attribute2: credential.attribute2.toString(),
        issuerSecret: credential.issuerSecret.toString(),
        credentialHash: BigInt(credential.credentialHash).toString(),
        issuerPublicKey: BigInt(credential.issuerPublicKey).toString(),
        currentTime: currentTime.toString(),
        requiredType: requiredType.toString(),
        minAttribute1: verifyMinLevel.toString(),
      };

      const result = await generateProof(
        input,
        "/circuits/credential_proof.wasm",
        "/circuits/credential_proof_final.zkey",
        (_progress, message) => {
          setProgressMessage(message);
        },
      );

      setProofResult(result);
      setPhase("proved");
      setProgressMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proof generation failed");
      setPhase("issued");
      setProgressMessage("");
    }
  }, [credential, verifyMinLevel]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;
    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/credential_proof_verification_key.json",
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
    setCredential(null);
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
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <p className="text-sm font-semibold">
                      Step 1: Issue Credential
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select credential attributes. The issuer creates a Poseidon
                    hash commitment and signs it with their secret key.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="cred-type">Credential Type</Label>
                      <Select
                        value={String(credentialType)}
                        onValueChange={(v) => setCredentialType(Number(v))}
                        disabled={phase !== "input"}
                      >
                        <SelectTrigger id="cred-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CREDENTIAL_TYPES).map(
                            ([key, val]) => (
                              <SelectItem key={key} value={key}>
                                {val.icon} {val.name}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="cred-issuer">Issuer</Label>
                      <Select
                        value={String(issuer)}
                        onValueChange={(v) => setIssuer(Number(v))}
                        disabled={phase !== "input"}
                      >
                        <SelectTrigger id="cred-issuer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ISSUERS).map(([key, name]) => (
                            <SelectItem key={key} value={key}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label>Degree Level (1-5)</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Button
                          key={level}
                          variant={
                            degreeLevel === level ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setDegreeLevel(level)}
                          disabled={phase !== "input"}
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Private attribute — will be proven without revealing the
                      exact value
                    </p>
                  </div>

                  <Button
                    onClick={handleIssue}
                    disabled={phase !== "input"}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Issue Credential
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {credential && (
            <AnimatePresence mode="wait">
              <motion.div key="step2" {...phaseTransition}>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <p className="text-sm font-semibold">
                        Step 2: Credential Commitment (Public)
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        Issued
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        {CREDENTIAL_TYPES[credential.credentialType]?.name}
                      </Badge>
                      <Badge variant="secondary">
                        Level {credential.attribute1}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1">
                        Credential Hash:
                      </p>
                      <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                        <code>
                          {truncateHex(credential.credentialHash, 16)}
                        </code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1">
                        Issuer Public Key:
                      </p>
                      <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                        <code>
                          {truncateHex(credential.issuerPublicKey, 16)}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {credential && (
            <AnimatePresence mode="wait">
              <motion.div key="step3" {...phaseTransition}>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">
                      Step 3: Generate ZK Proof
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Prove you hold a valid credential with degree level
                      &ge; minimum, without revealing your identity, exact level,
                      or issuer secret.
                    </p>

                    <div className="flex flex-col gap-1">
                      <Label>Minimum Level Required for Verification</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <Button
                            key={level}
                            variant={
                              verifyMinLevel === level ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setVerifyMinLevel(level)}
                            disabled={phase === "proving"}
                          >
                            {level}+
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {degreeLevel >= verifyMinLevel ? (
                          <span className="text-green-600 dark:text-green-400">
                            Your level ({degreeLevel}) meets the minimum (
                            {verifyMinLevel})
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">
                            Your level ({degreeLevel}) does not meet the minimum
                            ({verifyMinLevel})
                          </span>
                        )}
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
                        phase !== "issued" &&
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
                      Verify the credential proof. The verifier confirms the
                      credential is valid and meets the requirements without
                      learning any private details.
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
                            ? "The proof is valid! The credential holder meets the requirements without revealing their identity or exact credentials."
                            : "The proof is invalid. The credential does not meet the verification requirements."}
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
              title: "Issue a Verifiable Credential",
              description:
                "An issuer creates a credential with attributes (type, level, dates) and signs it using a Poseidon hash commitment.",
              details: [
                "The credential is hashed: Poseidon(subjectId, type, issueDate, expiry, attr1, attr2)",
                "The issuer signs by computing: Poseidon(credHash, issuerSecret)",
                "Only the hash and issuer public key are stored publicly",
              ],
            },
            {
              title: "Generate a Selective Disclosure Proof",
              description:
                "The holder proves specific properties about their credential (e.g., degree level >= 3) without revealing the full credential details.",
              details: [
                "The circuit verifies the credential hash matches the stored commitment",
                "It checks the issuer signature is valid",
                "It proves attribute1 >= minAttribute1 without revealing the exact value",
                "The subject's identity is never disclosed",
              ],
            },
            {
              title: "Verify Anonymously",
              description:
                "The verifier confirms the credential is valid, properly signed, and meets the requirements — without learning who holds it.",
              details: [
                "5 public signals: credentialHash, issuerPubKey, currentTime, requiredType, minAttribute",
                "The verifier learns only that the requirements are met, nothing more",
                "This enables anonymous credential systems on blockchain",
              ],
            },
          ]}
          whyItMatters="Anonymous credentials are foundational to privacy-preserving identity systems. Prove you're qualified for a job without revealing your university. Prove you're over 18 without showing your birthdate. Prove membership without revealing your name."
          tips={[
            "The credential hash acts as a 'commitment' — it binds the issuer to specific attributes",
            "Selective disclosure means you choose what to reveal for each verification",
            "The issuer signature (Poseidon-based) prevents credential forgery",
            "Expiry checking inside the circuit prevents use of expired credentials",
            "This pattern is the basis for W3C Verifiable Credentials with ZK proofs",
          ]}
          defaultExpanded
        />
      </TabsContent>

      {proofResult && (
        <TabsContent value="on-chain" className="mt-4">
          <OnChainVerify
            proofResult={proofResult}
            verifierAbi={credentialVerifierAbi}
            defaultAddress={ZK_CONTRACTS.credentialVerifier}
            circuitName="Credential Proof"
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
