"use client";

import { Stack, Text, Paper, Code, Alert, Badge, Group } from "@mantine/core";
import { IconInfoCircle, IconFileCode } from "@tabler/icons-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface ContractFunction {
  readonly name: string;
  readonly signature: string;
  readonly description: string;
}

interface OnChainSectionProps {
  readonly contractName: string;
  readonly contractDescription: string;
  readonly network: string;
  readonly functions: readonly ContractFunction[];
}

export function OnChainSection({
  contractName,
  contractDescription,
  network,
  functions,
}: OnChainSectionProps) {
  return (
    <Stack gap="md">
      <Alert
        icon={<IconInfoCircle size={16} />}
        color="blue"
        variant="light"
        title="Optional: On-Chain Verification"
      >
        This demo includes a companion Solidity contract that can perform the
        same operation on-chain. Connect your wallet to explore the contract
        interface. The contract is designed for deployment on {network}.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Connect Wallet
          </Text>
          <ConnectButton />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group gap="sm">
            <IconFileCode size={18} />
            <Text size="sm" fw={600}>
              {contractName}
            </Text>
            <Badge variant="light" size="sm" color="violet">
              Solidity ^0.8.24
            </Badge>
          </Group>

          <Text size="sm" c="dimmed">
            {contractDescription}
          </Text>

          <Text size="xs" fw={600} mt="xs">
            Contract Functions
          </Text>

          {functions.map((fn) => (
            <Paper key={fn.name} p="sm" withBorder bg="gray.0">
              <Stack gap={4}>
                <Code style={{ fontSize: "0.75rem" }}>{fn.signature}</Code>
                <Text size="xs" c="dimmed">
                  {fn.description}
                </Text>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>

      <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light">
        Contract deployment and on-chain execution are not included in this
        demo. The ABI and function signatures above are provided for reference
        and educational purposes.
      </Alert>
    </Stack>
  );
}
