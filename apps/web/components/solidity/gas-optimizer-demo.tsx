"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  SegmentedControl,
  NumberInput,
  Table,
  Badge,
  Group,
  Text,
  Progress,
} from "@mantine/core";
import {
  compareStorageVsMemory,
  comparePackedVsUnpacked,
  compareCallTypes,
  compareMappingVsArray,
  getGasConstantsTable,
} from "../../lib/solidity/gas";

const CATEGORIES = [
  { value: "storage-memory", label: "Storage vs Memory" },
  { value: "packed", label: "Packed Struct" },
  { value: "call-types", label: "Call Types" },
  { value: "mapping-array", label: "Mapping vs Array" },
];

export function GasOptimizerDemo() {
  const [category, setCategory] = useState("storage-memory");
  const [count, setCount] = useState<number>(5);

  const comparison = useMemo(() => {
    switch (category) {
      case "storage-memory": return compareStorageVsMemory(count);
      case "packed": return comparePackedVsUnpacked(count);
      case "call-types": return compareCallTypes(count);
      case "mapping-array": return compareMappingVsArray(count);
      default: return compareStorageVsMemory(count);
    }
  }, [category, count]);

  const gasConstants = useMemo(() => getGasConstantsTable(), []);

  const countLabel = (() => {
    switch (category) {
      case "storage-memory": return "Operation Count";
      case "packed": return "Field Count (uint8)";
      case "call-types": return "Data Size (bytes)";
      case "mapping-array": return "Element Count";
      default: return "Count";
    }
  })();

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Pattern Category</Text>
          <SegmentedControl
            data={CATEGORIES}
            value={category}
            onChange={setCategory}
            fullWidth
          />
          <NumberInput
            label={countLabel}
            value={count}
            onChange={(v) => setCount(Number(v) || 1)}
            min={1}
            max={1000}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Gas Comparison</Text>
          <Group grow>
            <Paper p="sm" withBorder>
              <Stack gap="xs" align="center">
                <Text size="xs" c="dimmed">{comparison.unoptimized.label}</Text>
                <Text size="xl" fw={700} c="red">
                  {comparison.unoptimized.totalGas.toLocaleString()}
                </Text>
                <Text size="xs" c="dimmed">gas</Text>
              </Stack>
            </Paper>
            <Paper p="sm" withBorder>
              <Stack gap="xs" align="center">
                <Text size="xs" c="dimmed">{comparison.optimized.label}</Text>
                <Text size="xl" fw={700} c="green">
                  {comparison.optimized.totalGas.toLocaleString()}
                </Text>
                <Text size="xs" c="dimmed">gas</Text>
              </Stack>
            </Paper>
          </Group>

          <Group justify="center">
            <Badge size="lg" color="green" variant="light">
              {comparison.savings.toLocaleString()} gas saved ({comparison.savingsPercent.toFixed(1)}%)
            </Badge>
          </Group>

          <Progress
            value={100 - comparison.savingsPercent}
            color="green"
            size="xl"
          />
          <Text size="xs" c="dimmed" ta="center">{comparison.explanation}</Text>
        </Stack>
      </Paper>

      <Group grow align="flex-start">
        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Text size="xs" fw={600} c="red">Unoptimized Breakdown</Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Operation</Table.Th>
                  <Table.Th ta="right">Gas/Op</Table.Th>
                  <Table.Th ta="right">Count</Table.Th>
                  <Table.Th ta="right">Total</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {comparison.unoptimized.breakdown.map((item, i) => (
                  <Table.Tr key={i}>
                    <Table.Td><Text size="xs">{item.operation}</Text></Table.Td>
                    <Table.Td ta="right">{item.gasPerOp.toLocaleString()}</Table.Td>
                    <Table.Td ta="right">{item.count}</Table.Td>
                    <Table.Td ta="right">{item.totalGas.toLocaleString()}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Text size="xs" fw={600} c="green">Optimized Breakdown</Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Operation</Table.Th>
                  <Table.Th ta="right">Gas/Op</Table.Th>
                  <Table.Th ta="right">Count</Table.Th>
                  <Table.Th ta="right">Total</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {comparison.optimized.breakdown.map((item, i) => (
                  <Table.Tr key={i}>
                    <Table.Td><Text size="xs">{item.operation}</Text></Table.Td>
                    <Table.Td ta="right">{item.gasPerOp.toLocaleString()}</Table.Td>
                    <Table.Td ta="right">{item.count}</Table.Td>
                    <Table.Td ta="right">{item.totalGas.toLocaleString()}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      </Group>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>EVM Gas Constants Reference</Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Opcode</Table.Th>
                <Table.Th ta="right">Gas</Table.Th>
                <Table.Th>Description</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {gasConstants.map((c) => (
                <Table.Tr key={c.name}>
                  <Table.Td><Badge size="xs" variant="outline">{c.name}</Badge></Table.Td>
                  <Table.Td ta="right">{c.gas.toLocaleString()}</Table.Td>
                  <Table.Td><Text size="xs">{c.description}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
