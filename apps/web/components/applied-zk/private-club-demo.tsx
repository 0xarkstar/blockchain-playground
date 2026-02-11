"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Check,
  X,
  Loader2,
  Users,
  Shield,
  Crown,
  Star,
  Sparkles,
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
import {
  poseidonHash,
  bigintToHex,
  generateIdentitySecret,
} from "../../lib/applied-zk/poseidon";
import {
  MerkleTree,
  formatMerkleProofForCircuit,
} from "../../lib/applied-zk/merkle";
import { OnChainVerify } from "./on-chain-verify";
import { privateClubVerifierAbi } from "../../lib/applied-zk/abis";
import { ZK_CONTRACTS } from "../../lib/applied-zk/contracts";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShineBorder } from "../ui/shine-border";

const TREE_DEPTH = 10;

const TIERS: Record<number, { name: string; color: string }> = {
  1: { name: "Basic", color: "bg-gray-500" },
  2: { name: "Premium", color: "bg-blue-500" },
  3: { name: "VIP", color: "bg-yellow-500" },
};

const TIER_ICONS: Record<number, React.ReactNode> = {
  1: <Users className="h-3.5 w-3.5" />,
  2: <Star className="h-3.5 w-3.5" />,
  3: <Crown className="h-3.5 w-3.5" />,
};

type DemoPhase =
  | "init"
  | "joining"
  | "joined"
  | "proving"
  | "proved"
  | "verifying"
  | "verified";

