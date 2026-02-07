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

  return (
    <Stack gap="lg">
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

          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
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
}
