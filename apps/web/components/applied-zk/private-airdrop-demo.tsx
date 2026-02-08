"use client";

import { useState, useCallback, useRef } from "react";
import {
  Stack,
  TextInput,
  Button,
  Alert,
  Code,
  Text,
  Group,
  Badge,
  Paper,
  Tabs,
  CopyButton,
  ActionIcon,
  Tooltip,
  Table,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconParachute,
  IconCopy,
  IconLoader2,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProgressPipeline, EducationPanel } from "../shared";
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
  const nextIdRef = useRef(DEFAULT_ADDRESSES.length + 1);

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
    nextIdRef.current = DEFAULT_ADDRESSES.length + 1;
  }, []);

  return (
    <Tabs defaultValue="demo">
      <Tabs.List>
        <Tabs.Tab value="demo">Demo</Tabs.Tab>
        <Tabs.Tab value="learn">Learn</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="demo" pt="md">
        <Stack gap="md">
          <Group justify="space-between">
            <ConnectButton />
            <Button variant="subtle" size="xs" onClick={handleReset}>
              Reset
            </Button>
          </Group>

          <Paper p="sm" withBorder>
            <ProgressPipeline
              steps={pipelineSteps}
              currentStepIndex={getPipelineIndex(phase)}
              stepStatuses={getPipelineStatuses(phase)}
              showElapsedTime={phase === "proving" || phase === "verifying"}
            />
          </Paper>

          {error && (
            <Alert
              color="red"
              icon={<IconX size={16} />}
              withCloseButton
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text fw={600} size="sm">
                Step 1: Eligible Addresses
              </Text>
              <Text size="xs" c="dimmed">
                These addresses are eligible for the airdrop. In production,
                this list would be compiled off-chain (e.g., early users, token
                holders at a snapshot).
              </Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>Address</Table.Th>
                    {addresses.some((a) => a.commitment) && (
                      <Table.Th>Commitment</Table.Th>
                    )}
                    {phase === "setup" && <Table.Th></Table.Th>}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {addresses.map((addr, idx) => (
                    <Table.Tr key={addr.id}>
                      <Table.Td>
                        <Badge
                          color={
                            idx === claimIndex && phase !== "setup"
                              ? "blue"
                              : "gray"
                          }
                          variant="light"
                          size="sm"
                        >
                          {idx + 1}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Code>{truncateHex(addr.address, 8)}</Code>
                      </Table.Td>
                      {addresses.some((a) => a.commitment) && (
                        <Table.Td>
                          {addr.commitment ? (
                            <Code>{truncateHex(addr.commitment, 6)}</Code>
                          ) : (
                            <Text size="xs" c="dimmed">
                              pending
                            </Text>
                          )}
                        </Table.Td>
                      )}
                      {phase === "setup" && (
                        <Table.Td>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="xs"
                            onClick={() => removeAddress(addr.id)}
                            disabled={addresses.length <= 2}
                          >
                            <IconTrash size={12} />
                          </ActionIcon>
                        </Table.Td>
                      )}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              {phase === "setup" && (
                <Group gap="xs">
                  <TextInput
                    placeholder="0x... (Ethereum address)"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.currentTarget.value)}
                    style={{ flex: 1 }}
                    size="xs"
                  />
                  <ActionIcon
                    variant="light"
                    onClick={addAddress}
                    disabled={!newAddress.trim()}
                  >
                    <IconPlus size={14} />
                  </ActionIcon>
                </Group>
              )}
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text fw={600} size="sm">
                Step 2: Build Eligibility Tree
              </Text>
              <Text size="xs" c="dimmed">
                Hash each address with Poseidon and insert into a Merkle tree.
                Only the Merkle root is published on-chain.
              </Text>
              {progressMessage && phase === "building" && (
                <Group gap="xs">
                  <IconLoader2 size={14} className="animate-spin" />
                  <Text size="xs" c="blue">
                    {progressMessage}
                  </Text>
                </Group>
              )}
              <Button
                onClick={handleBuildTree}
                loading={phase === "building"}
                disabled={phase !== "setup" || addresses.length < 2}
                leftSection={<IconParachute size={16} />}
              >
                Build Merkle Tree
              </Button>
            </Stack>
          </Paper>

          {merkleRoot && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Merkle Root (On-chain)
                </Text>
                <Group gap="xs">
                  <Code block style={{ flex: 1 }}>
                    {truncateHex(merkleRoot, 16)}
                  </Code>
                  <CopyButton value={merkleRoot}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "Copied" : "Copy"}>
                        <ActionIcon variant="subtle" onClick={copy}>
                          {copied ? (
                            <IconCheck size={16} />
                          ) : (
                            <IconCopy size={16} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Stack>
            </Paper>
          )}

          {phase === "ready" ||
          phase === "proving" ||
          phase === "proved" ||
          phase === "verifying" ||
          phase === "verified" ? (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Step 3: Claim Airdrop Privately
                </Text>
                <Text size="xs" c="dimmed">
                  Prove you are in the eligibility list without revealing which
                  address is yours. Select which address to claim as:
                </Text>
                <Group gap="xs" wrap="wrap">
                  {addresses.map((addr, idx) => (
                    <Button
                      key={addr.id}
                      variant={idx === claimIndex ? "filled" : "outline"}
                      size="xs"
                      onClick={() => setClaimIndex(idx)}
                      disabled={phase !== "ready"}
                    >
                      Address {idx + 1}
                    </Button>
                  ))}
                </Group>
                {progressMessage && phase === "proving" && (
                  <Group gap="xs">
                    <IconLoader2 size={14} className="animate-spin" />
                    <Text size="xs" c="blue">
                      {progressMessage}
                    </Text>
                  </Group>
                )}
                <Button
                  onClick={handleClaim}
                  loading={phase === "proving"}
                  disabled={phase !== "ready"}
                >
                  Generate Claim Proof
                </Button>
              </Stack>
            </Paper>
          ) : null}

          {nullifierHash && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Nullifier (Anti-Double-Claim)
                </Text>
                <Text size="xs" c="dimmed">
                  Derived from the address and airdrop ID. Prevents the same
                  address from claiming twice without revealing which address
                  claimed.
                </Text>
                <Code block>{truncateHex(nullifierHash, 16)}</Code>
              </Stack>
            </Paper>
          )}

          {proofResult && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    Claim Proof
                  </Text>
                  <Badge color="green" variant="light">
                    Generated
                  </Badge>
                </Group>
                <Code block>
                  {`pi_a: [${proofResult.proof.pi_a
                    .slice(0, 2)
                    .map((v) => truncateHex(v, 8))
                    .join(", ")}]\n`}
                  {`public signals: ${proofResult.publicSignals.length} values\n`}
                  {`nullifier + root = public, address = private`}
                </Code>
              </Stack>
            </Paper>
          )}

          {proofResult && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Step 4: Verify & Claim
                </Text>
                <Button
                  onClick={handleVerifyProof}
                  loading={phase === "verifying"}
                  disabled={phase === "verifying"}
                  color={
                    verificationResult === true
                      ? "green"
                      : verificationResult === false
                        ? "red"
                        : "blue"
                  }
                >
                  {verificationResult === null
                    ? "Verify Claim Proof"
                    : verificationResult
                      ? "Claim Verified"
                      : "Verification Failed"}
                </Button>
                {verificationResult !== null && (
                  <Alert
                    color={verificationResult ? "green" : "red"}
                    icon={
                      verificationResult ? (
                        <IconCheck size={16} />
                      ) : (
                        <IconX size={16} />
                      )
                    }
                  >
                    {verificationResult
                      ? "Claim verified! The claimer proved eligibility without revealing their address. The nullifier prevents double-claiming."
                      : "Claim verification failed. The proof is invalid."}
                  </Alert>
                )}
              </Stack>
            </Paper>
          )}
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="learn" pt="md">
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
      </Tabs.Panel>
    </Tabs>
  );
}
