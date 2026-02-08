"use client";

import { useState, useMemo, useRef } from "react";
import {
  Stack,
  Paper,
  TextInput,
  Select,
  Button,
  Code,
  Table,
  Badge,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { IconPlus, IconTrash, IconInfoCircle } from "@tabler/icons-react";
import { encodeCalldata, type AbiParam } from "../../lib/solidity/abi";
import { EducationPanel } from "../../components/shared";

const PARAM_TYPES = ["uint256", "address", "bool", "bytes32", "uint8"];

interface ParamWithId extends AbiParam {
  readonly id: number;
}

export function AbiEncoderDemo() {
  const nextId = useRef(2);
  const [funcName, setFuncName] = useState("transfer");
  const [params, setParams] = useState<ParamWithId[]>([
    {
      id: 0,
      name: "to",
      type: "address",
      value: "0x0000000000000000000000000000000000000001",
    },
    { id: 1, name: "amount", type: "uint256", value: "1000" },
  ]);

  const result = useMemo(() => {
    try {
      return encodeCalldata(funcName, params);
    } catch {
      return null;
    }
  }, [funcName, params]);

  const addParam = () => {
    setParams([
      ...params,
      { id: nextId.current++, name: "", type: "uint256", value: "0" },
    ]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (
    index: number,
    field: keyof ParamWithId,
    value: string,
  ) => {
    setParams(
      params.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        This encoder supports static types only: uint256, address, bool,
        bytes32, uint8. Dynamic types (string, bytes, arrays) require
        offset-based encoding.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Function Definition
          </Text>
          <TextInput
            label="Function Name"
            value={funcName}
            onChange={(e) => setFuncName(e.currentTarget.value)}
          />
          <Text size="xs" fw={600}>
            Parameters
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
                style={{ width: 120 }}
              />
              <TextInput
                label="Value"
                value={param.value}
                onChange={(e) => updateParam(i, "value", e.currentTarget.value)}
                style={{ flex: 1 }}
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

      {result && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Encoded Result
            </Text>
            <Table>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>Function Signature</Table.Td>
                  <Table.Td ta="right">
                    <Code>{result.functionSignature}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Selector (4 bytes)</Table.Td>
                  <Table.Td ta="right">
                    <Badge color="blue" variant="light" size="lg">
                      {result.selector}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>

            {result.encodedParams.length > 0 && (
              <>
                <Text size="xs" fw={600}>
                  Encoded Parameters (32-byte words)
                </Text>
                {result.encodedParams.map((encoded, i) => (
                  <Group key={i} gap="xs">
                    <Badge size="xs" variant="outline">
                      word {i}
                    </Badge>
                    <Code style={{ flex: 1, fontSize: 11 }}>{encoded}</Code>
                  </Group>
                ))}
              </>
            )}

            <Text size="xs" fw={600}>
              Full Calldata (Color-Coded)
            </Text>
            <Paper
              p="xs"
              withBorder
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                wordBreak: "break-all",
                lineHeight: 1.8,
              }}
            >
              <span
                style={{
                  backgroundColor: "var(--mantine-color-blue-1)",
                  padding: "2px 0",
                }}
              >
                {result.selector}
              </span>
              {result.encodedParams.map((encoded, i) => {
                const colors = [
                  "var(--mantine-color-green-1)",
                  "var(--mantine-color-orange-1)",
                  "var(--mantine-color-violet-1)",
                  "var(--mantine-color-cyan-1)",
                  "var(--mantine-color-pink-1)",
                ];
                return (
                  <span
                    key={i}
                    style={{
                      backgroundColor: colors[i % colors.length],
                      padding: "2px 0",
                    }}
                  >
                    {encoded.replace("0x", "")}
                  </span>
                );
              })}
            </Paper>
            <Group gap="xs" mt="xs">
              <Badge size="xs" color="blue" variant="light">
                Selector (4B)
              </Badge>
              {params.map((p, i) => {
                const badgeColors = [
                  "green",
                  "orange",
                  "violet",
                  "cyan",
                  "pink",
                ];
                return (
                  <Badge
                    key={p.id}
                    size="xs"
                    color={badgeColors[i % badgeColors.length]}
                    variant="light"
                  >
                    {p.name || `param${i}`} (32B)
                  </Badge>
                );
              })}
            </Group>
          </Stack>
        </Paper>
      )}

      <EducationPanel
        howItWorks={[
          {
            title: "Function Selector",
            description:
              "First 4 bytes of keccak256(signature). Identifies which function to call (e.g., 0xa9059cbb for transfer).",
          },
          {
            title: "Parameter Encoding",
            description:
              "Each parameter is padded to 32 bytes (256 bits). Addresses are left-padded with zeros, numbers are right-aligned.",
          },
          {
            title: "Calldata Assembly",
            description:
              "selector + encoded_param1 + encoded_param2 + ... Forms the complete transaction input data.",
          },
        ]}
        whyItMatters="ABI encoding is how your frontend talks to smart contracts. Understanding it helps debug failed transactions and verify contract interactions at the raw data level."
        tips={[
          "Function selectors can collide — different functions may share the same 4-byte selector",
          "Dynamic types (string, bytes, arrays) use offset-based encoding with pointers",
          "Tools like cast and Etherscan's decoder can parse calldata back to readable parameters",
        ]}
      />
    </Stack>
  );
}
