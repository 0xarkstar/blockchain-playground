"use client";

import { useState, useCallback } from "react";
import {
  Stack,
  TextInput,
  NumberInput,
  Button,
  Code,
  Text,
  Paper,
  Group,
  Badge,
  Table,
  Slider,
  Alert,
  Progress,
  Box,
} from "@mantine/core";
import { IconCube, IconPick, IconPlus } from "@tabler/icons-react";
import {
  createGenesisBlock,
  createBlock,
  createTransaction,
  mineBlock,
  meetsTarget,
  type Block,
  type Transaction,
  type MiningResult,
} from "../../lib/blockchain/block";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";

function BlockchainVisual({ block }: { block: Block }) {
  const genesis = {
    index: 0,
    hash: block.header.previousHash,
  };

  return (
    <Paper p="md" withBorder data-testid="blockchain-visual">
      <Text size="sm" fw={600} mb="md">
        Blockchain Structure
      </Text>
      <Group gap={0} wrap="nowrap" style={{ overflowX: "auto" }}>
        {/* Genesis block */}
        <Paper
          p="sm"
          withBorder
          style={{
            minWidth: 160,
            borderColor: "var(--mantine-color-gray-5)",
          }}
        >
          <Badge size="xs" color="gray" mb={4}>
            Genesis
          </Badge>
          <Text size="xs" c="dimmed">
            Hash
          </Text>
          <Code style={{ fontSize: "0.55rem" }}>
            {genesis.hash.slice(0, 16)}...
          </Code>
        </Paper>

        {/* Arrow connecting blocks */}
        <Box px="xs" style={{ display: "flex", alignItems: "center" }}>
          <svg width="40" height="24" viewBox="0 0 40 24">
            <line
              x1="0"
              y1="12"
              x2="30"
              y2="12"
              stroke="var(--mantine-color-blue-5)"
              strokeWidth="2"
            />
            <polygon
              points="30,6 40,12 30,18"
              fill="var(--mantine-color-blue-5)"
            />
          </svg>
        </Box>

        {/* Mined block */}
        <Paper
          p="sm"
          withBorder
          style={{
            minWidth: 160,
            borderColor: "var(--mantine-color-green-5)",
            borderWidth: 2,
          }}
        >
          <Badge size="xs" color="green" mb={4}>
            Block #{block.index}
          </Badge>
          <Text size="xs" c="dimmed">
            Prev Hash
          </Text>
          <Code style={{ fontSize: "0.55rem" }} color="blue">
            {block.header.previousHash.slice(0, 16)}...
          </Code>
          <Text size="xs" c="dimmed" mt={4}>
            Hash
          </Text>
          <Code style={{ fontSize: "0.55rem" }}>
            {block.hash.slice(0, 16)}...
          </Code>
          <Group gap={4} mt={4}>
            <Badge size="xs" variant="light">
              {block.transactions.length} TXs
            </Badge>
            <Badge size="xs" variant="light">
              Nonce: {block.header.nonce}
            </Badge>
          </Group>
        </Paper>
      </Group>
      <Text size="xs" c="dimmed" mt="xs">
        The previous hash in Block #{block.index} matches the genesis block
        hash, creating a cryptographic link
      </Text>
    </Paper>
  );
}

