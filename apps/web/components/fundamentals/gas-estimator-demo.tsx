"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Text,
  Paper,
  Badge,
  Table,
  NumberInput,
  SimpleGrid,
  Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { SimpleBarChart } from "../shared/charts";
import { OnChainSection } from "../shared/on-chain-section";

interface GasOperation {
  name: string;
  gasUsed: number;
  description: string;
  category: "storage" | "computation" | "transfer" | "contract";
}

const GAS_OPERATIONS: GasOperation[] = [
  {
    name: "ETH Transfer",
    gasUsed: 21000,
    description: "Simple ETH send",
    category: "transfer",
  },
  {
    name: "SSTORE (new)",
    gasUsed: 20000,
    description: "Write new storage slot",
    category: "storage",
  },
  {
    name: "SSTORE (update)",
    gasUsed: 5000,
    description: "Update existing storage slot",
    category: "storage",
  },
  {
    name: "SLOAD",
    gasUsed: 2100,
    description: "Read storage slot",
    category: "storage",
  },
  {
    name: "ERC-20 Transfer",
    gasUsed: 65000,
    description: "Token transfer",
    category: "contract",
  },
  {
    name: "ERC-20 Approve",
    gasUsed: 46000,
    description: "Token approval",
    category: "contract",
  },
  {
    name: "NFT Mint",
    gasUsed: 150000,
    description: "Mint a new NFT",
    category: "contract",
  },
  {
    name: "Uniswap Swap",
    gasUsed: 184000,
    description: "DEX token swap",
    category: "contract",
  },
  {
    name: "Contract Deploy (small)",
    gasUsed: 500000,
    description: "Deploy simple contract",
    category: "contract",
  },
  {
    name: "Keccak256",
    gasUsed: 36,
    description: "Hash 32 bytes",
    category: "computation",
  },
  {
    name: "ECRECOVER",
    gasUsed: 3000,
    description: "Signature verification",
    category: "computation",
  },
  {
    name: "LOG1",
    gasUsed: 750,
    description: "Emit event with 1 topic",
    category: "computation",
  },
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

  const chartData = useMemo(
    () =>
      GAS_OPERATIONS.filter((op) => op.gasUsed >= 1000).map((op) => ({
        name: op.name,
        gas: op.gasUsed,
      })),
    [],
  );

  const inputPanel = (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1 }} spacing="md">
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
        conditions, contract complexity, and EVM state.
      </Alert>
    </Stack>
  );

  const resultPanel = (
    <Stack gap="md">
      <Paper p="md" withBorder data-testid="gas-comparison-chart">
        <Text size="sm" fw={600} mb="sm">
          Gas Cost Comparison
        </Text>
        <SimpleBarChart
          data={chartData}
          xKey="name"
          yKeys={["gas"]}
          height={300}
          grouped
        />
        <Text size="xs" c="dimmed" mt="xs">
          Comparing gas costs across operations (1,000+ gas only). Contract
          deployment is the most expensive.
        </Text>
      </Paper>
    </Stack>
  );

  return (
    <DemoLayout
      inputPanel={inputPanel}
      resultPanel={resultPanel}
      learnContent={
        <EducationPanel
          howItWorks={[
            {
              title: "Gas Units",
              description:
                "Every EVM operation has a fixed gas cost. Simple operations cost few gas units; storage writes are expensive.",
            },
            {
              title: "Gas Price",
              description:
                "Users bid a gas price (in Gwei) they are willing to pay per unit. Higher prices = faster inclusion.",
            },
            {
              title: "Total Cost",
              description:
                "Total cost = gas used x gas price. This is paid in ETH from the sender's account.",
              details: [
                "1 Gwei = 0.000000001 ETH",
                "Gas limit caps the maximum gas a tx can consume",
              ],
            },
          ]}
          whyItMatters="Gas is the EVM's resource metering system. It prevents infinite loops, compensates validators, and creates a fee market. Understanding gas costs is essential for writing efficient smart contracts and estimating transaction fees."
          tips={[
            "Storage operations (SSTORE) are among the most expensive — minimize on-chain storage",
            "A simple ETH transfer always costs exactly 21,000 gas",
            "L2 chains like Base offer significantly lower gas costs than Ethereum mainnet",
          ]}
        />
      }
      onChainContent={
        <OnChainSection
          contractName="GasTestContract"
          contractDescription="A companion contract with various operations (storage read/write, hashing, loops, events) designed for measuring real gas costs on-chain. Deploy it and call each function to compare actual gas usage against the estimates shown in the demo."
          network="Base Sepolia"
          functions={[
            {
              name: "storageWrite",
              signature:
                "function storageWrite(uint256 key, uint256 value) external",
              description:
                "Write a value to a storage mapping slot (SSTORE operation).",
            },
            {
              name: "storageRead",
              signature:
                "function storageRead(uint256 key) external view returns (uint256)",
              description:
                "Read a value from a storage mapping slot (SLOAD operation).",
            },
            {
              name: "arrayPush",
              signature: "function arrayPush(uint256 value) external",
              description: "Push a value to a dynamic storage array.",
            },
            {
              name: "hashData",
              signature:
                "function hashData(bytes calldata data) external pure returns (bytes32)",
              description: "Compute keccak256 hash of input data.",
            },
            {
              name: "computeLoop",
              signature:
                "function computeLoop(uint256 iterations) external pure returns (uint256)",
              description:
                "Execute a computation loop to measure gas scaling with iteration count.",
            },
            {
              name: "storeWithEvent",
              signature:
                "function storeWithEvent(uint256 key, uint256 value) external",
              description:
                "Write to storage and emit a DataStored event, measuring combined gas cost.",
            },
          ]}
        />
      }
    />
  );
}
