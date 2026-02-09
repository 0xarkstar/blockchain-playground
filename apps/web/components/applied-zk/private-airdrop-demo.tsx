"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProgressPipeline, EducationPanel } from "../shared";
import { ShineBorder } from "../ui/shine-border";
import { AirdropSetupPanel } from "./airdrop-setup-panel";
import { ClaimPanel } from "./claim-panel";
import { MerkleTreeView } from "./merkle-tree-view";
import {
  generateProof,
  verifyProof,
  type ProofGenerationResult,
} from "../../lib/applied-zk/snarkjs";
import {
  poseidonHashSingle,
  generateNullifier,
  bigintToHex,
  hexToBigint,
} from "../../lib/applied-zk/poseidon";
import {
  MerkleTree,
  formatMerkleProofForCircuit,
} from "../../lib/applied-zk/merkle";
import { OnChainVerify } from "./on-chain-verify";
import { merkleAirdropVerifierAbi } from "../../lib/applied-zk/abis";
import { ZK_CONTRACTS } from "../../lib/applied-zk/contracts";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type DemoPhase =
  | "setup"
  | "building"
  | "ready"
  | "proving"
  | "proved"
  | "verifying"
  | "verified";

interface EligibleAddress {
  readonly id: number;
  readonly address: string;
  readonly commitment: string;
}

