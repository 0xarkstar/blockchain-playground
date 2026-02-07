"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  SegmentedControl,
  TextInput,
  NumberInput,
  Table,
  Badge,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { simulateCall, type CallContext } from "../../lib/solidity/evm";

const CALL_TYPES: { value: CallContext["callType"]; label: string }[] = [
  { value: "call", label: "CALL" },
  { value: "delegatecall", label: "DELEGATECALL" },
  { value: "staticcall", label: "STATICCALL" },
];

export function ContractInteractionsDemo() {
  const [callType, setCallType] = useState<CallContext["callType"]>("call");
  const [from, setFrom] = useState("0xContractA");
  const [to, setTo] = useState("0xContractB");
  const [value, setValue] = useState<number>(0);

  const result = useMemo(
    () => simulateCall({ callType, from, to, value }),
    [callType, from, to, value],
  );

  const allResults = useMemo(
    () =>
      (["call", "delegatecall", "staticcall"] as const).map((ct) =>
        simulateCall({ callType: ct, from, to, value }),
      ),
    [from, to, value],
  );

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Call Configuration
          </Text>
          <SegmentedControl
            data={CALL_TYPES}
            value={callType}
            onChange={(v) => setCallType(v as CallContext["callType"])}
            fullWidth
          />
          <Group grow>
            <TextInput
              label="From (caller)"
              value={from}
              onChange={(e) => setFrom(e.currentTarget.value)}
            />
            <TextInput
              label="To (target)"
              value={to}
              onChange={(e) => setTo(e.currentTarget.value)}
            />
          </Group>
          <NumberInput
            label="Value (wei)"
            value={value}
            onChange={(v) => setValue(Number(v) || 0)}
            min={0}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            {result.callType} Context
          </Text>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>msg.sender</Table.Td>
                <Table.Td ta="right">
                  <Badge variant="light">{result.msgSender}</Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Storage Context</Table.Td>
                <Table.Td ta="right">
                  <Badge variant="light" color="blue">
                    {result.storageContext}
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Code Source</Table.Td>
                <Table.Td ta="right">
                  <Badge variant="light" color="violet">
                    {result.codeSource}
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Value Transferred</Table.Td>
                <Table.Td ta="right">{result.valueTransferred} wei</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Can Modify State</Table.Td>
                <Table.Td ta="right">
                  <Badge
                    color={result.canModifyState ? "green" : "red"}
                    variant="light"
                  >
                    {result.canModifyState ? "Yes" : "No"}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="blue"
            variant="light"
          >
            {result.description}
          </Alert>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Side-by-Side Comparison
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Property</Table.Th>
                <Table.Th>CALL</Table.Th>
                <Table.Th>DELEGATECALL</Table.Th>
                <Table.Th>STATICCALL</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>msg.sender</Table.Td>
                {allResults.map((r, i) => (
                  <Table.Td key={i}>
                    <Text size="xs">{r.msgSender}</Text>
                  </Table.Td>
                ))}
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Storage</Table.Td>
                {allResults.map((r, i) => (
                  <Table.Td key={i}>
                    <Badge size="xs" variant="light" color="blue">
                      {r.storageContext}
                    </Badge>
                  </Table.Td>
                ))}
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Code</Table.Td>
                {allResults.map((r, i) => (
                  <Table.Td key={i}>
                    <Badge size="xs" variant="light" color="violet">
                      {r.codeSource}
                    </Badge>
                  </Table.Td>
                ))}
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Value</Table.Td>
                {allResults.map((r, i) => (
                  <Table.Td key={i}>
                    <Text size="xs">{r.valueTransferred}</Text>
                  </Table.Td>
                ))}
              </Table.Tr>
              <Table.Tr>
                <Table.Td>State Mutable</Table.Td>
                {allResults.map((r, i) => (
                  <Table.Td key={i}>
                    <Badge
                      size="xs"
                      color={r.canModifyState ? "green" : "red"}
                      variant="light"
                    >
                      {r.canModifyState ? "Yes" : "No"}
                    </Badge>
                  </Table.Td>
                ))}
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      {callType === "delegatecall" && (
        <Alert icon={<IconInfoCircle size={16} />} color="yellow">
          DELEGATECALL is used by proxy contracts. The target&apos;s code runs
          with the caller&apos;s storage, so storage layout must match between
          proxy and implementation.
        </Alert>
      )}
    </Stack>
  );
}
