"use client";

import { Stack, Button, Text, Group, Paper } from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";

interface EligibleAddress {
  readonly id: number;
  readonly address: string;
  readonly commitment: string;
}

interface ClaimPanelProps {
  readonly addresses: readonly EligibleAddress[];
  readonly claimIndex: number;
  readonly phase: string;
  readonly progressMessage: string;
  readonly onClaimIndexChange: (index: number) => void;
  readonly onClaim: () => void;
}

export function ClaimPanel({
  addresses,
  claimIndex,
  phase,
  progressMessage,
  onClaimIndexChange,
  onClaim,
}: ClaimPanelProps) {
  if (
    phase !== "ready" &&
    phase !== "proving" &&
    phase !== "proved" &&
    phase !== "verifying" &&
    phase !== "verified"
  ) {
    return null;
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Text fw={600} size="sm">
          Step 3: Claim Airdrop Privately
        </Text>
        <Text size="xs" c="dimmed">
          Prove you are in the eligibility list without revealing which address
          is yours. Select which address to claim as:
        </Text>
        <Group gap="xs" wrap="wrap">
          {addresses.map((addr, idx) => (
            <Button
              key={addr.id}
              variant={idx === claimIndex ? "filled" : "outline"}
              size="xs"
              onClick={() => onClaimIndexChange(idx)}
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
          onClick={onClaim}
          loading={phase === "proving"}
          disabled={phase !== "ready"}
        >
          Generate Claim Proof
        </Button>
      </Stack>
    </Paper>
  );
}
