"use client";

import { useState, useMemo, useRef } from "react";
import {
  Stack,
  Paper,
  TextInput,
  Select,
  Switch,
  Button,
  Code,
  Table,
  Badge,
  Group,
  Text,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { encodeLogEntry, type EventParam } from "../../lib/solidity/abi";

const PARAM_TYPES = ["uint256", "address", "bool", "bytes32", "uint8"];

interface ParamInput {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly value: string;
  readonly indexed: boolean;
}

export function EventLogInspectorDemo() {
  const [eventName, setEventName] = useState("Transfer");
  const nextId = useRef(3);
  const [params, setParams] = useState<ParamInput[]>([
    {
      id: 0,
      name: "from",
      type: "address",
      value: "0x0000000000000000000000000000000000000001",
      indexed: true,
    },
    {
      id: 1,
      name: "to",
      type: "address",
      value: "0x0000000000000000000000000000000000000002",
      indexed: true,
    },
    { id: 2, name: "value", type: "uint256", value: "1000", indexed: false },
  ]);

  const log = useMemo(() => {
    try {
      const eventParams: EventParam[] = params.map((p) => ({
        name: p.name,
        type: p.type,
        value: p.value,
        indexed: p.indexed,
      }));
      return encodeLogEntry(eventName, eventParams);
    } catch {
      return null;
    }
  }, [eventName, params]);

  const addParam = () => {
    setParams([
      ...params,
      {
        id: nextId.current++,
        name: "",
        type: "uint256",
        value: "0",
        indexed: false,
      },
    ]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (
    index: number,
    field: keyof ParamInput,
    value: string | boolean,
  ) => {
    setParams(
      params.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const indexedCount = useMemo(
    () => params.filter((p) => p.indexed).length,
    [params],
  );

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Event Definition
          </Text>
          <TextInput
            label="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.currentTarget.value)}
          />
          <Text size="xs" fw={600}>
            Parameters ({params.length}) — Indexed: {indexedCount}/3 max
          </Text>
          {params.map((param, i) => (
            <Group key={param.id} align="flex-end">
              <Select
                label="Type"
                data={PARAM_TYPES}
                value={param.type}
                onChange={(v) => v && updateParam(i, "type", v)}
                style={{ width: 130 }}
              />
              <TextInput
                label="Name"
                value={param.name}
                onChange={(e) => updateParam(i, "name", e.currentTarget.value)}
                style={{ width: 100 }}
              />
              <TextInput
                label="Value"
                value={param.value}
                onChange={(e) => updateParam(i, "value", e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Switch
                label="Indexed"
                checked={param.indexed}
                onChange={(e) =>
                  updateParam(i, "indexed", e.currentTarget.checked)
                }
                disabled={!param.indexed && indexedCount >= 3}
              />
              <Button
                size="sm"
                variant="subtle"
                color="red"
                onClick={() => removeParam(i)}
              >
                <IconTrash size={14} />
              </Button>
            </Group>
          ))}
          <Button
            leftSection={<IconPlus size={16} />}
            variant="outline"
            onClick={addParam}
            size="xs"
          >
            Add Parameter
          </Button>
        </Stack>
      </Paper>

      {log && (
        <>
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Text size="sm" fw={600}>
                Topics
              </Text>
              {log.topics.map((topic, i) => (
                <Stack key={i} gap={2}>
                  <Text size="xs" c="dimmed">
                    {log.topicDescriptions[i]}
                  </Text>
                  <Code style={{ fontSize: 11, wordBreak: "break-all" }}>
                    {topic}
                  </Code>
                </Stack>
              ))}
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="md">
              <Text size="sm" fw={600}>
                Data (non-indexed ABI-encoded)
              </Text>
              <Code block style={{ fontSize: 11, wordBreak: "break-all" }}>
                {log.data || "0x (empty — all params are indexed)"}
              </Code>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="md">
              <Text size="sm" fw={600}>
                Log Structure Summary
              </Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Parameter</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Location</Table.Th>
                    <Table.Th>Searchable</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {params.map((p, i) => (
                    <Table.Tr key={i}>
                      <Table.Td>{p.name}</Table.Td>
                      <Table.Td>
                        <Badge size="xs" variant="light">
                          {p.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="xs" color={p.indexed ? "blue" : "gray"}>
                          {p.indexed ? "topic" : "data"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="xs"
                          color={p.indexed ? "green" : "red"}
                          variant="light"
                        >
                          {p.indexed ? "Yes" : "No"}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
}
