"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  Select,
  TextInput,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  getSolidityTypeInfo,
  encodeValue,
  getAllSolidityTypes,
} from "../../lib/solidity/types";

export function DataTypesDemo() {
  const allTypes = useMemo(() => getAllSolidityTypes(), []);
  const typeNames = useMemo(() => allTypes.map((t) => t.name), [allTypes]);

  const [selectedType, setSelectedType] = useState("uint256");
  const [inputValue, setInputValue] = useState("42");

  const typeInfo = useMemo(
    () => getSolidityTypeInfo(selectedType),
    [selectedType]
  );

  const encoded = useMemo(
    () => encodeValue(inputValue, selectedType),
    [inputValue, selectedType]
  );

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Input</Text>
          <Group grow>
            <Select
              label="Solidity Type"
              data={typeNames}
              value={selectedType}
              onChange={(v) => {
                if (v) {
                  setSelectedType(v);
                  const info = getSolidityTypeInfo(v);
                  setInputValue(info?.defaultValue ?? "0");
                }
              }}
              searchable
            />
            <TextInput
              label="Value"
              value={inputValue}
              onChange={(e) => setInputValue(e.currentTarget.value)}
            />
          </Group>
        </Stack>
      </Paper>

      {typeInfo && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>Type Info</Text>
            <Table>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>Category</Table.Td>
                  <Table.Td ta="right">
                    <Badge variant="light">{typeInfo.category}</Badge>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Size</Table.Td>
                  <Table.Td ta="right">{typeInfo.size} bytes ({typeInfo.bits} bits)</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Signed</Table.Td>
                  <Table.Td ta="right">
                    <Badge color={typeInfo.signed ? "yellow" : "gray"} variant="light">
                      {typeInfo.signed ? "Yes" : "No"}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Min</Table.Td>
                  <Table.Td ta="right">
                    <Code style={{ fontSize: 11 }}>
                      {typeInfo.min.length > 40 ? typeInfo.min.slice(0, 20) + "..." : typeInfo.min}
                    </Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Max</Table.Td>
                  <Table.Td ta="right">
                    <Code style={{ fontSize: 11 }}>
                      {typeInfo.max.length > 40 ? typeInfo.max.slice(0, 20) + "..." : typeInfo.max}
                    </Code>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Encoded Value</Text>
          {encoded.valid ? (
            <Table>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>Hex</Table.Td>
                  <Table.Td ta="right"><Code>{encoded.hex}</Code></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Padded (32 bytes)</Table.Td>
                  <Table.Td ta="right">
                    <Code style={{ fontSize: 11, wordBreak: "break-all" }}>{encoded.paddedHex}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Decimal</Table.Td>
                  <Table.Td ta="right"><Code>{encoded.decimal}</Code></Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          ) : (
            <Alert icon={<IconInfoCircle size={16} />} color="red">
              {encoded.error}
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>All Types Reference</Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Type</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th ta="right">Size</Table.Th>
                <Table.Th ta="right">Bits</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {allTypes.map((t) => (
                <Table.Tr key={t.name}>
                  <Table.Td>
                    <Code>{t.name}</Code>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" variant="light">{t.category}</Badge>
                  </Table.Td>
                  <Table.Td ta="right">{t.size}B</Table.Td>
                  <Table.Td ta="right">{t.bits}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
