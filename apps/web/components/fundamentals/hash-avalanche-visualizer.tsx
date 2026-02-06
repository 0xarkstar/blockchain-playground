"use client";

import { useMemo } from "react";
import { Box, Text, Group, Tooltip } from "@mantine/core";

interface HashAvalancheVisualizerProps {
  binary1: string;
  binary2: string;
  diffBits: number[];
}

export function HashAvalancheVisualizer({
  binary1,
  binary2,
  diffBits,
}: HashAvalancheVisualizerProps) {
  const diffSet = useMemo(() => new Set(diffBits), [diffBits]);

  const gridSize = Math.ceil(Math.sqrt(binary1.length));
  const cellSize = Math.max(4, Math.min(8, Math.floor(320 / gridSize)));

  return (
    <Box>
      <Text size="sm" fw={600} mb="xs">
        Avalanche Effect Heat Map ({diffBits.length}/{binary1.length} bits
        changed)
      </Text>
      <Group gap={0} wrap="wrap" style={{ maxWidth: gridSize * cellSize + 2 }}>
        {binary1.split("").map((_, i) => (
          <Tooltip
            key={i}
            label={`Bit ${i}: ${binary1[i]} → ${binary2[i]}`}
            withArrow
            position="top"
          >
            <Box
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: diffSet.has(i)
                  ? "var(--mantine-color-red-6)"
                  : "var(--mantine-color-green-6)",
                opacity: diffSet.has(i) ? 1 : 0.3,
                borderRadius: 1,
              }}
            />
          </Tooltip>
        ))}
      </Group>
      <Group mt="xs" gap="md">
        <Group gap={4}>
          <Box
            style={{
              width: 12,
              height: 12,
              backgroundColor: "var(--mantine-color-red-6)",
              borderRadius: 2,
            }}
          />
          <Text size="xs">Changed</Text>
        </Group>
        <Group gap={4}>
          <Box
            style={{
              width: 12,
              height: 12,
              backgroundColor: "var(--mantine-color-green-6)",
              opacity: 0.3,
              borderRadius: 2,
            }}
          />
          <Text size="xs">Unchanged</Text>
        </Group>
      </Group>
    </Box>
  );
}