export function BlockBuilderDemo() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [from, setFrom] = useState("0xAlice");
  const [to, setTo] = useState("0xBob");
  const [amount, setAmount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState(2);
  const [block, setBlock] = useState<Block | null>(null);
  const [miningResult, setMiningResult] = useState<MiningResult | null>(null);
  const [mining, setMining] = useState(false);

  const handleAddTransaction = useCallback(() => {
    const tx = createTransaction(from, to, amount);
    setTransactions((prev) => [...prev, tx]);
  }, [from, to, amount]);

  const handleMineBlock = useCallback(() => {
    if (transactions.length === 0) return;
    setMining(true);

    setTimeout(() => {
      const genesis = createGenesisBlock();
      const newBlock = createBlock(genesis, transactions, difficulty);
      const result = mineBlock(newBlock);
      setBlock(result.block);
      setMiningResult(result);
      setMining(false);
    }, 10);
  }, [transactions, difficulty]);

  const handleReset = useCallback(() => {
    setTransactions([]);
    setBlock(null);
    setMiningResult(null);
  }, []);

  const inputPanel = (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Step 1: Create Transactions
          </Text>
          <Group grow>
            <TextInput
              label="From"
              value={from}
              onChange={(e) => setFrom(e.currentTarget.value)}
              size="sm"
            />
            <TextInput
              label="To"
              value={to}
              onChange={(e) => setTo(e.currentTarget.value)}
              size="sm"
            />
            <NumberInput
              label="Amount"
              value={amount}
              onChange={(v) => setAmount(Number(v))}
              min={0}
              size="sm"
            />
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            variant="outline"
            onClick={handleAddTransaction}
          >
            Add Transaction
          </Button>

          {transactions.length > 0 && (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>From</Table.Th>
                  <Table.Th>To</Table.Th>
                  <Table.Th>Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {transactions.map((tx) => (
                  <Table.Tr key={tx.id}>
                    <Table.Td>
                      <Code>{tx.id.slice(0, 10)}...</Code>
                    </Table.Td>
                    <Table.Td>{tx.from}</Table.Td>
                    <Table.Td>{tx.to}</Table.Td>
                    <Table.Td>{tx.amount}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Step 2: Configure Mining Difficulty
          </Text>
          <Text size="xs" c="dimmed">
            Difficulty: {difficulty} (requires {difficulty} leading zeros in
            hash)
          </Text>
          <Slider
            value={difficulty}
            onChange={setDifficulty}
            min={1}
            max={5}
            step={1}
            marks={[
              { value: 1, label: "1" },
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 4, label: "4" },
              { value: 5, label: "5" },
            ]}
          />
        </Stack>
      </Paper>

      <Group>
        <Button
          leftSection={<IconPick size={16} />}
          onClick={handleMineBlock}
          disabled={transactions.length === 0 || mining}
          loading={mining}
        >
          Mine Block
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </Group>
    </Stack>
  );

  const resultPanel = (
    <Stack gap="md">
      {miningResult && block ? (
        <>
          <BlockchainVisual block={block} />

          <Paper p="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Mined Block
                </Text>
                <Group gap="xs">
                  <Badge variant="light" color="green">
                    Block #{block.index}
                  </Badge>
                  <Badge variant="light">Nonce: {miningResult.nonce}</Badge>
                </Group>
              </Group>

              <Alert
                icon={<IconCube size={16} />}
                color="green"
                title="Block Mined Successfully"
              >
                Found valid nonce after {miningResult.hashesComputed} hashes in{" "}
                {miningResult.timeMs.toFixed(1)}ms
              </Alert>

              <div>
                <Text size="xs" c="dimmed">
                  Block Hash
                </Text>
                <Code block style={{ wordBreak: "break-all" }}>
                  {block.hash}
                </Code>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Previous Hash
                </Text>
                <Code block style={{ wordBreak: "break-all" }}>
                  {block.header.previousHash}
                </Code>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Merkle Root
                </Text>
                <Code block style={{ wordBreak: "break-all" }}>
                  {block.header.merkleRoot}
                </Code>
              </div>

              <Group gap="md">
                <Badge>Difficulty: {block.header.difficulty}</Badge>
                <Badge>Nonce: {block.header.nonce}</Badge>
                <Badge>TXs: {block.transactions.length}</Badge>
                <Badge>
                  Hash Rate:{" "}
                  {(
                    miningResult.hashesComputed /
                    (miningResult.timeMs / 1000)
                  ).toFixed(0)}{" "}
                  H/s
                </Badge>
              </Group>
            </Stack>
          </Paper>
        </>
      ) : (
        <Paper p="md" withBorder>
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Add transactions and mine a block to see the blockchain structure
          </Text>
        </Paper>
      )}
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
              title: "Collect Transactions",
              description:
                "Miners gather pending transactions from the mempool into a candidate block.",
            },
            {
              title: "Build Block Header",
              description:
                "The header includes previous block hash, merkle root of transactions, timestamp, and difficulty target.",
            },
            {
              title: "Mine (Proof of Work)",
              description:
                "The miner increments the nonce until the block hash meets the difficulty target (starts with N zeros).",
            },
            {
              title: "Chain the Block",
              description:
                "The new block's previous hash field links it to the last block, forming an immutable chain.",
            },
          ]}
          whyItMatters="Blocks are the fundamental data structure of a blockchain. Each block cryptographically references its predecessor, making it computationally infeasible to alter past transactions without redoing all subsequent proof-of-work."
          tips={[
            "Higher difficulty exponentially increases mining time — try difficulty 4 vs 2",
            "The merkle root is a single hash summarizing all transactions in the block",
            "Notice how the previous hash in the mined block exactly matches the genesis hash",
          ]}
        />
      }
    />
  );
}
