"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Stack,
  Button,
  Code,
  Text,
  Paper,
  Group,
  Badge,
  Alert,
  Textarea,
  SimpleGrid,
  Box,
} from "@mantine/core";
import {
  IconLink,
  IconAlertTriangle,
  IconShieldCheck,
} from "@tabler/icons-react";
import {
  createGenesisBlock,
  createBlock,
  createTransaction,
  mineBlock,
  computeBlockHash,
  type Block,
} from "../../lib/blockchain/block";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";

function ChainLinkArrow({ broken }: { broken: boolean }) {
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 36,
      }}
    >
      <svg width="36" height="24" viewBox="0 0 36 24">
        {broken ? (
          <>
            <line
              x1="0"
              y1="12"
              x2="10"
              y2="12"
              stroke="var(--mantine-color-red-5)"
              strokeWidth="2"
            />
            <line
              x1="26"
              y1="12"
              x2="36"
              y2="12"
              stroke="var(--mantine-color-red-5)"
              strokeWidth="2"
            />
            <text
              x="18"
              y="16"
              textAnchor="middle"
              fill="var(--mantine-color-red-5)"
              fontSize="14"
              fontWeight="bold"
            >
              ✕
            </text>
          </>
        ) : (
          <>
            <line
              x1="0"
              y1="12"
              x2="26"
              y2="12"
              stroke="var(--mantine-color-green-5)"
              strokeWidth="2"
            />
            <polygon
              points="26,6 36,12 26,18"
              fill="var(--mantine-color-green-5)"
            />
          </>
        )}
      </svg>
    </Box>
  );
}

function ChainVisualDiagram({
  chain,
  validation,
}: {
  chain: Block[];
  validation: { hashValid: boolean; linkValid: boolean; valid: boolean }[];
}) {
  if (chain.length === 0) return null;

  return (
    <Paper p="md" withBorder data-testid="chain-visual-diagram">
      <Text size="sm" fw={600} mb="sm">
        Chain Structure
      </Text>
      <Group gap={0} wrap="nowrap" style={{ overflowX: "auto" }}>
        {chain.map((block, i) => {
          const v = validation[i];
          const showBrokenLink = i > 0 && !v?.linkValid;

          return (
            <Group key={i} gap={0} wrap="nowrap">
              {i > 0 && <ChainLinkArrow broken={showBrokenLink} />}
              <Paper
                p="xs"
                withBorder
                style={{
                  minWidth: 100,
                  borderColor: v?.valid
                    ? "var(--mantine-color-green-5)"
                    : "var(--mantine-color-red-5)",
                  borderWidth: v?.valid ? 1 : 2,
                  backgroundColor: v?.valid
                    ? undefined
                    : "var(--mantine-color-red-light)",
                }}
              >
                <Badge
                  size="xs"
                  color={v?.valid ? "green" : "red"}
                  mb={2}
                  fullWidth
                >
                  #{block.index}
                </Badge>
                <Code style={{ fontSize: "0.5rem", display: "block" }}>
                  {block.hash.slice(0, 10)}...
                </Code>
              </Paper>
            </Group>
          );
        })}
      </Group>
    </Paper>
  );
}

