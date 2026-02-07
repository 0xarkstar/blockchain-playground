"use client";

import { useState } from "react";
import {
  Stack,
  Paper,
  Button,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Alert,
  NumberInput,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { createPedersenParams } from "../../lib/zk/pedersen";
import {
  constructRangeProof,
  verifyRangeProof,
  decomposeToBits,
  type RangeProof,
} from "../../lib/zk/range-proof";

export function RangeProofDemo() {
  const params = createPedersenParams();
  const [value, setValue] = useState(5);
  const [numBits, setNumBits] = useState(4);
  const [proof, setProof] = useState<RangeProof | null>(null);

  const handleProve = () => {
    setProof(constructRangeProof(params, BigInt(value), numBits));
  };

  const maxValue = (1 << numBits) - 1;
  const bits = decomposeToBits(
    BigInt(Math.max(0, Math.min(value, maxValue))),
    numBits,
  );

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        Range proof: prove a committed value is in [0, 2^n) without revealing
        it. The value is decomposed into bits, each committed separately. The
        verifier checks each bit is 0 or 1, and the product reconstructs the
        original commitment.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Configure
          </Text>
          <Group grow>
            <NumberInput
              label={`Value (range: 0 to ${maxValue})`}
              value={value}
              onChange={(v) => setValue(Number(v) ?? 0)}
              min={-1}
              max={maxValue + 1}
            />
            <NumberInput
              label="Bit width (n)"
              value={numBits}
              onChange={(v) => setNumBits(Number(v) || 1)}
              min={1}
              max={8}
            />
          </Group>
          <Text size="sm" c="dimmed">
            Binary: {bits.slice().reverse().join("")} (value {value}, {numBits}
            -bit)
          </Text>
          <Button onClick={handleProve} variant="light">
            Generate Range Proof
          </Button>
        </Stack>
      </Paper>

      {proof && (
        <>
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Proof Result
                </Text>
                <Badge variant="light" color={proof.valid ? "green" : "red"}>
                  {proof.valid
                    ? "Valid — value in range"
                    : "Invalid — value out of range"}
                </Badge>
              </Group>
              {proof.valid && (
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Bit Position</Table.Th>
                      <Table.Th>Bit Value</Table.Th>
                      <Table.Th>Commitment</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {proof.bitCommitments.map((bc) => (
                      <Table.Tr key={bc.bitPosition}>
                        <Table.Td>2^{bc.bitPosition}</Table.Td>
                        <Table.Td>
                          <Badge
                            size="sm"
                            variant="light"
                            color={bc.bit === 1 ? "blue" : "gray"}
                          >
                            {bc.bit}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Code>{bc.commitment.commitment.toString()}</Code>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Paper>

          {proof.valid && (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Text size="sm" fw={600}>
                  Verification
                </Text>
                <Table>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>Total commitment</Table.Td>
                      <Table.Td>
                        <Code>{proof.totalCommitment.toString()}</Code>
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Reconstructed from bits</Table.Td>
                      <Table.Td>
                        <Code>{proof.reconstructed.toString()}</Code>
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Match</Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={verifyRangeProof(proof) ? "green" : "red"}
                        >
                          {verifyRangeProof(proof) ? "Yes" : "No"}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          )}
        </>
      )}
    </Stack>
  );
}
