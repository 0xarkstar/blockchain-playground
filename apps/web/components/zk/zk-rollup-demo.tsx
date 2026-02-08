"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  Button,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Alert,
  NumberInput,
  TextInput,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createRollupState,
  processBatch,
  calculateCompression,
  type RollupState,
  type BatchResult,
} from "../../lib/zk/rollup";
import { SimpleBarChart } from "../shared";

const INITIAL_ACCOUNTS = [
  { address: "alice", balance: 1000n },
  { address: "bob", balance: 500n },
  { address: "charlie", balance: 200n },
];

export function ZKRollupDemo() {
  const [state, setState] = useState<RollupState>(() =>
    createRollupState(INITIAL_ACCOUNTS),
  );
  const [batches, setBatches] = useState<BatchResult[]>([]);
  const [txFrom, setTxFrom] = useState("alice");
  const [txTo, setTxTo] = useState("bob");
  const [txAmount, setTxAmount] = useState(100);
  const [pendingTxs, setPendingTxs] = useState<
    { from: string; to: string; amount: bigint }[]
  >([]);
  const [batchSize, setBatchSize] = useState(100);

  const compression = useMemo(
    () => calculateCompression(batchSize),
    [batchSize],
  );

  const handleAddTx = () => {
    setPendingTxs([
      ...pendingTxs,
      { from: txFrom, to: txTo, amount: BigInt(txAmount) },
    ]);
  };

  const handleProcessBatch = () => {
    if (pendingTxs.length === 0) return;
    const result = processBatch(state, pendingTxs);
    setState(result.newState);
    setBatches([...batches, result]);
    setPendingTxs([]);
  };

  const handleReset = () => {
    setState(createRollupState(INITIAL_ACCOUNTS));
    setBatches([]);
    setPendingTxs([]);
  };

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        ZK Rollups batch transactions off-chain and post a validity proof
        on-chain. This simulator shows the mechanics: state roots, batch proofs,
        and gas savings.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              L2 State (Block #{state.blockNumber})
            </Text>
            <Button
              onClick={handleReset}
              variant="light"
              color="gray"
              size="xs"
            >
              Reset
            </Button>
          </Group>
          <Text size="xs" c="dimmed">
            Root: <Code>{state.stateRoot.slice(0, 20)}...</Code>
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Account</Table.Th>
                <Table.Th ta="right">Balance</Table.Th>
                <Table.Th ta="right">Nonce</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {state.accounts.map((a) => (
                <Table.Tr key={a.address}>
                  <Table.Td>
                    <Code>{a.address}</Code>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Code>{a.balance.toString()}</Code>
                  </Table.Td>
                  <Table.Td ta="right">{a.nonce}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Add Transaction
          </Text>
          <Group grow>
            <TextInput
              label="From"
              value={txFrom}
              onChange={(e) => setTxFrom(e.currentTarget.value)}
            />
            <TextInput
              label="To"
              value={txTo}
              onChange={(e) => setTxTo(e.currentTarget.value)}
            />
            <NumberInput
              label="Amount"
              value={txAmount}
              onChange={(v) => setTxAmount(Number(v) || 0)}
              min={1}
            />
          </Group>
          <Group>
            <Button onClick={handleAddTx} variant="light">
              Add to Batch
            </Button>
            <Button
              onClick={handleProcessBatch}
              variant="light"
              color="green"
              disabled={pendingTxs.length === 0}
            >
              Process Batch ({pendingTxs.length} txs)
            </Button>
          </Group>
          {pendingTxs.length > 0 && (
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>From</Table.Th>
                  <Table.Th>To</Table.Th>
                  <Table.Th>Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pendingTxs.map((tx, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{tx.from}</Table.Td>
                    <Table.Td>{tx.to}</Table.Td>
                    <Table.Td>{tx.amount.toString()}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {batches.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Processed Batches
            </Text>
            {batches.map((batch) => (
              <Paper key={batch.batchNumber} p="sm" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Badge variant="light">Batch #{batch.batchNumber}</Badge>
                    <Group gap="xs">
                      <Badge variant="light" color="green" size="sm">
                        {batch.successCount} ok
                      </Badge>
                      {batch.failCount > 0 && (
                        <Badge variant="light" color="red" size="sm">
                          {batch.failCount} failed
                        </Badge>
                      )}
                    </Group>
                  </Group>
                  <Text size="xs">
                    Proof: <Code>{batch.proofHash.slice(0, 20)}...</Code>
                  </Text>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Gas Compression Analysis
          </Text>
          <NumberInput
            label="Batch size (transactions)"
            value={batchSize}
            onChange={(v) => setBatchSize(Number(v) || 1)}
            min={1}
            max={10000}
          />
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>L1 gas (individual txs)</Table.Td>
                <Table.Td ta="right">
                  <Code>{compression.l1TotalGas.toLocaleString()}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>L2 gas (rollup)</Table.Td>
                <Table.Td ta="right">
                  <Code>{compression.l2TotalGas.toLocaleString()}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Proof verification cost</Table.Td>
                <Table.Td ta="right">
                  <Code>{compression.l2ProofGas.toLocaleString()}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Gas savings</Table.Td>
                <Table.Td ta="right">
                  <Badge
                    variant="light"
                    color={compression.savings > 0 ? "green" : "red"}
                  >
                    {compression.savings}%
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Compression ratio</Table.Td>
                <Table.Td ta="right">
                  <Code>{compression.compressionRatio}x</Code>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>

          <SimpleBarChart
            data={[
              { type: "L1 Individual", gas: compression.l1TotalGas },
              { type: "L2 Rollup", gas: compression.l2TotalGas },
            ]}
            xKey="type"
            yKeys={["gas"]}
            colors={["#fa5252", "#40c057"]}
            height={200}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Batch Processing Flow
          </Text>
          <svg width="100%" height={80} viewBox="0 0 520 80">
            {[
              { label: "Transactions", x: 10, color: "blue" },
              { label: "Batch", x: 140, color: "violet" },
              { label: "ZK Proof", x: 270, color: "orange" },
              { label: "L1 Submit", x: 400, color: "green" },
            ].map((step, i) => (
              <g key={step.label}>
                <rect
                  x={step.x}
                  y={20}
                  width={100}
                  height={40}
                  rx={8}
                  fill={`var(--mantine-color-${step.color}-light)`}
                  stroke={`var(--mantine-color-${step.color}-6)`}
                  strokeWidth={1.5}
                />
                <text
                  x={step.x + 50}
                  y={45}
                  textAnchor="middle"
                  fontSize={11}
                  fill={`var(--mantine-color-${step.color}-9)`}
                >
                  {step.label}
                </text>
                {i < 3 && (
                  <text
                    x={step.x + 120}
                    y={45}
                    textAnchor="middle"
                    fontSize={16}
                    fill="var(--mantine-color-dimmed)"
                  >
                    {"\u2192"}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </Stack>
      </Paper>
    </Stack>
  );
}