export function ChainIntegrityDemo() {
  const [chain, setChain] = useState<Block[]>([]);
  const [building, setBuilding] = useState(false);
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null);

  const handleBuildChain = useCallback(() => {
    setBuilding(true);
    setTamperedIndex(null);

    setTimeout(() => {
      const blocks: Block[] = [];
      const genesis = createGenesisBlock();
      const minedGenesis = mineBlock(genesis);
      blocks.push(minedGenesis.block);

      for (let i = 1; i <= 4; i++) {
        const txs = [createTransaction(`0xUser${i}`, `0xUser${i + 1}`, i * 10)];
        const newBlock = createBlock(blocks[blocks.length - 1], txs, 1);
        const mined = mineBlock(newBlock);
        blocks.push(mined.block);
      }

      setChain(blocks);
      setBuilding(false);
    }, 10);
  }, []);

  const handleTamper = useCallback(
    (index: number) => {
      if (index === 0 || chain.length === 0) return;

      const newChain = chain.map((b) => ({
        ...b,
        header: { ...b.header },
        transactions: [...b.transactions],
      }));

      const tampered = newChain[index];
      if (tampered.transactions.length > 0) {
        tampered.transactions = [
          {
            ...tampered.transactions[0],
            amount: 999999,
          },
        ];
      }
      tampered.hash = computeBlockHash(tampered.header);

      setChain(newChain);
      setTamperedIndex(index);
    },
    [chain],
  );

  const validation = useMemo(() => {
    if (chain.length === 0) return [];
    return chain.map((block, i) => {
      const recomputedHash = computeBlockHash(block.header);
      const hashValid = block.hash === recomputedHash;
      const linkValid =
        i === 0 || block.header.previousHash === chain[i - 1].hash;
      return { hashValid, linkValid, valid: hashValid && linkValid };
    });
  }, [chain]);

  const chainValid = validation.every((v) => v.valid);

  const inputPanel = (
    <Stack gap="md">
      <Group>
        <Button
          leftSection={<IconLink size={16} />}
          onClick={handleBuildChain}
          loading={building}
        >
          Build 5-Block Chain
        </Button>
      </Group>

      {chain.length > 0 && (
        <>
          <Alert
            icon={
              chainValid ? (
                <IconShieldCheck size={16} />
              ) : (
                <IconAlertTriangle size={16} />
              )
            }
            color={chainValid ? "green" : "red"}
            title={chainValid ? "Chain Valid" : "Chain Broken!"}
          >
            {chainValid
              ? "All blocks are valid and properly linked."
              : `Chain integrity broken${tamperedIndex !== null ? ` — Block #${tamperedIndex} was tampered. Subsequent blocks have invalid previous hash links.` : "."}`}
          </Alert>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {chain.map((block, i) => {
              const v = validation[i];
              return (
                <Paper
                  key={i}
                  p="md"
                  withBorder
                  style={{
                    borderColor: v?.valid
                      ? undefined
                      : "var(--mantine-color-red-6)",
                    borderWidth: v?.valid ? 1 : 2,
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Badge color={v?.valid ? "green" : "red"} variant="light">
                        Block #{block.index}
                      </Badge>
                      <Group gap={4}>
                        {!v?.hashValid && (
                          <Badge color="red" size="xs">
                            Hash Invalid
                          </Badge>
                        )}
                        {!v?.linkValid && (
                          <Badge color="red" size="xs">
                            Link Broken
                          </Badge>
                        )}
                      </Group>
                    </Group>

                    <div>
                      <Text size="xs" c="dimmed">
                        Hash
                      </Text>
                      <Code
                        style={{ fontSize: "0.6rem", wordBreak: "break-all" }}
                      >
                        {block.hash.slice(0, 20)}...
                      </Code>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">
                        Prev Hash
                      </Text>
                      <Code
                        style={{ fontSize: "0.6rem", wordBreak: "break-all" }}
                      >
                        {block.header.previousHash.slice(0, 20)}...
                      </Code>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">
                        TXs: {block.transactions.length}
                        {block.transactions[0]
                          ? ` (${block.transactions[0].amount} ETH)`
                          : ""}
                      </Text>
                    </div>

                    {i > 0 && (
                      <Button
                        size="xs"
                        variant="outline"
                        color="red"
                        onClick={() => handleTamper(i)}
                      >
                        Tamper Block
                      </Button>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </SimpleGrid>
        </>
      )}
    </Stack>
  );

  const resultPanel = (
    <Stack gap="md">
      <ChainVisualDiagram chain={chain} validation={validation} />
      {chain.length === 0 && (
        <Paper p="md" withBorder>
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Build a chain to see the visual integrity diagram
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
              title: "Build Chain",
              description:
                "Each block stores the hash of the previous block in its header, forming a linked chain.",
            },
            {
              title: "Tamper Detection",
              description:
                "If block data is modified, its hash changes but the next block still references the old hash.",
            },
            {
              title: "Cascade Effect",
              description:
                "A single tampered block breaks the chain link for all subsequent blocks.",
            },
            {
              title: "Immutability Guarantee",
              description:
                "To alter history, an attacker must redo the proof-of-work for every block after the tampered one.",
            },
          ]}
          whyItMatters="Chain integrity is what makes blockchains immutable. The cryptographic linking of blocks means any modification to past data is immediately detectable, providing a tamper-evident audit trail."
          tips={[
            "Try tampering with Block #1 and notice how blocks #2-#4 all show broken links",
            "The chain break visual shows exactly where integrity is compromised",
            "In a real blockchain, re-mining all subsequent blocks is computationally infeasible",
          ]}
        />
      }
    />
  );
}
