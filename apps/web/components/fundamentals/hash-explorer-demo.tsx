"use client";

import { useState, useMemo } from "react";
import {
  TextInput,
  SegmentedControl,
  Stack,
  Code,
  Text,
  Group,
  Paper,
  Badge,
  CopyButton,
  ActionIcon,
  SimpleGrid,
  Box,
} from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import {
  hash,
  computeAvalancheEffect,
  type HashAlgorithm,
} from "../../lib/blockchain/hash";
import { HashAvalancheVisualizer } from "./hash-avalanche-visualizer";

export function HashExplorerDemo() {
  const [input, setInput] = useState("Hello, Blockchain!");
  const [compareInput, setCompareInput] = useState("Hello, Blockchain?");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("sha256");

  const hashes = useMemo(
    () => ({
      sha256: hash(input, "sha256"),
      keccak256: hash(input, "keccak256"),
      blake2b: hash(input, "blake2b"),
    }),
    [input]
  );

  const currentHash = hashes[algorithm];

  const avalanche = useMemo(
    () => computeAvalancheEffect(input, compareInput, algorithm),
    [input, compareInput, algorithm]
  );

  return (
    <Stack gap="lg">
      <TextInput
        label="Input Text"
        description="Type anything — see how the hash changes instantly"
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        size="md"
      />

      <SegmentedControl
        value={algorithm}
        onChange={(v) => setAlgorithm(v as HashAlgorithm)}
        data={[
          { label: "SHA-256", value: "sha256" },
          { label: "Keccak-256", value: "keccak256" },
          { label: "BLAKE2b", value: "blake2b" },
        ]}
      />

      <Paper p="md" withBorder>
        <Text size="sm" fw={600} mb="xs">
          Hash Output ({algorithm})
        </Text>
        <Group gap="xs" align="center">
          <Code block style={{ flex: 1, wordBreak: "break-all" }}>
            {currentHash}
          </Code>
          <CopyButton value={currentHash}>
            {({ copied, copy }) => (
              <ActionIcon
                variant="subtle"
                color={copied ? "teal" : "gray"}
                onClick={copy}
              >
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            )}
          </CopyButton>
        </Group>
        <Group mt="xs" gap="xs">
          <Badge variant="light" size="sm">
            {currentHash.length - 2} hex chars
          </Badge>
          <Badge variant="light" size="sm">
            {(currentHash.length - 2) * 4} bits
          </Badge>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {(["sha256", "keccak256", "blake2b"] as const).map((algo) => (
          <Paper key={algo} p="sm" withBorder>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">
              {algo}
            </Text>
            <Code
              block
              style={{
                fontSize: "0.65rem",
                wordBreak: "break-all",
              }}
            >
              {hashes[algo]}
            </Code>
          </Paper>
        ))}
      </SimpleGrid>

      <Paper p="md" withBorder>
        <Text size="sm" fw={600} mb="md">
          Avalanche Effect Comparison
        </Text>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <TextInput
            label="Original Input"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            size="sm"
          />
          <TextInput
            label="Modified Input"
            description="Change one character to see the avalanche effect"
            value={compareInput}
            onChange={(e) => setCompareInput(e.currentTarget.value)}
            size="sm"
          />
        </SimpleGrid>

        <Group mt="md" gap="md">
          <Badge
            size="lg"
            variant="filled"
            color={avalanche.diffPercent > 40 ? "green" : "orange"}
          >
            {avalanche.diffPercent.toFixed(1)}% bits changed
          </Badge>
          <Text size="sm" c="dimmed">
            Ideal: ~50% (good hash function)
          </Text>
        </Group>

        <Box mt="md">
          <HashAvalancheVisualizer
            binary1={avalanche.binary1}
            binary2={avalanche.binary2}
            diffBits={avalanche.diffBits}
          />
        </Box>
      </Paper>
    </Stack>
  );
}

