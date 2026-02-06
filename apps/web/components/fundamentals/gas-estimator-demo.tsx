"use client";

import { useState } from "react";
import {
  Stack,
  Text,
  Paper,
  Group,
  Badge,
  Table,
  NumberInput,
  SimpleGrid,
  Alert,
} from "@mantine/core";
import { IconFlame, IconInfoCircle } from "@tabler/icons-react";

interface GasOperation {
  name: string;
  gasUsed: number;
  description: string;
  category: "storage" | "computation" | "transfer" | "contract";
}

const GAS_OPERATIONS: GasOperation[] = [
  { name: "ETH Transfer", gasUsed: 21000, description: "Simple ETH send", category: "transfer" },
  { name: "SSTORE (new)", gasUsed: 20000, description: "Write new storage slot", category: "storage" },
  { name: "SSTORE (update)", gasUsed: 5000, description: "Update existing storage slot", category: "storage" },
  { name: "SLOAD", gasUsed: 2100, description: "Read storage slot", category: "storage" },
  { name: "ERC-20 Transfer", gasUsed: 65000, description: "Token transfer", category: "contract" },
  { name: "ERC-20 Approve", gasUsed: 46000, description: "Token approval", category: "contract" },
  { name: "NFT Mint", gasUsed: 150000, description: "Mint a new NFT", category: "contract" },
  { name: "Uniswap Swap", gasUsed: 184000, description: "DEX token swap", category: "contract" },
  { name: "Contract Deploy (small)", gasUsed: 500000, description: "Deploy simple contract", category: "contract" },
  { name: "Keccak256", gasUsed: 36, description: "Hash 32 bytes", category: "computation" },
  { name: "ECRECOVER", gasUsed: 3000, description: "Signature verification", category: "computation" },
  { name: "LOG1", gasUsed: 750, description: "Emit event with 1 topic", category: "computation" },
];

const categoryColors = {
  storage: "blue",
  computation: "green",
  transfer: "orange",
  contract: "violet",
} as const;

export function GasEstimatorDemo() {
  const [gasPrice, setGasPrice] = useState<number>(0.5);
  const [ethPrice, setEthPrice] = useState<number>(3000);

  const computeCost = (gasUsed: number) => {
    const ethCost = gasUsed * gasPrice * 1e-9;
    const usdCost = ethCost * ethPrice;
    return { ethCost, usdCost };
  };

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <NumberInput
          label="Gas Price (Gwei)"
          value={gasPrice}
          onChange={(v) => setGasPrice(Number(v))}
          min={0.01}
          step={0.1}
          decimalScale={2}
        />
        <NumberInput
          label="ETH Price (USD)"
          value={ethPrice}
          onChange={(v) => setEthPrice(Number(v))}
          min={1}
          step={100}
        />
      </SimpleGrid>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Operation</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Gas Used</Table.Th>
            <Table.Th>Cost (ETH)</Table.Th>
            <Table.Th>Cost (USD)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {GAS_OPERATIONS.map((op) => {
            const { ethCost, usdCost } = computeCost(op.gasUsed);
            return (
              <Table.Tr key={op.name}>
                <Table.Td>
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>
                      {op.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {op.description}
                    </Text>
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={categoryColors[op.category]}
                    size="sm"
                  >
                    {op.category}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" ff="monospace">
                    {op.gasUsed.toLocaleString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" ff="monospace">
                    {ethCost < 0.000001
                      ? ethCost.toExponential(2)
                      : ethCost.toFixed(6)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" ff="monospace">
                    ${usdCost < 0.01 ? usdCost.toFixed(6) : usdCost.toFixed(4)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light">
        Gas costs are approximate estimates. Actual costs depend on network
        conditions, contract complexity, and EVM state. The EVM charges gas for
        every operation to prevent abuse and compensate validators.
      </Alert>
    </Stack>
  );
}
