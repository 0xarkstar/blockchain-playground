"use client";

import { useState, useCallback } from "react";
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
  SegmentedControl,
  CopyButton,
  ActionIcon,
  Tooltip,
  Table,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconThumbUp,
  IconCopy,
  IconLoader2,
} from "@tabler/icons-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProgressPipeline, EducationPanel } from "../shared";
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

interface VoterRegistration {
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

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

const PROPOSAL_ID = 1n;

export function SecretVotingDemo() {
  const [phase, setPhase] = useState<DemoPhase>("setup");
  const [voter, setVoter] = useState<VoterRegistration | null>(null);
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
                Step 1: Register as Voter
              </Text>
              <Text size="xs" c="dimmed">
                Generate a secret identity and register your commitment in the
                voter registry (Merkle tree). Three simulated voters are also
                registered.
              </Text>
              <Button
                onClick={handleRegister}
                loading={phase === "registering"}
                disabled={phase !== "setup"}
                leftSection={<IconThumbUp size={16} />}
              >
                Register Identity
              </Button>
            </Stack>
          </Paper>

          {voter && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Voter Registry
                </Text>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Voter</Table.Th>
                      <Table.Th>Identity Commitment</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>
                        <Badge color="blue" variant="light">
                          You
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Code>{truncateHex(voter.commitmentHex, 8)}</Code>
                          <CopyButton value={voter.commitmentHex}>
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? "Copied" : "Copy"}>
                                <ActionIcon
                                  variant="subtle"
                                  size="xs"
                                  onClick={copy}
                                >
                                  {copied ? (
                                    <IconCheck size={12} />
                                  ) : (
                                    <IconCopy size={12} />
                                  )}
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                    {otherVoters.map((hex, i) => (
                      <Table.Tr key={`voter-${i}`}>
                        <Table.Td>
                          <Badge color="gray" variant="light">
                            Voter {i + 2}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Code>{hex}</Code>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          )}

          {voter && phase !== "setup" && phase !== "registering" && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Step 2: Cast Your Vote
                </Text>
                <Text size="xs" c="dimmed">
                  Your vote is private: the ZK proof shows you are a registered
                  voter and your vote is valid, without revealing which voter
                  you are.
                </Text>
                <TextInput
                  label="Proposal"
                  value="Should the DAO fund the ZK education initiative?"
                  readOnly
                />
                <Text size="sm" fw={500}>
                  Your Vote:
                </Text>
                <SegmentedControl
                  value={voteChoice}
                  onChange={(val) => setVoteChoice(val as VoteChoice)}
                  data={[
                    { label: "Yes", value: "yes" },
                    { label: "No", value: "no" },
                  ]}
                  disabled={phase !== "registered"}
                />
                {progressMessage && (
                  <Group gap="xs">
                    <IconLoader2 size={14} className="animate-spin" />
                    <Text size="xs" c="blue">
                      {progressMessage}
                    </Text>
                  </Group>
                )}
                <Button
                  onClick={handleVoteAndProve}
                  loading={phase === "proving"}
                  disabled={phase !== "registered"}
                >
                  Vote & Generate ZK Proof
                </Button>
              </Stack>
            </Paper>
          )}

          {nullifierHash && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Nullifier (Anti-Double-Vote)
                </Text>
                <Text size="xs" c="dimmed">
                  The nullifier is derived from your secret and the proposal ID.
                  If submitted twice, it will be detected and rejected. It does
                  not reveal your identity.
                </Text>
                <Group gap="xs">
                  <Badge color="orange" variant="light">
                    Unique per proposal
                  </Badge>
                </Group>
                <Code block>{truncateHex(nullifierHash, 16)}</Code>
              </Stack>
            </Paper>
          )}

          {merkleRoot && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Merkle Root (Voter Registry)
                </Text>
                <Code block>{truncateHex(merkleRoot, 16)}</Code>
              </Stack>
            </Paper>
          )}

          {proofResult && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    Vote Proof
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
                  {`public signals: ${proofResult.publicSignals.length} values`}
                </Code>
              </Stack>
            </Paper>
          )}

          {proofResult && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Step 3: Verify Vote
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
                    ? "Verify Vote Proof"
                    : verificationResult
                      ? "Vote Verified"
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
                      ? "Vote is valid! The voter is registered, the vote is legitimate, and the nullifier prevents double-voting."
                      : "Vote verification failed. The proof is invalid."}
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
      </Tabs.Panel>
    </Tabs>
  );
}