const pipelineSteps = [
  { id: "eligibility", label: "Eligibility List" },
  { id: "tree", label: "Build Tree" },
  { id: "prove", label: "Prove Inclusion" },
  { id: "verify", label: "Verify & Claim" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "setup":
      return 0;
    case "building":
      return 1;
    case "ready":
      return 2;
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
  if (phase === "building") {
    statuses["eligibility"] = "complete";
    statuses["tree"] = "active";
  } else if (phase === "ready") {
    statuses["eligibility"] = "complete";
    statuses["tree"] = "complete";
  } else if (phase === "proving") {
    statuses["eligibility"] = "complete";
    statuses["tree"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "proved") {
    statuses["eligibility"] = "complete";
    statuses["tree"] = "complete";
    statuses["prove"] = "complete";
  } else if (phase === "verifying") {
    statuses["eligibility"] = "complete";
    statuses["tree"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "active";
  } else if (phase === "verified") {
    statuses["eligibility"] = "complete";
    statuses["tree"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "complete";
  }
  return statuses;
}

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

const DEFAULT_ADDRESSES = [
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
  "0x1234567890abcdef1234567890abcdef12345678",
];

const AIRDROP_ID = 42n;

export function PrivateAirdropDemo() {
  const [phase, setPhase] = useState<DemoPhase>("setup");
  const [addresses, setAddresses] = useState<readonly EligibleAddress[]>(() =>
    DEFAULT_ADDRESSES.map((addr, i) => ({
      id: i + 1,
      address: addr,
      commitment: "",
    })),
  );
  const [newAddress, setNewAddress] = useState("");
  const [claimIndex, setClaimIndex] = useState(0);
  const [merkleRoot, setMerkleRoot] = useState("");
  const [nullifierHash, setNullifierHash] = useState("");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [proofExpanded, setProofExpanded] = useState(false);
  const nextIdRef = useRef(DEFAULT_ADDRESSES.length + 1);
  const confettiFiredRef = useRef(false);

  const addAddress = useCallback(() => {
    if (!newAddress.trim()) return;
    const id = nextIdRef.current;
    nextIdRef.current = id + 1;
    setAddresses((prev) => [
      ...prev,
      { id, address: newAddress.trim(), commitment: "" },
    ]);
    setNewAddress("");
  }, [newAddress]);

  const removeAddress = useCallback((idToRemove: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== idToRemove));
  }, []);

  const handleBuildTree = useCallback(async () => {
    try {
      setError("");
      setPhase("building");
      setProgressMessage("Computing address commitments...");

      const commitments: EligibleAddress[] = [];
      for (const addr of addresses) {
        const addrBigint = hexToBigint(addr.address);
        const commitment = await poseidonHashSingle(addrBigint);
        commitments.push({
          ...addr,
          commitment: bigintToHex(commitment),
        });
      }

      setAddresses(commitments);
      setProgressMessage("Building Merkle tree...");

      const leaves = await Promise.all(
        addresses.map((addr) => {
          const addrBigint = hexToBigint(addr.address);
          return poseidonHashSingle(addrBigint);
        }),
      );

      const tree = await MerkleTree.fromLeaves(4, leaves);
      setMerkleRoot(bigintToHex(tree.getRoot()));

      setPhase("ready");
      setProgressMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to build Merkle tree",
      );
      setPhase("setup");
      setProgressMessage("");
    }
  }, [addresses]);

  const handleClaim = useCallback(async () => {
    if (addresses.length === 0) return;

    try {
      setError("");
      setPhase("proving");
      setProgressMessage("Generating inclusion proof...");

      const leaves = await Promise.all(
        addresses.map((addr) => {
          const addrBigint = hexToBigint(addr.address);
          return poseidonHashSingle(addrBigint);
        }),
      );

      const tree = await MerkleTree.fromLeaves(4, leaves);
      const proof = await tree.getProof(claimIndex);
      const formattedProof = formatMerkleProofForCircuit(proof);

      setProgressMessage("Computing nullifier...");
      const claimAddress = hexToBigint(addresses[claimIndex].address);
      const nullifier = await generateNullifier(claimAddress, AIRDROP_ID);
      setNullifierHash(bigintToHex(nullifier));

      setProgressMessage("Generating ZK proof...");

      const circuitInput = {
        address: claimAddress.toString(),
        pathElements: formattedProof.pathElements,
        pathIndices: formattedProof.pathIndices,
        airdropId: AIRDROP_ID.toString(),
      };

      const result = await generateProof(
        circuitInput,
        "/circuits/private_airdrop.wasm",
        "/circuits/private_airdrop_final.zkey",
        (_progress, message) => {
          setProgressMessage(message);
        },
      );

      setProofResult(result);
      setPhase("proved");
      setProgressMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Claim proof generation failed",
      );
      setPhase("ready");
      setProgressMessage("");
    }
  }, [addresses, claimIndex]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;

    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/private_airdrop_verification_key.json",
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
    setPhase("setup");
    setAddresses(
      DEFAULT_ADDRESSES.map((addr, i) => ({
        id: i + 1,
        address: addr,
        commitment: "",
      })),
    );
    setNewAddress("");
    setClaimIndex(0);
    setMerkleRoot("");
    setNullifierHash("");
    setProofResult(null);
    setVerificationResult(null);
    setError("");
    setProgressMessage("");
    setProofExpanded(false);
    nextIdRef.current = DEFAULT_ADDRESSES.length + 1;
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
              <AirdropSetupPanel
                addresses={addresses}
                newAddress={newAddress}
                claimIndex={claimIndex}
                phase={phase}
                onAddAddress={addAddress}
                onRemoveAddress={removeAddress}
                onNewAddressChange={setNewAddress}
                onBuildTree={handleBuildTree}
                progressMessage={progressMessage}
              />

              <MerkleTreeView
                merkleRoot={merkleRoot}
                nullifierHash={nullifierHash}
              />

              <ClaimPanel
                addresses={addresses}
                claimIndex={claimIndex}
                phase={phase}
                progressMessage={progressMessage}
                onClaimIndexChange={setClaimIndex}
                onClaim={handleClaim}
              />

              {proofResult && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        Claim Proof
                      </p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Generated
                      </Badge>
                    </div>
                    <button
                      onClick={() => setProofExpanded(!proofExpanded)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {proofExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {proofExpanded ? "Hide" : "Show"} proof data
                    </button>
                    {proofExpanded && (
                      <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono max-h-32">
                        <code>
                          {`pi_a: [${proofResult.proof.pi_a
                            .slice(0, 2)
                            .map((v) => truncateHex(v, 8))
                            .join(", ")}]\n`}
                          {`public signals: ${proofResult.publicSignals.length} values\n`}
                          {`nullifier + root = public, address = private`}
                        </code>
                      </pre>
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
                      Step 4: Verify & Claim
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
                        ? "Verify Claim Proof"
                        : verificationResult
                          ? "Claim Verified"
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
                            ? "Claim verified! The claimer proved eligibility without revealing their address. The nullifier prevents double-claiming."
                            : "Claim verification failed. The proof is invalid."}
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
              title: "Build Eligibility Tree",
              description:
                "Each eligible address is hashed with Poseidon and inserted as a leaf in a Merkle tree. Only the Merkle root is published on-chain.",
              details: [
                "The full list of eligible addresses can be kept off-chain",
                "The root commitment is enough to verify any individual claim",
              ],
            },
            {
              title: "Generate Claim Proof",
              description:
                "To claim, a user generates a ZK proof showing their address is a leaf in the Merkle tree, without revealing which leaf.",
              details: [
                "The proof uses the Merkle path (sibling hashes) as private inputs",
                "A nullifier derived from the address prevents double-claiming",
              ],
            },
            {
              title: "Verify & Distribute",
              description:
                "The smart contract verifies the proof and checks the nullifier has not been used before. If valid, tokens are sent to a specified recipient address.",
              details: [
                "The recipient address can be different from the eligible address for extra privacy",
                "The contract stores used nullifiers to prevent double-claims",
              ],
            },
          ]}
          whyItMatters="Traditional airdrops require claiming with your eligible address, linking on-chain activity to your claim. Private airdrops using ZK proofs let eligible users claim without revealing which address is theirs, preventing front-running, address correlation, and unwanted attention."
          tips={[
            "This pattern is used by protocols like StealthDrop and ZKDrop",
            "The Merkle tree can support millions of eligible addresses efficiently",
            "Users can claim to a fresh address, completely unlinking their eligible and receiving addresses",
            "The nullifier system is the same pattern used in Tornado Cash for preventing double-spends",
          ]}
          defaultExpanded
        />
      </TabsContent>

      {proofResult && (
        <TabsContent value="on-chain" className="mt-4">
          <OnChainVerify
            proofResult={proofResult}
            verifierAbi={merkleAirdropVerifierAbi}
            defaultAddress={ZK_CONTRACTS.merkleAirdropVerifier}
            circuitName="Private Airdrop"
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
