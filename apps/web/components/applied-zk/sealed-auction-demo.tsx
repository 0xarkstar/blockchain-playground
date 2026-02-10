"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Loader2,
  Gavel,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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
  bigintToHex,
  generateIdentitySecret,
} from "../../lib/applied-zk/poseidon";
import { OnChainVerify } from "./on-chain-verify";
import { sealedAuctionVerifierAbi } from "../../lib/applied-zk/abis";
import { ZK_CONTRACTS } from "../../lib/applied-zk/contracts";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShineBorder } from "../ui/shine-border";

type AuctionPhase = "bidding" | "reveal" | "finalized";
type DemoPhase =
  | "input"
  | "committing"
  | "committed"
  | "revealing"
  | "revealed"
  | "verifying"
  | "verified"
  | "finalized";

const MIN_BID = 100;
const MAX_BID = 10000;

const pipelineSteps = [
  { id: "bid", label: "Place Bid" },
  { id: "commit", label: "Commit" },
  { id: "reveal", label: "ZK Reveal" },
  { id: "finalize", label: "Finalize" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "input":
      return 0;
    case "committing":
      return 1;
    case "committed":
      return 1;
    case "revealing":
      return 2;
    case "revealed":
      return 2;
    case "verifying":
      return 3;
    case "verified":
      return 3;
    case "finalized":
      return 4;
  }
}

function getPipelineStatuses(phase: DemoPhase) {
  const statuses: Record<string, "pending" | "active" | "complete" | "error"> =
    {};
  if (phase === "committing") {
    statuses["bid"] = "complete";
    statuses["commit"] = "active";
  } else if (phase === "committed") {
    statuses["bid"] = "complete";
    statuses["commit"] = "complete";
  } else if (phase === "revealing") {
    statuses["bid"] = "complete";
    statuses["commit"] = "complete";
    statuses["reveal"] = "active";
  } else if (phase === "revealed") {
    statuses["bid"] = "complete";
    statuses["commit"] = "complete";
    statuses["reveal"] = "complete";
  } else if (phase === "verifying") {
    statuses["bid"] = "complete";
    statuses["commit"] = "complete";
    statuses["reveal"] = "complete";
    statuses["finalize"] = "active";
  } else if (phase === "verified" || phase === "finalized") {
    statuses["bid"] = "complete";
    statuses["commit"] = "complete";
    statuses["reveal"] = "complete";
    statuses["finalize"] = "complete";
  }
  return statuses;
}

