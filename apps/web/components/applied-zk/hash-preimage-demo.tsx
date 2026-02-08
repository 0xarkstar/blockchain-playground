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
  CopyButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconHash,
  IconCopy,
  IconLoader2,
} from "@tabler/icons-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProgressPipeline } from "../shared";
import { EducationPanel } from "../shared";
import {
  generateProof,
  verifyProof,
  type ProofGenerationResult,
} from "../../lib/applied-zk/snarkjs";
import { poseidonHashSingle, bigintToHex } from "../../lib/applied-zk/poseidon";

type DemoPhase =
  | "input"
  | "hashing"
  | "proving"
  | "proved"
  | "verifying"
  | "verified";

const pipelineSteps = [
  { id: "input", label: "Input Secret" },
  { id: "hash", label: "Hash" },
  { id: "prove", label: "Generate Proof" },
  { id: "verify", label: "Verify" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "input":
      return 0;
    case "hashing":
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
  if (phase === "hashing") {
    statuses["input"] = "complete";
    statuses["hash"] = "active";
  } else if (phase === "proving") {
    statuses["input"] = "complete";
    statuses["hash"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "proved") {
    statuses["input"] = "complete";
    statuses["hash"] = "complete";
    statuses["prove"] = "complete";
  } else if (phase === "verifying") {
    statuses["input"] = "complete";
    statuses["hash"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "active";
  } else if (phase === "verified") {
    statuses["input"] = "complete";
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

export function HashPreimageDemo() {
  const [secretInput, setSecretInput] = useState("42");
  const [phase, setPhase] = useState<DemoPhase>("input");
  const [poseidonHash, setPoseidonHash] = useState("");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  const handleHash = useCallback(async () => {
    try {
      setError("");
      setPhase("hashing");
      const secretBigint = BigInt(secretInput);
      const hash = await poseidonHashSingle(secretBigint);
      setPoseidonHash(bigintToHex(hash));
      setPhase("proving");
      setProofResult(null);
      setVerificationResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compute hash");
      setPhase("input");
    }
  }, [secretInput]);

  const handleGenerateProof = useCallback(async () => {
    try {
      setError("");
      setPhase("proving");
      setProgressMessage("Starting proof generation...");

      const secretBigint = BigInt(secretInput);
      const input = { secret: secretBigint.toString() };

      const result = await generateProof(
        input,
        "/circuits/hash_preimage.wasm",
        "/circuits/hash_preimage_final.zkey",
        (_progress, message) => {
          setProgressMessage(message);
        },
      );

      setProofResult(result);
      setPhase("proved");
      setProgressMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proof generation failed");
      setPhase("input");
      setProgressMessage("");
    }
  }, [secretInput]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;

    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/hash_preimage_verification_key.json",
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
    setPhase("input");
    setPoseidonHash("");
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
                Step 1: Enter Secret
              </Text>
              <TextInput
                label="Secret number"
                description="The value you want to prove knowledge of without revealing it"
                value={secretInput}
                onChange={(e) => setSecretInput(e.currentTarget.value)}
                placeholder="Enter a number"
                disabled={phase !== "input"}
              />
              <Button
                onClick={handleHash}
                disabled={phase !== "input" || !secretInput}
                leftSection={<IconHash size={16} />}
              >
                Compute Poseidon Hash
              </Button>
            </Stack>
          </Paper>

          {poseidonHash && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Step 2: Poseidon Hash (Public)
                </Text>
                <Group gap="xs">
                  <Badge color="blue" variant="light">
                    Public Output
                  </Badge>
                  <Text size="xs" c="dimmed">
                    This hash is shared publicly. The secret remains private.
                  </Text>
                </Group>
                <Group gap="xs">
                  <Code block style={{ flex: 1 }}>
                    {truncateHex(poseidonHash, 16)}
                  </Code>
                  <CopyButton value={poseidonHash}>
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

          {poseidonHash && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Step 3: Generate ZK Proof
                </Text>
                <Text size="xs" c="dimmed">
                  Generate a Groth16 proof that you know the preimage of the
                  hash, without revealing the secret.
                </Text>
                {progressMessage && (
                  <Group gap="xs">
                    <IconLoader2 size={14} className="animate-spin" />
                    <Text size="xs" c="blue">
                      {progressMessage}
                    </Text>
                  </Group>
                )}
                <Button
                  onClick={handleGenerateProof}
                  loading={phase === "proving"}
                  disabled={
                    phase !== "proving" &&
                    phase !== "proved" &&
                    phase !== "verified"
                  }
                >
                  Generate Proof
                </Button>
              </Stack>
            </Paper>
          )}

          {proofResult && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    Proof Data
                  </Text>
                  <Badge color="green" variant="light">
                    Generated
                  </Badge>
                </Group>
                <Stack gap="xs">
                  <Text size="xs" fw={500}>
                    pi_a (2 elements):
                  </Text>
                  <Code block>
                    {proofResult.proof.pi_a
                      .slice(0, 2)
                      .map((v) => truncateHex(v, 12))
                      .join("\n")}
                  </Code>
                  <Text size="xs" fw={500}>
                    pi_b (2x2 elements):
                  </Text>
                  <Code block>
                    {proofResult.proof.pi_b
                      .slice(0, 2)
                      .map(
                        (row) =>
                          `[${row.map((v) => truncateHex(v, 8)).join(", ")}]`,
                      )
                      .join("\n")}
                  </Code>
                  <Text size="xs" fw={500}>
                    pi_c (2 elements):
                  </Text>
                  <Code block>
                    {proofResult.proof.pi_c
                      .slice(0, 2)
                      .map((v) => truncateHex(v, 12))
                      .join("\n")}
                  </Code>
                  <Text size="xs" fw={500}>
                    Public Signals:
                  </Text>
                  <Code block>
                    {proofResult.publicSignals
                      .map((s) => truncateHex(s, 16))
                      .join("\n")}
                  </Code>
                </Stack>
              </Stack>
            </Paper>
          )}

          {proofResult && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Step 4: Verify Proof
                </Text>
                <Text size="xs" c="dimmed">
                  Verify the proof using the verification key. No secret
                  knowledge needed.
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
                    ? "Verify Proof"
                    : verificationResult
                      ? "Proof Valid"
                      : "Proof Invalid"}
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
                      ? "The proof is valid! The prover knows the secret preimage without revealing it."
                      : "The proof is invalid. The prover does not know the correct preimage."}
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
              title: "Hash the Secret",
              description:
                "The prover computes a Poseidon hash of their secret number. This hash is shared publicly as a commitment.",
              details: [
                "Poseidon is a ZK-friendly hash function optimized for use inside arithmetic circuits",
                "The hash output becomes the public input to the ZK circuit",
              ],
            },
            {
              title: "Generate a Groth16 Proof",
              description:
                "Using snarkjs, the prover generates a zero-knowledge proof that they know a value that hashes to the public hash.",
              details: [
                "The circuit checks: Poseidon(secret) == publicHash",
                "The proof reveals nothing about the secret itself",
                "Proof generation requires the circuit WASM and proving key (zkey)",
              ],
            },
            {
              title: "Verify the Proof",
              description:
                "Anyone can verify the proof using only the verification key and public signals, without knowing the secret.",
              details: [
                "Verification is fast and can be done on-chain in a Solidity smart contract",
                "The verification key is derived during the trusted setup ceremony",
              ],
            },
          ]}
          whyItMatters="Hash preimage proofs are the building block of many ZK applications: anonymous authentication, private voting eligibility, and confidential transaction systems. By proving knowledge of a preimage without revealing it, you can authenticate without exposing credentials."
          tips={[
            "Poseidon hash is preferred over SHA-256 in ZK circuits because it requires far fewer constraints",
            "The trusted setup (powers of tau + circuit-specific) is done once per circuit",
            "Proof generation is computationally expensive but verification is very fast",
            "Public signals are visible to everyone; private inputs (the secret) are not",
          ]}
          defaultExpanded
        />
      </Tabs.Panel>
    </Tabs>
  );
}
