"use client";

import { useState, useMemo, useRef } from "react";
import {
  Stack,
  Paper,
  Select,
  TextInput,
  Button,
  Table,
  Progress,
  Badge,
  Group,
  Text,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  calculateStorageLayout,
  optimizeStorageLayout,
  getTypeSize,
  type SolidityStorageType,
  type StorageVariable,
} from "../../lib/solidity/storage";

const TYPES: SolidityStorageType[] = [
  "uint8",
  "uint16",
  "uint32",
  "uint64",
  "uint128",
  "uint256",
  "int8",
  "int16",
  "int32",
  "int64",
  "int128",
  "int256",
  "bool",
  "address",
  "bytes1",
  "bytes2",
  "bytes4",
  "bytes8",
  "bytes16",
  "bytes32",
];

const SLOT_COLORS = [
  "blue",
  "green",
  "orange",
  "violet",
  "cyan",
  "pink",
  "teal",
  "yellow",
  "grape",
  "indigo",
];

interface VariableWithId extends StorageVariable {
  readonly id: number;
}

export function StorageLayoutDemo() {
  const nextId = useRef(4);
  const [variables, setVariables] = useState<VariableWithId[]>([
    { id: 0, name: "owner", type: "address" },
    { id: 1, name: "balance", type: "uint256" },
    { id: 2, name: "active", type: "bool" },
    { id: 3, name: "count", type: "uint8" },
  ]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<SolidityStorageType>("uint256");
  const [showOptimized, setShowOptimized] = useState(false);

  const layout = useMemo(() => calculateStorageLayout(variables), [variables]);

  const optimized = useMemo(
    () => optimizeStorageLayout(variables),
    [variables],
  );

  const activeLayout = showOptimized ? optimized : layout;

  const addVariable = () => {
    if (!newName.trim()) return;
    setVariables([
      ...variables,
      { id: nextId.current++, name: newName.trim(), type: newType },
    ]);
    setNewName("");
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Add Variable
          </Text>
          <Group>
            <TextInput
              placeholder="Variable name"
              value={newName}
              onChange={(e) => setNewName(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Select
              data={TYPES}
              value={newType}
              onChange={(v) => v && setNewType(v as SolidityStorageType)}
              style={{ width: 150 }}
            />
            <Button leftSection={<IconPlus size={16} />} onClick={addVariable}>
              Add
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Variables ({variables.length})
            </Text>
          </Group>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {variables.map((v, i) => (
                <Table.Tr key={v.id}>
                  <Table.Td>{v.name}</Table.Td>
                  <Table.Td>
                    <Badge variant="light">{v.type}</Badge>
                  </Table.Td>
                  <Table.Td>{getTypeSize(v.type)} bytes</Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => removeVariable(i)}
                    >
                      <IconTrash size={14} />
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Storage Layout
            </Text>
            <Button
              size="xs"
              variant={showOptimized ? "filled" : "outline"}
              onClick={() => setShowOptimized(!showOptimized)}
            >
              {showOptimized ? "Showing Optimized" : "Show Optimized"}
            </Button>
          </Group>

          {activeLayout.assignments.length > 0 && (
            <>
              {Array.from({ length: activeLayout.totalSlots }, (_, slotIdx) => {
                const slotAssignments = activeLayout.assignments.filter(
                  (a) => a.slotIndex === slotIdx,
                );
                const usedInSlot = slotAssignments.reduce(
                  (s, a) => s + a.size,
                  0,
                );
                const wastedInSlot = 32 - usedInSlot;

                return (
                  <Paper key={slotIdx} p="xs" withBorder>
                    <Text size="xs" c="dimmed" mb={4}>
                      Slot {slotIdx}
                    </Text>
                    <Progress.Root size={24}>
                      {slotAssignments.map((a, i) => (
                        <Progress.Section
                          key={a.variable.name}
                          value={(a.size / 32) * 100}
                          color={SLOT_COLORS[i % SLOT_COLORS.length]}
                        >
                          <Progress.Label>
                            {a.variable.name} ({a.size}B)
                          </Progress.Label>
                        </Progress.Section>
                      ))}
                      {wastedInSlot > 0 && (
                        <Progress.Section
                          value={(wastedInSlot / 32) * 100}
                          color="gray"
                        >
                          <Progress.Label>{wastedInSlot}B</Progress.Label>
                        </Progress.Section>
                      )}
                    </Progress.Root>
                  </Paper>
                );
              })}
            </>
          )}
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Comparison
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Metric</Table.Th>
                <Table.Th ta="right">Original</Table.Th>
                <Table.Th ta="right">Optimized</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Total Slots</Table.Td>
                <Table.Td ta="right">{layout.totalSlots}</Table.Td>
                <Table.Td ta="right">
                  <Badge
                    color={
                      optimized.totalSlots < layout.totalSlots
                        ? "green"
                        : "gray"
                    }
                    variant="light"
                  >
                    {optimized.totalSlots}
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Used Bytes</Table.Td>
                <Table.Td ta="right">{layout.usedBytes}</Table.Td>
                <Table.Td ta="right">{optimized.usedBytes}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Wasted Bytes</Table.Td>
                <Table.Td ta="right">{layout.wastedBytes}</Table.Td>
                <Table.Td ta="right">
                  <Badge
                    color={
                      optimized.wastedBytes < layout.wastedBytes
                        ? "green"
                        : "gray"
                    }
                    variant="light"
                  >
                    {optimized.wastedBytes}
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Efficiency</Table.Td>
                <Table.Td ta="right">{layout.efficiency.toFixed(1)}%</Table.Td>
                <Table.Td ta="right">
                  <Badge
                    color={
                      optimized.efficiency > layout.efficiency
                        ? "green"
                        : "gray"
                    }
                    variant="light"
                  >
                    {optimized.efficiency.toFixed(1)}%
                  </Badge>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
