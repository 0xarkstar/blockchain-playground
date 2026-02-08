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
  Select,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  parseExpression,
  computeWitness,
  gatesToR1CS,
  verifySatisfaction,
  getPresetExpressions,
  type WitnessResult,
} from "../../lib/zk/circuit";

export function ArithmeticCircuitsDemo() {
  const presets = getPresetExpressions();
  const [expression, setExpression] = useState(presets[0].expression);
  const [inputValues, setInputValues] = useState<Record<string, number>>({
    x: 3,
    y: 4,
  });
  const [witnessResult, setWitnessResult] = useState<WitnessResult | null>(
    null,
  );
  const p = 23n;

  const handlePresetChange = (presetName: string | null) => {
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;
    setExpression(preset.expression);
    const inputs: Record<string, number> = {};
    for (const [k, v] of Object.entries(preset.suggestedInputs)) {
      inputs[k] = Number(v);
    }
    setInputValues(inputs);
    setWitnessResult(null);
  };

  const handleCompute = () => {
    const gates = parseExpression(expression);
    if (gates.length === 0) return;
    const bigInputs: Record<string, bigint> = {};
    for (const [k, v] of Object.entries(inputValues)) {
      bigInputs[k] = BigInt(v);
    }
    setWitnessResult(computeWitness(gates, bigInputs, p));
  };

  const gates = parseExpression(expression);
  const variables = new Set<string>();
  for (const g of gates) {
    if (!/^\d+$/.test(g.left) && !g.left.startsWith("_")) variables.add(g.left);
    if (!/^\d+$/.test(g.right) && !g.right.startsWith("_"))
      variables.add(g.right);
  }

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        An arithmetic circuit expresses computation as addition and
        multiplication gates over a finite field (p=23). This is the first step
        in building a SNARK.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Expression
          </Text>
          <Select
            label="Preset"
            data={presets.map((p) => ({
              value: p.name,
              label: `${p.name}: ${p.expression}`,
            }))}
            onChange={handlePresetChange}
            placeholder="Choose a preset..."
          />
          <TextInput
            label="Custom expression"
            value={expression}
            onChange={(e) => {
              setExpression(e.currentTarget.value);
              setWitnessResult(null);
            }}
            description="Operators: + * ( ) — Variables: a-z — Constants: 0-9"
          />
        </Stack>
      </Paper>

      {gates.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Gates ({gates.length})
            </Text>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Operation</Table.Th>
                  <Table.Th>Output</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {gates.map((g, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{i + 1}</Table.Td>
                    <Table.Td>
                      <Code>
                        {g.left} {g.op === "mul" ? "*" : "+"} {g.right}
                      </Code>
                    </Table.Td>
                    <Table.Td>
                      <Code>{g.output}</Code>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      )}

      {gates.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Circuit Diagram
            </Text>
            <svg
              width="100%"
              height={Math.max(120, gates.length * 80 + 40)}
              viewBox={`0 0 420 ${Math.max(120, gates.length * 80 + 40)}`}
            >
              {gates.map((g, i) => {
                const y = 30 + i * 80;
                const isMul = g.op === "mul";
                return (
                  <g key={i}>
                    <rect
                      x={30}
                      y={y}
                      width={80}
                      height={30}
                      rx={4}
                      fill="var(--mantine-color-blue-light)"
                      stroke="var(--mantine-color-blue-5)"
                      strokeWidth={1}
                    />
                    <text
                      x={70}
                      y={y + 19}
                      textAnchor="middle"
                      fontSize={11}
                      fill="var(--mantine-color-blue-9)"
                    >
                      {g.left}
                    </text>
                    <line
                      x1={110}
                      y1={y + 15}
                      x2={160}
                      y2={y + 15}
                      stroke="var(--mantine-color-gray-5)"
                      strokeWidth={1.5}
                    />
                    <rect
                      x={130}
                      y={y}
                      width={80}
                      height={30}
                      rx={4}
                      fill="var(--mantine-color-violet-light)"
                      stroke="var(--mantine-color-violet-5)"
                      strokeWidth={1}
                    />
                    <text
                      x={170}
                      y={y + 19}
                      textAnchor="middle"
                      fontSize={11}
                      fill="var(--mantine-color-violet-9)"
                    >
                      {g.right}
                    </text>
                    <line
                      x1={210}
                      y1={y + 15}
                      x2={240}
                      y2={y + 15}
                      stroke="var(--mantine-color-gray-5)"
                      strokeWidth={1.5}
                    />
                    <circle
                      cx={260}
                      cy={y + 15}
                      r={18}
                      fill={
                        isMul
                          ? "var(--mantine-color-orange-light)"
                          : "var(--mantine-color-teal-light)"
                      }
                      stroke={
                        isMul
                          ? "var(--mantine-color-orange-6)"
                          : "var(--mantine-color-teal-6)"
                      }
                      strokeWidth={1.5}
                    />
                    <text
                      x={260}
                      y={y + 20}
                      textAnchor="middle"
                      fontSize={16}
                      fontWeight={700}
                      fill={
                        isMul
                          ? "var(--mantine-color-orange-9)"
                          : "var(--mantine-color-teal-9)"
                      }
                    >
                      {isMul ? "\u00d7" : "+"}
                    </text>
                    <line
                      x1={278}
                      y1={y + 15}
                      x2={310}
                      y2={y + 15}
                      stroke="var(--mantine-color-gray-5)"
                      strokeWidth={1.5}
                    />
                    <rect
                      x={310}
                      y={y}
                      width={80}
                      height={30}
                      rx={4}
                      fill="var(--mantine-color-green-light)"
                      stroke="var(--mantine-color-green-5)"
                      strokeWidth={1}
                    />
                    <text
                      x={350}
                      y={y + 19}
                      textAnchor="middle"
                      fontSize={11}
                      fill="var(--mantine-color-green-9)"
                    >
                      {g.output}
                    </text>
                  </g>
                );
              })}
            </svg>
          </Stack>
        </Paper>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Inputs (mod {p.toString()})
          </Text>
          <Group grow>
            {Array.from(variables).map((v) => (
              <NumberInput
                key={v}
                label={v}
                value={inputValues[v] ?? 0}
                onChange={(val) =>
                  setInputValues({ ...inputValues, [v]: Number(val) || 0 })
                }
                min={0}
                max={22}
              />
            ))}
          </Group>
          <Button onClick={handleCompute} variant="light">
            Compute Witness
          </Button>
        </Stack>
      </Paper>

      {witnessResult && (
        <>
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Witness
                </Text>
                <Badge
                  variant="light"
                  color={witnessResult.satisfied ? "green" : "red"}
                >
                  {witnessResult.satisfied
                    ? "R1CS Satisfied"
                    : "R1CS Not Satisfied"}
                </Badge>
              </Group>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Wire</Table.Th>
                    <Table.Th>Value</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Object.entries(witnessResult.values).map(([wire, val]) => (
                    <Table.Tr key={wire}>
                      <Table.Td>
                        <Code>{wire}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Code>{val.toString()}</Code>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                R1CS Constraints (A·w * B·w = C·w)
              </Text>
              {(() => {
                const r1cs = gatesToR1CS(gates, p);
                const checks = verifySatisfaction(
                  r1cs,
                  witnessResult.wireVector,
                  p,
                );
                return (
                  <Table striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>#</Table.Th>
                        <Table.Th>(A·w) * (B·w)</Table.Th>
                        <Table.Th>C·w</Table.Th>
                        <Table.Th>Satisfied</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {checks.map((c) => (
                        <Table.Tr key={c.index}>
                          <Table.Td>{c.index + 1}</Table.Td>
                          <Table.Td>
                            <Code>{c.lhs.toString()}</Code>
                          </Table.Td>
                          <Table.Td>
                            <Code>{c.rhs.toString()}</Code>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              size="sm"
                              variant="light"
                              color={c.satisfied ? "green" : "red"}
                            >
                              {c.satisfied ? "Yes" : "No"}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                );
              })()}
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
}
