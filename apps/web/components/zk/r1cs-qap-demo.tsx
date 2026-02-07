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
  TextInput,
  NumberInput,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  parseExpression,
  gatesToR1CS,
  computeWitness,
} from "../../lib/zk/circuit";
import {
  r1csToQAP,
  verifyQAP,
  formatPolynomial,
  type QAPVerification,
} from "../../lib/zk/polynomial";

export function R1CSQAPDemo() {
  const [expression, setExpression] = useState("x * y");
  const [xVal, setXVal] = useState(3);
  const [yVal, setYVal] = useState(4);
  const [zVal, setZVal] = useState(0);
  const [qapResult, setQapResult] = useState<QAPVerification | null>(null);
  const [wireNames, setWireNames] = useState<readonly string[]>([]);
  const [polys, setPolys] = useState<{
    Ai: readonly (readonly bigint[])[];
    Bi: readonly (readonly bigint[])[];
    Ci: readonly (readonly bigint[])[];
    target: readonly bigint[];
  } | null>(null);
  const p = 23n;

  const handleRun = () => {
    const gates = parseExpression(expression);
    if (gates.length === 0) return;

    // Detect variables
    const vars = new Set<string>();
    for (const g of gates) {
      if (!/^\d+$/.test(g.left) && !g.left.startsWith("_")) vars.add(g.left);
      if (!/^\d+$/.test(g.right) && !g.right.startsWith("_")) vars.add(g.right);
    }
    const inputs: Record<string, bigint> = {};
    if (vars.has("x")) inputs.x = BigInt(xVal);
    if (vars.has("y")) inputs.y = BigInt(yVal);
    if (vars.has("z")) inputs.z = BigInt(zVal);

    const witness = computeWitness(gates, inputs, p);
    const r1cs = gatesToR1CS(gates, p);
    const qap = r1csToQAP(r1cs, p);
    const result = verifyQAP(qap, witness.wireVector, p, 7n);

    setWireNames(r1cs.wireNames);
    setPolys({ Ai: qap.Ai, Bi: qap.Bi, Ci: qap.Ci, target: qap.target });
    setQapResult(result);
  };

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        R1CS → QAP: interpolate constraint matrices into polynomials. Then
        verify A(x)*B(x) - C(x) = H(x)*T(x), turning discrete constraint checks
        into a single polynomial divisibility check.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Expression
          </Text>
          <TextInput
            label="Arithmetic expression"
            value={expression}
            onChange={(e) => {
              setExpression(e.currentTarget.value);
              setQapResult(null);
            }}
          />
          <Group grow>
            <NumberInput
              label="x"
              value={xVal}
              onChange={(v) => setXVal(Number(v) || 0)}
              min={0}
              max={22}
            />
            <NumberInput
              label="y"
              value={yVal}
              onChange={(v) => setYVal(Number(v) || 0)}
              min={0}
              max={22}
            />
            <NumberInput
              label="z"
              value={zVal}
              onChange={(v) => setZVal(Number(v) || 0)}
              min={0}
              max={22}
            />
          </Group>
          <Button onClick={handleRun} variant="light">
            R1CS → QAP → Verify
          </Button>
        </Stack>
      </Paper>

      {polys && wireNames.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              QAP Polynomials
            </Text>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Wire</Table.Th>
                  <Table.Th>A_i(x)</Table.Th>
                  <Table.Th>B_i(x)</Table.Th>
                  <Table.Th>C_i(x)</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {wireNames.map((w, i) => (
                  <Table.Tr key={w}>
                    <Table.Td>
                      <Code>{w}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Code>{formatPolynomial(polys.Ai[i] ?? [0n])}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Code>{formatPolynomial(polys.Bi[i] ?? [0n])}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Code>{formatPolynomial(polys.Ci[i] ?? [0n])}</Code>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            <Text size="sm">
              Target T(x) = <Code>{formatPolynomial(polys.target)}</Code>
            </Text>
          </Stack>
        </Paper>
      )}

      {qapResult && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Verification at x = 7
              </Text>
              <Badge
                variant="light"
                color={qapResult.verified ? "green" : "red"}
              >
                {qapResult.verified ? "QAP Verified" : "QAP Failed"}
              </Badge>
            </Group>
            <Table>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>A(7)</Table.Td>
                  <Table.Td>
                    <Code>{qapResult.Ax.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>B(7)</Table.Td>
                  <Table.Td>
                    <Code>{qapResult.Bx.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>C(7)</Table.Td>
                  <Table.Td>
                    <Code>{qapResult.Cx.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>A*B - C (mod p)</Table.Td>
                  <Table.Td>
                    <Code>{qapResult.lhs.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>H(7) * T(7) (mod p)</Table.Td>
                  <Table.Td>
                    <Code>{qapResult.rhs.toString()}</Code>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
