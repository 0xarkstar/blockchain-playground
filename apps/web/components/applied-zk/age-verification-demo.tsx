"use client";

import { useState, useCallback } from "react";
import {
  Stack,
  NumberInput,
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
  IconShieldCheck,
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
import { poseidonHash, bigintToHex } from "../../lib/applied-zk/poseidon";

type DemoPhase =
  | "input"
  | "computing"
  | "proving"
  | "proved"
  | "verifying"
  | "verified";

const pipelineSteps = [
  { id: "input", label: "Enter Birthday" },
  { id: "commit", label: "Identity Commit" },
  { id: "prove", label: "Prove Age" },
  { id: "verify", label: "Verify" },
];

function getPipelineIndex(phase: DemoPhase): number {
  switch (phase) {
    case "input":
      return 0;
    case "computing":
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
  if (phase === "computing") {
    statuses["input"] = "complete";
    statuses["commit"] = "active";
  } else if (phase === "proving") {
    statuses["input"] = "complete";
    statuses["commit"] = "complete";
    statuses["prove"] = "active";
  } else if (phase === "proved") {
    statuses["input"] = "complete";
    statuses["commit"] = "complete";
    statuses["prove"] = "complete";
  } else if (phase === "verifying") {
    statuses["input"] = "complete";
    statuses["commit"] = "complete";
    statuses["prove"] = "complete";
    statuses["verify"] = "active";
  } else if (phase === "verified") {
    statuses["input"] = "complete";
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

export function AgeVerificationDemo() {
  const [birthYear, setBirthYear] = useState<number | "">(1990);
  const [birthMonth, setBirthMonth] = useState<number | "">(6);
  const [birthDay, setBirthDay] = useState<number | "">(15);
  const [minAge, setMinAge] = useState<number | "">(18);
  const [phase, setPhase] = useState<DemoPhase>("input");
  const [identityCommitment, setIdentityCommitment] = useState("");
  const [proofResult, setProofResult] = useState<ProofGenerationResult | null>(
    null,
  );
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  const computeCommitment = useCallback(async () => {
    try {
      setError("");
      setPhase("computing");

      const year = typeof birthYear === "number" ? birthYear : 0;
      const month = typeof birthMonth === "number" ? birthMonth : 0;
      const day = typeof birthDay === "number" ? birthDay : 0;

      const commitment = await poseidonHash([
        BigInt(year),
        BigInt(month),
        BigInt(day),
      ]);
      setIdentityCommitment(bigintToHex(commitment));
      setPhase("proving");
      setProofResult(null);
      setVerificationResult(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to compute commitment",
      );
      setPhase("input");
    }
  }, [birthYear, birthMonth, birthDay]);

  const handleGenerateProof = useCallback(async () => {
    try {
      setError("");
      setPhase("proving");
      setProgressMessage("Starting proof generation...");

      const year = typeof birthYear === "number" ? birthYear : 0;
      const month = typeof birthMonth === "number" ? birthMonth : 0;
      const day = typeof birthDay === "number" ? birthDay : 0;
      const threshold = typeof minAge === "number" ? minAge : 18;

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();

      const input = {
        birthYear: year.toString(),
        birthMonth: month.toString(),
        birthDay: day.toString(),
        currentYear: currentYear.toString(),
        currentMonth: currentMonth.toString(),
        currentDay: currentDay.toString(),
        minAge: threshold.toString(),
      };

      const result = await generateProof(
        input,
        "/circuits/age_verification.wasm",
        "/circuits/age_verification_final.zkey",
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
  }, [birthYear, birthMonth, birthDay, minAge]);

  const handleVerifyProof = useCallback(async () => {
    if (!proofResult) return;

    try {
      setError("");
      setPhase("verifying");

      const isValid = await verifyProof(
        "/circuits/age_verification_verification_key.json",
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
    setIdentityCommitment("");
    setProofResult(null);
    setVerificationResult(null);
    setError("");
    setProgressMessage("");
  }, []);

  const isInputValid =
    typeof birthYear === "number" &&
    typeof birthMonth === "number" &&
    typeof birthDay === "number" &&
    typeof minAge === "number" &&
    birthYear > 1900 &&
    birthYear <= new Date().getFullYear() &&
    birthMonth >= 1 &&
    birthMonth <= 12 &&
    birthDay >= 1 &&
    birthDay <= 31 &&
    minAge > 0;

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
                Step 1: Enter Birthday (Private)
              </Text>
              <Text size="xs" c="dimmed">
                Your birthday is the private input. It will never be revealed to
                the verifier.
              </Text>
              <Group grow>
                <NumberInput
                  label="Birth Year"
                  value={birthYear}
                  onChange={(val) =>
                    setBirthYear(typeof val === "number" ? val : "")
                  }
                  min={1900}
                  max={new Date().getFullYear()}
                  disabled={phase !== "input"}
                />
                <NumberInput
                  label="Birth Month"
                  value={birthMonth}
                  onChange={(val) =>
                    setBirthMonth(typeof val === "number" ? val : "")
                  }
                  min={1}
                  max={12}
                  disabled={phase !== "input"}
                />
                <NumberInput
                  label="Birth Day"
                  value={birthDay}
                  onChange={(val) =>
                    setBirthDay(typeof val === "number" ? val : "")
                  }
                  min={1}
                  max={31}
                  disabled={phase !== "input"}
                />
              </Group>
              <NumberInput
                label="Minimum Age Threshold"
                description="The age requirement to prove (e.g., 18 for adult content, 21 for alcohol)"
                value={minAge}
                onChange={(val) =>
                  setMinAge(typeof val === "number" ? val : "")
                }
                min={1}
                max={150}
                disabled={phase !== "input"}
              />
              <Button
                onClick={computeCommitment}
                disabled={phase !== "input" || !isInputValid}
                leftSection={<IconShieldCheck size={16} />}
              >
                Compute Identity Commitment
              </Button>
            </Stack>
          </Paper>

          {identityCommitment && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Step 2: Identity Commitment (Public)
                </Text>
                <Group gap="xs">
                  <Badge color="blue" variant="light">
                    Public
                  </Badge>
                  <Text size="xs" c="dimmed">
                    Poseidon hash of (year, month, day). Hides actual birthday.
                  </Text>
                </Group>
                <Group gap="xs">
                  <Code block style={{ flex: 1 }}>
                    {truncateHex(identityCommitment, 16)}
                  </Code>
                  <CopyButton value={identityCommitment}>
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

          {identityCommitment && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text fw={600} size="sm">
                  Step 3: Generate Age Proof
                </Text>
                <Text size="xs" c="dimmed">
                  Prove that your age meets the threshold without revealing your
                  exact birthday.
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
                  Prove Age &ge; {typeof minAge === "number" ? minAge : 18}
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
                <Text size="xs" c="dimmed">
                  The proof shows age &ge;{" "}
                  {typeof minAge === "number" ? minAge : 18} without revealing
                  the exact birthday.
                </Text>
                <Code block>
                  {`pi_a: [${proofResult.proof.pi_a
                    .slice(0, 2)
                    .map((v) => truncateHex(v, 8))
                    .join(", ")}]\n`}
                  {`pi_c: [${proofResult.proof.pi_c
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
                  Step 4: Verify Age Proof
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
                      ? "Age Verified"
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
                      ? `Age verification passed! The prover is at least ${typeof minAge === "number" ? minAge : 18} years old, without revealing their exact birthday.`
                      : "Age verification failed. The prover could not prove they meet the age threshold."}
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
              title: "Commit to Identity",
              description:
                "Your birthday (year, month, day) is hashed with Poseidon to create an identity commitment that hides the actual values.",
              details: [
                "The commitment is a one-way function: you cannot reverse it to find the birthday",
                "This commitment can be registered on-chain as your identity",
              ],
            },
            {
              title: "Prove Age in a Circuit",
              description:
                "The ZK circuit checks: (currentYear - birthYear) >= minAge, accounting for month and day, all inside a zero-knowledge proof.",
              details: [
                "The circuit also verifies that Poseidon(year, month, day) matches the public commitment",
                "Only the commitment and threshold are public; the birthday stays private",
              ],
            },
            {
              title: "Verify Without Revealing",
              description:
                "A verifier (smart contract or service) checks the proof using only the public inputs: commitment, current date, and threshold.",
              details: [
                "No birthday information is leaked during verification",
                "The same commitment can be reused for different age thresholds",
              ],
            },
          ]}
          whyItMatters="Age verification is required by many services (alcohol, gambling, financial products), but sharing your exact birthday is a privacy risk. ZK proofs let you prove 'I am over 18' without revealing when you were born, reducing identity theft and data breach risks."
          tips={[
            "The current date must be provided as a public input to prevent proof replay attacks",
            "A commitment registry on-chain can prevent users from generating multiple identities",
            "This pattern generalizes to any range proof: salary thresholds, credit scores, etc.",
          ]}
          defaultExpanded
        />
      </Tabs.Panel>
    </Tabs>
  );
}
