"use client";

import { useState, useCallback } from "react";
import { Check, X } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProgressPipeline, EducationPanel } from "../shared";
import { VoterRegistration } from "./voter-registration";
import { VotingBooth } from "./voting-booth";
import { ResultsPanel } from "./results-panel";
import {
  generateProof,
  verifyProof,
  type ProofGenerationResult,
} from "../../lib/applied-zk/snarkjs";
import {
  generateIdentitySecret,
  generateIdentityCommitment,
  generateNullifier,
  bigintToHex,
} from "../../lib/applied-zk/poseidon";
import {
  MerkleTree,
  formatMerkleProofForCircuit,
} from "../../lib/applied-zk/merkle";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type DemoPhase =
  | "setup"
  | "registering"
  | "registered"
  | "voting"
  | "proving"
  | "proved"
  | "verifying"
  | "verified";

type VoteChoice = "yes" | "no";

interface VoterRegistrationData {
  readonly secret: bigint;
  readonly commitment: bigint;
  readonly commitmentHex: string;
}

const pipelineSteps = [
  { id: "register", label: "Register" },
  { id: "vote", label: "Cast Vote" },
  { id: "prove", label: "ZK Proof" },
  { id: "verify", label: "Verify" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "setup":
      return 0;
    case "registering":
      return 0;
    case "registered":
      return 1;
    case "voting":
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
    statuses["register"] = "active";
  } else if (phase === "registered" || phase === "voting") {
    statuses["register"] = "complete";
    if (phase === "voting") statuses["vote"] = "active";
  } else if (phase === "proving") {
    statuses["register"] = "complete";
    statuses["vote"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "proved") {
    statuses["register"] = "complete";
    statuses["vote"] = "complete";
    statuses["prove"] = "complete";
  } else if (phase === "verifying") {
    statuses["register"] = "complete";
    statuses["vote"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "active";
  } else if (phase === "verified") {
    statuses["register"] = "complete";
    statuses["vote"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "complete";
  }
  return statuses;
}

const PROPOSAL_ID = 1n;

export function SecretVotingDemo() {
  const [phase, setPhase] = useState<DemoPhase>("setup");
  const [voter, setVoter] = useState<VoterRegistrationData | null>(null);
  const [otherVoters, setOtherVoters] = useState<readonly string[]>([]);
  const [voteChoice, setVoteChoice] = useState<VoteChoice>("yes");
  const [nullifierHash, setNullifierHash] = useState("");
  const [merkleRoot, setMerkleRoot] = useState("");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  function truncateHex(hex: string, chars: number = 10): string {
    if (hex.length <= chars * 2 + 2) return hex;
    return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
  }

  const handleRegister = useCallback(async () => {
    try {
      setError("");
      setPhase("registering");

      const secret = generateIdentitySecret();
      const commitment = await generateIdentityCommitment(secret);
      const commitmentHex = bigintToHex(commitment);

      const otherSecrets = [
        generateIdentitySecret(),
        generateIdentitySecret(),
        generateIdentitySecret(),
      ];
      const otherCommitments = await Promise.all(
        otherSecrets.map((s) => generateIdentityCommitment(s)),
      );
      const otherHexes = otherCommitments.map((c) =>
        truncateHex(bigintToHex(c), 8),
      );

      setVoter({ secret, commitment, commitmentHex });
      setOtherVoters(otherHexes);
      setPhase("registered");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setPhase("setup");
    }
  }, []);

  const handleVoteAndProve = useCallback(async () => {
    if (!voter) return;

    try {
      setError("");
      setPhase("proving");
      setProgressMessage("Building Merkle tree of registered voters...");

      const otherSecrets = [
        generateIdentitySecret(),
        generateIdentitySecret(),
        generateIdentitySecret(),
      ];
      const otherCommitments = await Promise.all(
        otherSecrets.map((s) => generateIdentityCommitment(s)),
      );
      const allCommitments = [voter.commitment, ...otherCommitments];

      const tree = await MerkleTree.fromLeaves(4, allCommitments);
      const proof = await tree.getProof(0);
      const formattedProof = formatMerkleProofForCircuit(proof);

      const root = tree.getRoot();
      setMerkleRoot(bigintToHex(root));

      setProgressMessage("Computing nullifier...");
      const nullifier = await generateNullifier(voter.secret, PROPOSAL_ID);
      setNullifierHash(bigintToHex(nullifier));

      setProgressMessage("Generating ZK proof...");

      const voteValue = voteChoice === "yes" ? "1" : "0";

      const circuitInput = {
        identitySecret: voter.secret.toString(),
        pathElements: formattedProof.pathElements,
        pathIndices: formattedProof.pathIndices,
        externalNullifier: PROPOSAL_ID.toString(),
        vote: voteValue,
      };

      const result = await generateProof(
        circuitInput,
        "/circuits/secret_voting.wasm",
        "/circuits/secret_voting_final.zkey",
        (_progress, message) => {
          setProgressMessage(message);
        },
      );

      setProofResult(result);
      setPhase("proved");
      setProgressMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Vote proof generation failed",
      );
      setPhase("registered");
      setProgressMessage("");
    }
  }, [voter, voteChoice]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;

    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/secret_voting_verification_key.json",
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
    setVoter(null);
    setOtherVoters([]);
    setVoteChoice("yes");
    setNullifierHash("");
    setMerkleRoot("");
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

          <VoterRegistration
            voter={voter}
            otherVoters={otherVoters}
            phase={phase}
            onRegister={handleRegister}
          />

          <VotingBooth
            voteChoice={voteChoice}
            phase={phase}
            progressMessage={progressMessage}
            onVoteChoiceChange={setVoteChoice}
            onVoteAndProve={handleVoteAndProve}
          />

          <ResultsPanel
            nullifierHash={nullifierHash}
            merkleRoot={merkleRoot}
            proofResult={proofResult}
          />

          {proofResult && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">
                  Step 3: Verify Vote
                </p>
                <Button
                  onClick={handleVerifyProof}
                  disabled={phase === "verifying"}
                  className={
                    verificationResult === true
                      ? "bg-green-600 hover:bg-green-700"
                      : verificationResult === false
                        ? "bg-red-600 hover:bg-red-700"
                        : ""
                  }
                >
                  {verificationResult === null
                    ? "Verify Vote Proof"
                    : verificationResult
                      ? "Vote Verified"
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
                        ? "Vote is valid! The voter is registered, the vote is legitimate, and the nullifier prevents double-voting."
                        : "Vote verification failed. The proof is invalid."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="learn" className="mt-4">
        <EducationPanel
          howItWorks={[
            {
              title: "Identity Registration",
              description:
                "Each voter generates a random secret and computes an identity commitment (Poseidon hash). The commitment is added to a Merkle tree.",
              details: [
                "The secret stays with the voter; only the commitment is published",
                "The Merkle tree root represents the set of all registered voters",
              ],
            },
            {
              title: "Anonymous Voting",
              description:
                "To vote, the voter generates a ZK proof showing: (1) their commitment is in the Merkle tree, and (2) their vote is valid.",
              details: [
                "The proof does not reveal which leaf (voter) cast the vote",
                "A nullifier derived from the secret and proposal ID prevents double voting",
              ],
            },
            {
              title: "Nullifier-Based Double-Vote Prevention",
              description:
                "The nullifier is published with the proof. If the same nullifier appears twice, the second vote is rejected.",
              details: [
                "The nullifier is deterministic: same secret + same proposal = same nullifier",
                "But the nullifier cannot be linked back to the identity commitment",
              ],
            },
          ]}
          whyItMatters="Anonymous voting is essential for fair governance in DAOs and elections. Without ZK proofs, voters must either be identifiable (risking coercion) or use trusted intermediaries. ZK voting provides both anonymity and verifiability."
          tips={[
            "This pattern is used by protocols like Semaphore and MACI for on-chain governance",
            "The Merkle tree depth determines the maximum number of registered voters (2^depth)",
            "External nullifiers (proposal IDs) ensure voters can vote once per proposal but vote in multiple proposals",
            "In production, the Merkle tree is maintained on-chain with incremental updates",
          ]}
          defaultExpanded
        />
      </TabsContent>
    </Tabs>
  );
}
