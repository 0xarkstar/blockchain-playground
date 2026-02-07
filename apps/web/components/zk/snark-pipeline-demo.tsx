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
import { IconInfoCircle, IconAlertTriangle } from "@tabler/icons-react";
import { getFullPipeline, type FullPipelineResult } from "../../lib/zk/snark";

export function SNARKPipelineDemo() {
  const [expression, setExpression] = useState("x * y");
  const [xVal, setXVal] = useState(3);
  const [yVal, setYVal] = useState(4);
  const [zVal, setZVal] = useState(0);
  const [result, setResult] = useState<FullPipelineResult | null>(null);
  const p = 23n;

  const handleRun = () => {
    const vars = expression.match(/[a-zA-Z_]+/g) ?? [];
    const uniqueVars = [...new Set(vars)];
    const inputs: Record<string, bigint> = {};
    if (uniqueVars.includes("x")) inputs.x = BigInt(xVal);
    if (uniqueVars.includes("y")) inputs.y = BigInt(yVal);
    if (uniqueVars.includes("z")) inputs.z = BigInt(zVal);
    setResult(getFullPipeline(expression, inputs, p));
  };

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        Full SNARK pipeline: Expression → Circuit → R1CS → QAP → Trusted Setup →
        Proof → Verify. This is a simplified simulation over a small field
        (p=23).
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Configure
          </Text>
          <TextInput
            label="Arithmetic expression"
            value={expression}
            onChange={(e) => {
              setExpression(e.currentTarget.value);
              setResult(null);
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
            Run Full Pipeline
          </Button>
        </Stack>
      </Paper>

      {result && (
        <>
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Result
                </Text>
                <Badge
                  variant="light"
                  color={result.verified ? "green" : "red"}
                >
                  {result.verified ? "Proof Verified" : "Verification Failed"}
                </Badge>
              </Group>
              <Text size="sm">
                Output: <Code>{result.output.toString()}</Code> (mod{" "}
                {p.toString()})
              </Text>
            </Stack>
          </Paper>

          {result.steps.map((step, i) => (
            <Paper key={i} p="md" withBorder>
              <Stack gap="sm">
                <Text size="sm" fw={600}>
                  {step.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {step.description}
                </Text>
                {step.warning && (
                  <Alert
                    icon={<IconAlertTriangle size={14} />}
                    variant="light"
                    color="yellow"
                    p="xs"
                  >
                    <Text size="xs">{step.warning}</Text>
                  </Alert>
                )}
                <Table>
                  <Table.Tbody>
                    {Object.entries(step.data).map(([key, val]) => (
                      <Table.Tr key={key}>
                        <Table.Td>
                          <Text size="sm">{key}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Code>
                            {Array.isArray(val) ? val.join(", ") : String(val)}
                          </Code>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          ))}

          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                Proof Components
              </Text>
              <Table>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>π_A</Table.Td>
                    <Table.Td>
                      <Code>{result.proof.piA.toString()}</Code>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>π_B</Table.Td>
                    <Table.Td>
                      <Code>{result.proof.piB.toString()}</Code>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>π_C</Table.Td>
                    <Table.Td>
                      <Code>{result.proof.piC.toString()}</Code>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
}
