"use client";

import { Stack, Text, Group, Badge, Paper, Code } from "@mantine/core";

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface ResultsPanelProps {
  readonly nullifierHash: string;
  readonly merkleRoot: string;
  readonly proofResult: {
    proof: {
      pi_a: string[];
    };
    publicSignals: unknown[];
  } | null;
}

export function ResultsPanel({
  nullifierHash,
  merkleRoot,
  proofResult,
}: ResultsPanelProps) {
  return (
    <>
      {nullifierHash && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Nullifier (Anti-Double-Vote)
            </Text>
            <Text size="xs" c="dimmed">
              The nullifier is derived from your secret and the proposal ID. If
              submitted twice, it will be detected and rejected. It does not
              reveal your identity.
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
    </>
  );
}
