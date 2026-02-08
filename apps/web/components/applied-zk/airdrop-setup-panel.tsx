"use client";

import {
  Stack,
  TextInput,
  Button,
  Text,
  Group,
  Badge,
  Paper,
  ActionIcon,
  Table,
  Code,
} from "@mantine/core";
import {
  IconParachute,
  IconPlus,
  IconTrash,
  IconLoader2,
} from "@tabler/icons-react";

interface EligibleAddress {
  readonly id: number;
  readonly address: string;
  readonly commitment: string;
}

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface AirdropSetupPanelProps {
  readonly addresses: readonly EligibleAddress[];
  readonly newAddress: string;
  readonly claimIndex: number;
  readonly phase: string;
  readonly onAddAddress: () => void;
  readonly onRemoveAddress: (id: number) => void;
  readonly onNewAddressChange: (value: string) => void;
  readonly onBuildTree: () => void;
  readonly progressMessage: string;
}

export function AirdropSetupPanel({
  addresses,
  newAddress,
  claimIndex,
  phase,
  onAddAddress,
  onRemoveAddress,
  onNewAddressChange,
  onBuildTree,
  progressMessage,
}: AirdropSetupPanelProps) {
  return (
    <>
      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text fw={600} size="sm">
            Step 1: Eligible Addresses
          </Text>
          <Text size="xs" c="dimmed">
            These addresses are eligible for the airdrop. In production, this
            list would be compiled off-chain (e.g., early users, token holders
            at a snapshot).
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
                        onClick={() => onRemoveAddress(addr.id)}
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
                onChange={(e) => onNewAddressChange(e.currentTarget.value)}
                style={{ flex: 1 }}
                size="xs"
              />
              <ActionIcon
                variant="light"
                onClick={onAddAddress}
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
            Hash each address with Poseidon and insert into a Merkle tree. Only
            the Merkle root is published on-chain.
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
            onClick={onBuildTree}
            loading={phase === "building"}
            disabled={phase !== "setup" || addresses.length < 2}
            leftSection={<IconParachute size={16} />}
          >
            Build Merkle Tree
          </Button>
        </Stack>
      </Paper>
    </>
  );
}
