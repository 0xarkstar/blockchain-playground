"use client";

import {
  Stack,
  Button,
  Alert,
  Code,
  Text,
  Group,
  Badge,
  Paper,
} from "@mantine/core";
import { IconCheck, IconX, IconLoader2 } from "@tabler/icons-react";

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface VerificationPanelProps {
  readonly identityCommitment: string;
  readonly minAge: number | "";
  readonly phase: string;
  readonly progressMessage: string;
  readonly proofResult: {
    proof: {
      pi_a: string[];
      pi_c: string[];
    };
    publicSignals: unknown[];
  } | null;
  readonly verificationResult: boolean | null;
  readonly onGenerateProof: () => void;
  readonly onVerifyProof: () => void;
}

export function VerificationPanel({
  identityCommitment,
  minAge,
  phase,
  progressMessage,
  proofResult,
  verificationResult,
  onGenerateProof,
  onVerifyProof,
}: VerificationPanelProps) {
  if (!identityCommitment) {
    return null;
  }

  return (
    <>
      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text fw={600} size="sm">
            Step 3: Generate Age Proof
          </Text>
          <Text size="xs" c="dimmed">
            Prove that your age meets the threshold without revealing your exact
            birthday.
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
            onClick={onGenerateProof}
            loading={phase === "proving"}
            disabled={
              phase !== "proving" && phase !== "proved" && phase !== "verified"
            }
          >
            Prove Age &ge; {typeof minAge === "number" ? minAge : 18}
          </Button>
        </Stack>
      </Paper>

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
              The proof shows age &ge; {typeof minAge === "number" ? minAge : 18}{" "}
              without revealing the exact birthday.
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
              onClick={onVerifyProof}
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
    </>
  );
}
