"use client";

import { useState, useCallback, useRef } from "react";
import {
  Stack,
  Button,
  Text,
  Paper,
  Group,
  Badge,
  Slider,
  Code,
  Progress,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import { IconPick, IconPlayerStop } from "@tabler/icons-react";
import {
  createGenesisBlock,
  createBlock,
  createTransaction,
  computeBlockHash,
  meetsTarget,
  type Block,
} from "../../lib/blockchain/block";

interface MiningStats {
  hashesComputed: number;
  hashRate: number;
  currentNonce: number;
  currentHash: string;
  elapsedMs: number;
  found: boolean;
}

export function MiningSimulatorDemo() {
  const [difficulty, setDifficulty] = useState(3);
  const [mining, setMining] = useState(false);
  const [stats, setStats] = useState<MiningStats | null>(null);
  const [minedBlock, setMinedBlock] = useState<Block | null>(null);
  const cancelRef = useRef(false);

  const handleStartMining = useCallback(() => {
    setMining(true);
    setMinedBlock(null);
    cancelRef.current = false;

    const genesis = createGenesisBlock();
    const tx = createTransaction("0xMiner", "0xReward", 6.25);
    const block = createBlock(genesis, [tx], difficulty);
    const start = performance.now();
    let hashesComputed = 0;
    let nonce = 0;

    const batchSize = 5000;

    const mineStep = () => {
      if (cancelRef.current) {
        setMining(false);
        return;
      }

      for (let i = 0; i < batchSize; i++) {
        const header = { ...block.header, nonce };
        const blockHash = computeBlockHash(header);
        hashesComputed++;

        if (meetsTarget(blockHash, difficulty)) {
          const elapsed = performance.now() - start;
          setStats({
            hashesComputed,
            hashRate: hashesComputed / (elapsed / 1000),
            currentNonce: nonce,
            currentHash: blockHash,
            elapsedMs: elapsed,
            found: true,
          });
          setMinedBlock({
            ...block,
            header,
            hash: blockHash,
          });
          setMining(false);
          return;
        }
        nonce++;
      }

      const elapsed = performance.now() - start;
      setStats({
        hashesComputed,
        hashRate: hashesComputed / (elapsed / 1000),
        currentNonce: nonce,
        currentHash: computeBlockHash({ ...block.header, nonce }),
        elapsedMs: elapsed,
        found: false,
      });

      requestAnimationFrame(mineStep);
    };

    requestAnimationFrame(mineStep);
  }, [difficulty]);

  const handleStop = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Mining Difficulty
          </Text>
          <Text size="xs" c="dimmed">
            Difficulty: {difficulty} (hash must start with {difficulty} zeros).
            Higher = exponentially harder.
          </Text>
          <Slider
            value={difficulty}
            onChange={setDifficulty}
            min={1}
            max={6}
            step={1}
            disabled={mining}
            marks={[
              { value: 1, label: "1" },
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 4, label: "4" },
              { value: 5, label: "5" },
              { value: 6, label: "6" },
            ]}
          />
        </Stack>
      </Paper>

      <Group>
        {!mining ? (
          <Button
            leftSection={<IconPick size={16} />}
            onClick={handleStartMining}
          >
            Start Mining
          </Button>
        ) : (
          <Button
            leftSection={<IconPlayerStop size={16} />}
            color="red"
            onClick={handleStop}
          >
            Stop Mining
          </Button>
        )}
      </Group>

      {stats && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Mining Progress
              </Text>
              {stats.found && (
                <Badge color="green" variant="filled">
                  Block Found!
                </Badge>
              )}
            </Group>

            {mining && <Progress value={100} animated />}

            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
              <Paper p="sm" withBorder>
                <Text size="xs" c="dimmed">
                  Hashes Computed
                </Text>
                <Text size="lg" fw={700}>
                  {stats.hashesComputed.toLocaleString()}
                </Text>
              </Paper>
              <Paper p="sm" withBorder>
                <Text size="xs" c="dimmed">
                  Hash Rate
                </Text>
                <Text size="lg" fw={700}>
                  {stats.hashRate > 1000
                    ? `${(stats.hashRate / 1000).toFixed(1)} KH/s`
                    : `${stats.hashRate.toFixed(0)} H/s`}
                </Text>
              </Paper>
              <Paper p="sm" withBorder>
                <Text size="xs" c="dimmed">
                  Current Nonce
                </Text>
                <Text size="lg" fw={700}>
                  {stats.currentNonce.toLocaleString()}
                </Text>
              </Paper>
              <Paper p="sm" withBorder>
                <Text size="xs" c="dimmed">
                  Elapsed Time
                </Text>
                <Text size="lg" fw={700}>
                  {(stats.elapsedMs / 1000).toFixed(2)}s
                </Text>
              </Paper>
            </SimpleGrid>

            <div>
              <Text size="xs" c="dimmed">
                {stats.found ? "Winning Hash" : "Current Hash"}
              </Text>
              <Code
                block
                style={{ wordBreak: "break-all" }}
                color={stats.found ? "green" : undefined}
              >
                {stats.currentHash}
              </Code>
            </div>

            <Text size="xs" c="dimmed">
              Target: hash must start with <Code>{"0".repeat(difficulty)}</Code>
            </Text>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
