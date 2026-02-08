"use client";

import {
  Stack,
  Button,
  Text,
  Paper,
  Table,
  Badge,
  Group,
  Code,
  CopyButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconThumbUp, IconCheck, IconCopy } from "@tabler/icons-react";

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface VoterRegistration {
  readonly secret: bigint;
  readonly commitment: bigint;
  readonly commitmentHex: string;
}

interface VoterRegistrationProps {
  readonly voter: VoterRegistration | null;
  readonly otherVoters: readonly string[];
  readonly phase: string;
  readonly onRegister: () => void;
}

export function VoterRegistration({
  voter,
  otherVoters,
  phase,
  onRegister,
}: VoterRegistrationProps) {
  return (
    <>
      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text fw={600} size="sm">
            Step 1: Register as Voter
          </Text>
          <Text size="xs" c="dimmed">
            Generate a secret identity and register your commitment in the voter
            registry (Merkle tree). Three simulated voters are also registered.
          </Text>
          <Button
            onClick={onRegister}
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
    </>
  );
}
