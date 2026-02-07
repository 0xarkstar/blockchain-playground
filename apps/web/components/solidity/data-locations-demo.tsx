"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  SegmentedControl,
  Select,
  Table,
  Badge,
  Text,
  Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

type VariableContext = "state" | "parameter" | "local" | "return";

interface LocationInfo {
  readonly location: string;
  readonly persistent: boolean;
  readonly mutable: boolean;
  readonly gasCost: string;
  readonly description: string;
}

const LOCATIONS: Record<string, LocationInfo> = {
  storage: {
    location: "storage",
    persistent: true,
    mutable: true,
    gasCost: "20,000 (write) / 2,100 (read)",
    description:
      "Persistent on-chain state. Survives function calls and transactions. Most expensive.",
  },
  memory: {
    location: "memory",
    persistent: false,
    mutable: true,
    gasCost: "3 (read/write) + expansion",
    description:
      "Temporary during function execution. Cleared after external call returns. Cheap for computation.",
  },
  calldata: {
    location: "calldata",
    persistent: false,
    mutable: false,
    gasCost: "4-16 per byte (input only)",
    description:
      "Read-only input data from the transaction. Cannot be modified. Cheapest for function parameters.",
  },
  stack: {
    location: "stack",
    persistent: false,
    mutable: true,
    gasCost: "2-3 (cheapest)",
    description:
      "EVM execution stack. Limited to 1024 depth, 16 accessible. Used for value types and locals.",
  },
};

function getRecommendation(
  context: VariableContext,
  dataType: string,
): {
  recommended: string;
  reason: string;
  alternatives: string[];
} {
  const isValueType = [
    "uint256",
    "address",
    "bool",
    "bytes32",
    "int256",
    "uint8",
  ].includes(dataType);
  const isReferenceType = [
    "struct",
    "array",
    "mapping",
    "string",
    "bytes",
  ].includes(dataType);

  if (context === "state") {
    return {
      recommended: "storage",
      reason:
        "State variables always live in storage — they persist across transactions.",
      alternatives: [],
    };
  }

  if (context === "parameter") {
    if (isValueType) {
      return {
        recommended: "stack",
        reason:
          "Value type parameters are copied to the stack. No explicit location needed.",
        alternatives: [],
      };
    }
    return {
      recommended: "calldata",
      reason:
        "Reference type parameters should use calldata (read-only) for cheapest gas. Use memory if modification needed.",
      alternatives: ["memory"],
    };
  }

  if (context === "local") {
    if (isValueType) {
      return {
        recommended: "stack",
        reason: "Local value types live on the stack automatically.",
        alternatives: [],
      };
    }
    if (isReferenceType) {
      return {
        recommended: "memory",
        reason:
          "Local reference types default to memory. Temporary and mutable.",
        alternatives: ["storage (reference to state)"],
      };
    }
  }

  if (context === "return") {
    if (isValueType) {
      return {
        recommended: "stack",
        reason: "Returned value types are passed via the stack.",
        alternatives: [],
      };
    }
    return {
      recommended: "memory",
      reason: "Returned reference types must be in memory.",
      alternatives: [],
    };
  }

  return {
    recommended: "memory",
    reason: "Default to memory for temporary data.",
    alternatives: [],
  };
}

const CONTEXTS: { value: VariableContext; label: string }[] = [
  { value: "state", label: "State Variable" },
  { value: "parameter", label: "Function Parameter" },
  { value: "local", label: "Local Variable" },
  { value: "return", label: "Return Value" },
];

const DATA_TYPES = [
  "uint256",
  "address",
  "bool",
  "bytes32",
  "int256",
  "uint8",
  "struct",
  "array",
  "mapping",
  "string",
  "bytes",
];

export function DataLocationsDemo() {
  const [context, setContext] = useState<VariableContext>("parameter");
  const [dataType, setDataType] = useState("array");

  const recommendation = useMemo(
    () => getRecommendation(context, dataType),
    [context, dataType],
  );

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Variable Context
          </Text>
          <SegmentedControl
            data={CONTEXTS}
            value={context}
            onChange={(v) => setContext(v as VariableContext)}
            fullWidth
          />
          <Select
            label="Data Type"
            data={DATA_TYPES}
            value={dataType}
            onChange={(v) => v && setDataType(v)}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Recommendation
          </Text>
          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            <Text fw={600}>Use: {recommendation.recommended}</Text>
            <Text size="sm">{recommendation.reason}</Text>
            {recommendation.alternatives.length > 0 && (
              <Text size="xs" c="dimmed" mt={4}>
                Alternatives: {recommendation.alternatives.join(", ")}
              </Text>
            )}
          </Alert>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Location Comparison
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Location</Table.Th>
                <Table.Th>Persistent</Table.Th>
                <Table.Th>Mutable</Table.Th>
                <Table.Th>Gas Cost</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.values(LOCATIONS).map((loc) => (
                <Table.Tr
                  key={loc.location}
                  style={{
                    backgroundColor:
                      loc.location === recommendation.recommended
                        ? "var(--mantine-color-blue-light)"
                        : undefined,
                  }}
                >
                  <Table.Td>
                    <Badge
                      variant={
                        loc.location === recommendation.recommended
                          ? "filled"
                          : "outline"
                      }
                      color={
                        loc.location === recommendation.recommended
                          ? "blue"
                          : "gray"
                      }
                    >
                      {loc.location}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      size="xs"
                      color={loc.persistent ? "green" : "gray"}
                      variant="light"
                    >
                      {loc.persistent ? "Yes" : "No"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      size="xs"
                      color={loc.mutable ? "green" : "red"}
                      variant="light"
                    >
                      {loc.mutable ? "Yes" : "No"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{loc.gasCost}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Rules Summary
          </Text>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>
                  <Badge size="xs" variant="outline">
                    State vars
                  </Badge>
                </Table.Td>
                <Table.Td>Always storage (implicit)</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Badge size="xs" variant="outline">
                    Value params
                  </Badge>
                </Table.Td>
                <Table.Td>Copied to stack (no keyword needed)</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Badge size="xs" variant="outline">
                    Reference params
                  </Badge>
                </Table.Td>
                <Table.Td>
                  calldata (read-only) or memory (mutable) required
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Badge size="xs" variant="outline">
                    Local ref vars
                  </Badge>
                </Table.Td>
                <Table.Td>
                  memory (default) or storage (state reference)
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Badge size="xs" variant="outline">
                    Mappings
                  </Badge>
                </Table.Td>
                <Table.Td>
                  Only in storage — cannot be in memory or calldata
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