interface Bid {
  readonly address: string;
  readonly commitmentHex: string;
  readonly revealed: boolean;
  readonly amount?: number;
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

export function SealedAuctionDemo() {
  const [auctionPhase, setAuctionPhase] = useState<AuctionPhase>("bidding");
  const [bidAmount, setBidAmount] = useState("50");
  const [mySalt, setMySalt] = useState<bigint | null>(null);
  const [myCommitment, setMyCommitment] = useState<bigint | null>(null);
  const [showBid, setShowBid] = useState(false);
  const [bids, setBids] = useState<Bid[]>([
    {
      address: "0xAlice...1234",
      commitmentHex: "0x1a2b...3c4d",
      revealed: false,
    },
    {
      address: "0xBob...5678",
      commitmentHex: "0x5e6f...7a8b",
      revealed: false,
    },
  ]);
  const [winner, setWinner] = useState<Bid | null>(null);
  const [phase, setPhase] = useState<DemoPhase>("input");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  const bidAmountInt = Math.floor(parseFloat(bidAmount || "0") * 100);

  const handleCommitBid = useCallback(async () => {
    if (!bidAmount || bidAmountInt <= 0) return;

    try {
      setError("");
      setPhase("committing");
      setProgressMessage("Generating salt...");

      const salt = generateIdentitySecret();
      setMySalt(salt);

      setProgressMessage("Computing commitment...");
      const commitment = await poseidonHashTwo(BigInt(bidAmountInt), salt);
      setMyCommitment(commitment);

      const commitmentHex = bigintToHex(commitment);
      setBids((prev) => [
        ...prev,
        {
          address: "0xYou...9999",
          commitmentHex: truncateHex(commitmentHex, 8),
          revealed: false,
        },
      ]);

      setPhase("committed");
      setProgressMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Commit failed");
      setPhase("input");
      setProgressMessage("");
    }
  }, [bidAmount, bidAmountInt]);

  const handleRevealBid = useCallback(async () => {
    if (!myCommitment || !mySalt) return;

    try {
      setError("");
      setPhase("revealing");
      setProgressMessage("Preparing circuit inputs...");

      const commitment = await poseidonHashTwo(BigInt(bidAmountInt), mySalt);

      // Use a simple demo bidder address
      const bidderAddress = BigInt(
        "0x0000000000000000000000000000000000009999",
      );

      const circuitInput = {
        bidAmount: bidAmountInt.toString(),
        salt: mySalt.toString(),
        commitment: commitment.toString(),
        minBid: MIN_BID.toString(),
        maxBid: MAX_BID.toString(),
        bidderAddress: bidderAddress.toString(),
      };

      setProgressMessage("Generating ZK proof...");

      const result = await generateProof(
        circuitInput,
        "/circuits/sealed_bid.wasm",
        "/circuits/sealed_bid_final.zkey",
        (_progress, message) => {
          setProgressMessage(message);
        },
      );

      setProofResult(result);

      // Mark our bid as revealed
      setBids((prev) =>
        prev.map((b) =>
          b.address === "0xYou...9999"
            ? { ...b, revealed: true, amount: parseFloat(bidAmount) }
            : b,
        ),
      );

      setPhase("revealed");
      setProgressMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reveal failed");
      setPhase("committed");
      setProgressMessage("");
    }
  }, [myCommitment, mySalt, bidAmountInt, bidAmount]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;

    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/sealed_bid_verification_key.json",
        proofResult.publicSignals,
        proofResult.proof,
      );

      setVerificationResult(isValid);
      setPhase("verified");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setPhase("revealed");
    }
  }, [proofResult]);

  const handleAdvancePhase = useCallback(() => {
    if (auctionPhase === "bidding") {
      setAuctionPhase("reveal");
    } else if (auctionPhase === "reveal") {
      // Simulate other bidders revealing
      const updatedBids = bids.map((b) => {
        if (b.address === "0xYou...9999") return b;
        const simAmount = Math.floor(Math.random() * 80 + 10);
        return { ...b, revealed: true, amount: simAmount };
      });
      setBids(updatedBids);

      const allRevealed = updatedBids.filter((b) => b.revealed);
      const highest = allRevealed.reduce(
        (max, b) => ((b.amount ?? 0) > (max.amount ?? 0) ? b : max),
        allRevealed[0],
      );
      setWinner(highest);
      setAuctionPhase("finalized");
      setPhase("finalized");

      if (highest.address === "0xYou...9999") {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  }, [auctionPhase, bids]);

  const handleReset = useCallback(() => {
    setAuctionPhase("bidding");
    setBidAmount("50");
    setMySalt(null);
    setMyCommitment(null);
    setShowBid(false);
    setBids([
      {
        address: "0xAlice...1234",
        commitmentHex: "0x1a2b...3c4d",
        revealed: false,
      },
      {
        address: "0xBob...5678",
        commitmentHex: "0x5e6f...7a8b",
        revealed: false,
      },
    ]);
    setWinner(null);
    setPhase("input");
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
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <ProgressPipeline
              steps={pipelineSteps}
              currentStepIndex={getPipelineIndex(phase)}
              stepStatuses={getPipelineStatuses(phase)}
              showElapsedTime={phase === "revealing" || phase === "verifying"}
            />
          </div>

          {/* Phase Indicator */}
          <div className="flex justify-center gap-3">
            {(["bidding", "reveal", "finalized"] as const).map((p, i) => {
              const phaseIndex = [
                "bidding",
                "reveal",
                "finalized",
              ].indexOf(auctionPhase);
              return (
                <div key={p} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      auctionPhase === p
                        ? "bg-primary text-primary-foreground"
                        : phaseIndex > i
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`ml-1 text-sm ${auctionPhase === p ? "font-medium" : "text-muted-foreground"}`}
                  >
                    {p === "bidding"
                      ? "Bid"
                      : p === "reveal"
                        ? "Reveal"
                        : "Final"}
                  </span>
                  {i < 2 && (
                    <div className="w-6 h-0.5 mx-1 bg-muted" />
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Bidding Panel */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  <Gavel className="mr-1 inline h-4 w-4" />
                  Your Bid
                </p>
                {myCommitment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBid((s) => !s)}
                    aria-label={showBid ? "Hide bid" : "Show bid"}
                  >
                    {showBid ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Bidding Phase - Enter Bid */}
              <AnimatePresence mode="wait">
              {auctionPhase === "bidding" && !myCommitment && (
                <motion.div key="bid-input" {...phaseTransition} className="flex flex-col gap-3">
                  <div>
                    <Label htmlFor="bid-amount">Bid Amount (ETH)</Label>
                    <p className="text-xs text-muted-foreground mb-1">
                      Range: {MIN_BID / 100} – {MAX_BID / 100} ETH
                    </p>
                    <div className="flex gap-2">
                      <Input
                        id="bid-amount"
                        type="number"
                        step="0.01"
                        min={MIN_BID / 100}
                        max={MAX_BID / 100}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="0.00"
                      />
                      <span className="flex items-center text-sm text-muted-foreground">
                        ETH
                      </span>
                    </div>
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
                    onClick={handleCommitBid}
                    disabled={
                      !bidAmount ||
                      bidAmountInt < MIN_BID ||
                      bidAmountInt > MAX_BID
                    }
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Commit Sealed Bid
                  </Button>
                </motion.div>
              )}

              {/* Committed State */}
              {myCommitment && (
                <motion.div key="committed" {...phaseTransition} className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      Bid Committed
                    </Badge>
                  </div>
                  {showBid && (
                    <p className="text-lg font-bold">{bidAmount} ETH</p>
                  )}
                  <code className="text-xs font-mono text-muted-foreground">
                    {truncateHex(bigintToHex(myCommitment), 12)}
                  </code>
                </motion.div>
              )}

              {/* Reveal Phase */}
              {auctionPhase === "reveal" &&
                myCommitment &&
                !proofResult && (
                  <motion.div key="reveal" {...phaseTransition} className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground">
                      Reveal your bid with a ZK proof. The proof proves your
                      bid is within the valid range without revealing the exact
                      amount to other bidders until finalization.
                    </p>

                    {progressMessage && phase === "revealing" && (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {progressMessage}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleRevealBid}
                      disabled={phase === "revealing"}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Reveal with ZK Proof
                    </Button>
                  </motion.div>
                )}

              {/* Proof Generated */}
              {proofResult && auctionPhase !== "finalized" && (
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
                      Public Signals (
                      {proofResult.publicSignals.length}):
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
                          ? "Proof valid! The bid amount matches the commitment and is within the valid range."
                          : "Proof invalid. The bid does not match the commitment or is out of range."}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Winner Announcement */}
              {auctionPhase === "finalized" && winner && (
                <motion.div key="winner" {...phaseTransition}
                  className={`relative rounded-lg border p-4 ${
                    winner.address === "0xYou...9999"
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                      : "border-border bg-muted"
                  }`}
                >
                  {winner.address === "0xYou...9999" ? (
                    <ShineBorder shineColor={["#eab308", "#f59e0b"]} />
                  ) : (
                    <ShineBorder shineColor={["#6b7280", "#9ca3af"]} />
                  )}
                  <div className="flex items-center gap-2">
                    <Trophy
                      className={`h-5 w-5 ${winner.address === "0xYou...9999" ? "text-yellow-500" : "text-muted-foreground"}`}
                    />
                    <div>
                      <p className="text-sm font-bold">
                        {winner.address === "0xYou...9999"
                          ? "You won the auction!"
                          : `${winner.address} won the auction`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Winning bid: {winner.amount} ETH
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>

          {/* All Bids */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">All Bids</p>
              {auctionPhase !== "finalized" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAdvancePhase}
                  disabled={
                    auctionPhase === "bidding" && !myCommitment
                  }
                >
                  Next Phase
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {bids.map((bid, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-muted p-3"
                >
                  <div>
                    <p className="font-mono text-sm">{bid.address}</p>
                    <code className="text-xs text-muted-foreground">
                      {bid.commitmentHex}
                    </code>
                  </div>
                  {bid.revealed ? (
                    <Badge variant="default">{bid.amount} ETH</Badge>
                  ) : (
                    <Badge variant="secondary">Hidden</Badge>
                  )}
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
              title: "Bid: Submit a Sealed Commitment",
              description:
                "Bidders commit Poseidon(bidAmount, salt) during the bidding phase. The commitment hides the actual bid amount.",
              details: [
                "Each bidder generates a random salt for their commitment",
                "The commitment is stored on-chain during the bidding phase",
                "No one can determine the bid amount from the commitment",
              ],
            },
            {
              title: "Reveal: ZK Proof of Valid Bid",
              description:
                "During the reveal phase, bidders generate a ZK proof showing their bid matches the commitment AND is within the valid range (min/max).",
              details: [
                "The circuit verifies: Poseidon(bidAmount, salt) == commitment",
                "Range check: minBid <= bidAmount <= maxBid",
                "The bidder address is bound to prevent front-running",
                "Invalid bids (out of range) cannot generate a valid proof",
              ],
            },
            {
              title: "Finalize: Determine the Winner",
              description:
                "After all bids are revealed, the highest valid bid wins. Losing bid amounts can remain private (only validity was proven).",
              details: [
                "Only the winning bid amount needs to be publicly revealed",
                "Losers' exact amounts can stay hidden — only range validity is proven",
                "On-chain enforcement ensures no one can change bids after committing",
              ],
            },
          ]}
          whyItMatters="Sealed-bid auctions with ZK proofs enable fair price discovery without bid manipulation. Bidders cannot see others' bids before committing, and the ZK proof ensures all bids are valid — critical for procurement, NFT auctions, and fair pricing mechanisms."
          tips={[
            "The circuit has 4 public signals: commitment, minBid, maxBid, bidderAddress",
            "Range checks use GreaterEqThan and LessEqThan comparators (64-bit)",
            "Bid amounts are integers (multiply ETH by 100 to avoid decimals)",
            "The bidder address binding prevents MEV/front-running attacks",
          ]}
          defaultExpanded
        />
      </TabsContent>

      {proofResult && (
        <TabsContent value="on-chain" className="mt-4">
          <OnChainVerify
            proofResult={proofResult}
            verifierAbi={sealedAuctionVerifierAbi}
            defaultAddress={ZK_CONTRACTS.sealedAuctionVerifier}
            circuitName="Sealed Auction"
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
