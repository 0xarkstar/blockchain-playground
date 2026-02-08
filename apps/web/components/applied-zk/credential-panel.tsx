"use client";

import {
  Stack,
  NumberInput,
  Button,
  Text,
  Group,
  Badge,
  Paper,
  Code,
  CopyButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconShieldCheck, IconCheck, IconCopy } from "@tabler/icons-react";

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface CredentialPanelProps {
  readonly birthYear: number | "";
  readonly birthMonth: number | "";
  readonly birthDay: number | "";
  readonly minAge: number | "";
  readonly phase: string;
  readonly identityCommitment: string;
  readonly isInputValid: boolean;
  readonly onBirthYearChange: (val: number | "") => void;
  readonly onBirthMonthChange: (val: number | "") => void;
  readonly onBirthDayChange: (val: number | "") => void;
  readonly onMinAgeChange: (val: number | "") => void;
  readonly onComputeCommitment: () => void;
}

export function CredentialPanel({
  birthYear,
  birthMonth,
  birthDay,
  minAge,
  phase,
  identityCommitment,
  isInputValid,
  onBirthYearChange,
  onBirthMonthChange,
  onBirthDayChange,
  onMinAgeChange,
  onComputeCommitment,
}: CredentialPanelProps) {
  return (
    <>
      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text fw={600} size="sm">
            Step 1: Enter Birthday (Private)
          </Text>
          <Text size="xs" c="dimmed">
            Your birthday is the private input. It will never be revealed to the
            verifier.
          </Text>
          <Group grow>
            <NumberInput
              label="Birth Year"
              value={birthYear}
              onChange={(val) =>
                onBirthYearChange(typeof val === "number" ? val : "")
              }
              min={1900}
              max={new Date().getFullYear()}
              disabled={phase !== "input"}
            />
            <NumberInput
              label="Birth Month"
              value={birthMonth}
              onChange={(val) =>
                onBirthMonthChange(typeof val === "number" ? val : "")
              }
              min={1}
              max={12}
              disabled={phase !== "input"}
            />
            <NumberInput
              label="Birth Day"
              value={birthDay}
              onChange={(val) =>
                onBirthDayChange(typeof val === "number" ? val : "")
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
            onChange={(val) => onMinAgeChange(typeof val === "number" ? val : "")}
            min={1}
            max={150}
            disabled={phase !== "input"}
          />
          <Button
            onClick={onComputeCommitment}
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
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Stack>
        </Paper>
      )}
    </>
  );
}
