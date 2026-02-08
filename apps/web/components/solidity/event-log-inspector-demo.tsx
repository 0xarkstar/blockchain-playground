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
import { EducationPanel } from "../../components/shared";

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

      {log && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Event Timeline
            </Text>
            <Stack
              gap="xs"
              style={{
                borderLeft: "3px solid var(--mantine-color-blue-3)",
                paddingLeft: 16,
              }}
            >
              <Paper p="xs" withBorder bg="blue.0">
                <Group gap="xs">
                  <Badge size="xs" color="blue">
                    topic[0]
                  </Badge>
                  <Text size="xs" fw={600}>
                    Event Signature Hash
                  </Text>
                </Group>
                <Code style={{ fontSize: 10 }}>
                  {log.topics[0]?.slice(0, 20)}...
                </Code>
              </Paper>
              {params
                .filter((p) => p.indexed)
                .map((p, i) => (
                  <Paper key={p.id} p="xs" withBorder bg="green.0">
                    <Group gap="xs">
                      <Badge size="xs" color="green">
                        topic[{i + 1}]
                      </Badge>
                      <Text size="xs" fw={600}>
                        {p.name} (indexed {p.type})
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {p.value}
                    </Text>
                  </Paper>
                ))}
              {params
                .filter((p) => !p.indexed)
                .map((p) => (
                  <Paper key={p.id} p="xs" withBorder bg="gray.0">
                    <Group gap="xs">
                      <Badge size="xs" color="gray">
                        data
                      </Badge>
                      <Text size="xs" fw={600}>
                        {p.name} (non-indexed {p.type})
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {p.value}
                    </Text>
                  </Paper>
                ))}
            </Stack>
          </Stack>
        </Paper>
      )}

      <EducationPanel
        howItWorks={[
          {
            title: "Event Topics",
            description:
              "topic[0] is the keccak256 hash of the event signature. Indexed parameters go in topic[1-3]. Max 3 indexed params.",
          },
          {
            title: "Event Data",
            description:
              "Non-indexed parameters are ABI-encoded in the data field. Cheaper to store but not directly searchable.",
          },
          {
            title: "Log Filtering",
            description:
              "Indexed parameters enable eth_getLogs filtering. You can search for specific Transfer events by sender or receiver.",
          },
        ]}
        whyItMatters="Events are the primary way smart contracts communicate with off-chain applications. They're much cheaper than storage and enable efficient real-time monitoring of contract activity."
        tips={[
          "Index parameters you need to search/filter by (e.g., sender, receiver)",
          "Events cost ~375 gas base + 375 per indexed topic + 8 per data byte",
          "Anonymous events omit topic[0] — saves gas but harder to filter",
        ]}
      />
    </Stack>
  );
}