const pipelineSteps = [
  { id: "join", label: "Join Club" },
  { id: "select", label: "Select Action" },
  { id: "prove", label: "ZK Proof" },
  { id: "verify", label: "Access Check" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "init":
      return 0;
    case "joining":
      return 0;
    case "joined":
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
  if (phase === "joining") {
    statuses["join"] = "active";
  } else if (phase === "joined") {
    statuses["join"] = "complete";
    statuses["select"] = "active";
  } else if (phase === "proving") {
    statuses["join"] = "complete";
    statuses["select"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "proved") {
    statuses["join"] = "complete";
    statuses["select"] = "complete";
    statuses["prove"] = "complete";
  } else if (phase === "verifying") {
    statuses["join"] = "complete";
    statuses["select"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "active";
  } else if (phase === "verified") {
    statuses["join"] = "complete";
    statuses["select"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "complete";
  }
  return statuses;
}

interface Member {
  readonly commitment: bigint;
  readonly commitmentHex: string;
  readonly tier: number;
  readonly joinDate: number;
}

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

const ACTIONS = [
  { id: "vote", label: "Vote on Proposal", minTier: 1 },
  { id: "premium", label: "Access Premium", minTier: 2 },
  { id: "exclusive", label: "Join VIP Chat", minTier: 3 },
  { id: "claim", label: "Claim Reward", minTier: 1 },
];

export function PrivateClubDemo() {
  const [members, setMembers] = useState<Member[]>([]);
  const [myMembership, setMyMembership] = useState<{
    memberId: bigint;
    memberSecret: bigint;
    commitment: bigint;
    tier: number;
    joinDate: number;
    leafIndex: number;
  } | null>(null);
  const [selectedTier, setSelectedTier] = useState(2);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedMinTier, setSelectedMinTier] = useState(1);
  const [phase, setPhase] = useState<DemoPhase>("init");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  // Initialize dummy members
  useEffect(() => {
    const initDummyMembers = async () => {
      const dummyMembers: Member[] = [];
      const tiers = [3, 2, 1];
      const daysAgo = [365, 180, 30];

      for (let i = 0; i < 3; i++) {
        const memberId = generateIdentitySecret();
        const memberSecret = generateIdentitySecret();
        const tier = tiers[i];
        const joinDate = Math.floor(
          (Date.now() - 86400000 * daysAgo[i]) / 1000,
        );

        const commitment = await poseidonHash([
          memberId,
          memberSecret,
          BigInt(tier),
          BigInt(joinDate),
        ]);

        dummyMembers.push({
          commitment,
          commitmentHex: bigintToHex(commitment),
          tier,
          joinDate: joinDate * 1000,
        });
      }

      setMembers(dummyMembers);
    };
    initDummyMembers();
  }, []);

  const handleJoinClub = useCallback(async () => {
    try {
      setError("");
      setPhase("joining");
      setProgressMessage("Generating identity...");

      const memberId = generateIdentitySecret();
      const memberSecret = generateIdentitySecret();
      const joinDate = Math.floor(Date.now() / 1000);

      setProgressMessage("Computing commitment...");
      const commitment = await poseidonHash([
        memberId,
        memberSecret,
        BigInt(selectedTier),
        BigInt(joinDate),
      ]);

      const newMember: Member = {
        commitment,
        commitmentHex: bigintToHex(commitment),
        tier: selectedTier,
        joinDate: joinDate * 1000,
      };

      const updatedMembers = [...members, newMember];
      setMembers(updatedMembers);

      setMyMembership({
        memberId,
        memberSecret,
        commitment,
        tier: selectedTier,
        joinDate: joinDate * 1000,
        leafIndex: updatedMembers.length - 1,
      });

      setPhase("joined");
      setProgressMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join club");
      setPhase("init");
      setProgressMessage("");
    }
  }, [selectedTier, members]);

  const handleVerifyMembership = useCallback(
    async (actionId: string, minTier: number) => {
      if (!myMembership) return;

      try {
        setError("");
        setSelectedAction(actionId);
        setSelectedMinTier(minTier);
        setPhase("proving");
        setProgressMessage("Building Merkle tree...");
        setProofResult(null);
        setVerificationResult(null);
        setAccessGranted(null);

        const tree = new MerkleTree(TREE_DEPTH);
        await tree.initialize();
        for (const member of members) {
          await tree.insert(member.commitment);
        }

        const merkleRoot = tree.getRoot();

        setProgressMessage("Generating Merkle proof...");
        const merkleProof = await tree.getProof(myMembership.leafIndex);
        const formattedProof = formatMerkleProofForCircuit(merkleProof);

        setProgressMessage("Computing nullifier...");
        const actionIdBigint = BigInt(actionId.length);
        const nullifierHash = await poseidonHash([
          myMembership.memberSecret,
          actionIdBigint,
        ]);

        const joinDateSeconds = Math.floor(myMembership.joinDate / 1000);

        const circuitInput = {
          memberId: myMembership.memberId.toString(),
          memberSecret: myMembership.memberSecret.toString(),
          membershipTier: myMembership.tier.toString(),
          joinDate: joinDateSeconds.toString(),
          pathElements: formattedProof.pathElements,
          pathIndices: formattedProof.pathIndices,
          merkleRoot: merkleRoot.toString(),
          minTier: minTier.toString(),
          minJoinDate: "0",
          maxJoinDate: (Math.floor(Date.now() / 1000) + 86400).toString(),
          actionId: actionIdBigint.toString(),
          nullifierHash: nullifierHash.toString(),
        };

        setProgressMessage("Generating membership proof...");

        const result = await generateProof(
          circuitInput,
          "/circuits/private_membership.wasm",
          "/circuits/private_membership_final.zkey",
          (_progress, message) => {
            setProgressMessage(message);
          },
        );

        setProofResult(result);
        setPhase("proved");
        setProgressMessage("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Proof generation failed",
        );
        setPhase("joined");
        setProgressMessage("");
      }
    },
    [myMembership, members],
  );

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult || !myMembership) return;

    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/private_membership_verification_key.json",
        proofResult.publicSignals,
        proofResult.proof,
      );

      setVerificationResult(isValid);

      const tierMet = myMembership.tier >= selectedMinTier;
      const granted = isValid && tierMet;
      setAccessGranted(granted);

      setPhase("verified");

      if (granted) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setPhase("proved");
    }
  }, [proofResult, myMembership, selectedMinTier]);

  const handleReset = useCallback(() => {
    setPhase("init");
    setMyMembership(null);
    setSelectedAction(null);
    setProofResult(null);
    setVerificationResult(null);
    setAccessGranted(null);
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

          {/* Step 1: Join Club */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">
                <Users className="mr-1 inline h-4 w-4" />
                Step 1: Join the Club
              </p>
              <p className="text-xs text-muted-foreground">
                Select a membership tier and join. Your identity is committed
                as a Poseidon hash stored in a Merkle tree.
              </p>

              {!myMembership ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select Tier
                    </p>
                    <div className="flex gap-2">
                      {Object.entries(TIERS).map(([key, tier]) => (
                        <Button
                          key={key}
                          variant={
                            selectedTier === Number(key)
                              ? "default"
                              : "outline"
                          }
                          className="flex-1"
                          onClick={() => setSelectedTier(Number(key))}
                        >
                          {TIER_ICONS[Number(key)]}
                          <span className="ml-1">{tier.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {progressMessage && phase === "joining" && (
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {progressMessage}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleJoinClub}
                    disabled={phase !== "init"}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Join Club
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${TIERS[myMembership.tier].color} text-white`}
                    >
                      {TIER_ICONS[myMembership.tier]}
                      <span className="ml-1">
                        {TIERS[myMembership.tier].name}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Joined{" "}
                      {new Date(myMembership.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">
                    {truncateHex(bigintToHex(myMembership.commitment), 12)}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Access Control */}
          {myMembership && (
            <AnimatePresence mode="wait">
              <motion.div
                key="access-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold">
                    <Shield className="mr-1 inline h-4 w-4" />
                    Step 2: Prove Access
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Prove you are a member with sufficient tier — without
                    revealing your identity. Each action has a unique nullifier
                    for rate limiting.
                  </p>

                  {progressMessage && phase === "proving" && (
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {progressMessage}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {ACTIONS.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleVerifyMembership(action.id, action.minTier)
                        }
                        disabled={phase === "proving" || phase === "verifying"}
                        className="flex flex-col items-start h-auto py-2"
                      >
                        <span className="text-xs font-medium">
                          {action.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Requires {TIERS[action.minTier].name}+
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Step 3: Verify */}
          {proofResult && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Step 3: Verify Membership Proof
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  >
                    Generated
                  </Badge>
                </div>
                {selectedAction && (
                  <p className="text-xs text-muted-foreground">
                    Action: <strong>{selectedAction}</strong> | Min Tier:{" "}
                    <strong>{TIERS[selectedMinTier].name}</strong>
                  </p>
                )}
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
                    accessGranted === true
                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                      : accessGranted === false
                        ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        : ""
                  }
                >
                  {accessGranted === null
                    ? "Verify & Check Access"
                    : accessGranted
                      ? "Access Granted"
                      : "Access Denied"}
                </Button>
              </div>
            </div>
          )}

          {/* Access Result */}
          {accessGranted !== null && (
            <div
              className={`relative rounded-lg border p-4 ${
                accessGranted
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              }`}
            >
              {accessGranted && (
                <ShineBorder shineColor={["#22c55e", "#16a34a"]} />
              )}
              {!accessGranted && (
                <ShineBorder shineColor={["#ef4444", "#dc2626"]} />
              )}
              <div className="flex items-center gap-2">
                {accessGranted ? (
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {accessGranted
                      ? "Access Granted — identity remains anonymous!"
                      : `Access Denied — requires ${TIERS[selectedMinTier].name} tier or above.`}
                  </p>
                  {verificationResult !== null && (
                    <p className="text-xs text-muted-foreground">
                      Proof valid: {verificationResult ? "Yes" : "No"} | Tier
                      met:{" "}
                      {myMembership && myMembership.tier >= selectedMinTier
                        ? "Yes"
                        : "No"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Club Members */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-semibold mb-2">Club Members</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {members.map((member, i) => (
                <div key={i} className="rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Badge
                      variant="secondary"
                      className={`${TIERS[member.tier].color} text-white text-xs`}
                    >
                      {TIER_ICONS[member.tier]}
                      <span className="ml-1">
                        {TIERS[member.tier].name}
                      </span>
                    </Badge>
                  </div>
                  <code className="text-xs text-muted-foreground">
                    {truncateHex(member.commitmentHex, 8)}
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </p>
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
              title: "Join: Create Anonymous Membership",
              description:
                "Members join by committing Poseidon(memberId, secret, tier, joinDate) to a Merkle tree. The commitment hides their identity while encoding attributes.",
              details: [
                "3 tiers: Basic, Premium, VIP (1, 2, 3)",
                "Join date is encoded for 'OG member' proofs",
                "The Merkle tree enables set membership proofs",
              ],
            },
            {
              title: "Prove: Anonymous Access Control",
              description:
                "To access a resource, prove you are in the Merkle tree AND your tier meets the minimum requirement — without revealing who you are.",
              details: [
                "The circuit checks: membership in tree + tier >= minTier",
                "Action-specific nullifiers prevent double-actions",
                "Same member, different action = different nullifier",
              ],
            },
            {
              title: "Rate Limiting with Nullifiers",
              description:
                "Each action produces a unique nullifier = Poseidon(memberSecret, actionId). This prevents the same member from performing the same action twice.",
              details: [
                "Nullifier is deterministic: same member + same action = same nullifier",
                "Different actions produce different nullifiers, preserving unlinkability",
                "On-chain contracts track spent nullifiers to enforce limits",
              ],
            },
          ]}
          whyItMatters="Private club membership demonstrates attribute-based access control with ZK proofs. Members prove they meet criteria (tier, join date) without revealing their identity — useful for DAOs, gated communities, and credential verification."
          tips={[
            "The circuit has 6 public signals: merkleRoot, minTier, minJoinDate, maxJoinDate, actionId, nullifierHash",
            "Tier checking uses GreaterEqThan comparators inside the circuit",
            "The Merkle tree supports up to 1024 members (depth 10)",
            "Setting minJoinDate/maxJoinDate to 0 bypasses those checks",
          ]}
          defaultExpanded
        />
      </TabsContent>

      {proofResult && (
        <TabsContent value="on-chain" className="mt-4">
          <OnChainVerify
            proofResult={proofResult}
            verifierAbi={privateClubVerifierAbi}
            defaultAddress={ZK_CONTRACTS.privateClubVerifier}
            circuitName="Private Club"
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
