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
import { ProgressPipeline, EducationPanel } from "../shared";

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

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            SNARK Pipeline
          </Text>
          <ProgressPipeline
            steps={[
              { id: "circuit", label: "Circuit" },
              { id: "r1cs", label: "R1CS" },
              { id: "qap", label: "QAP" },
              { id: "setup", label: "Setup" },
              { id: "prove", label: "Prove" },
              { id: "verify", label: "Verify" },
            ]}
            currentStepIndex={result ? 6 : 0}
          />
        </Stack>
      </Paper>

      <EducationPanel
        howItWorks={[
          {
            title: "Parse Expression into Circuit",
            description:
              "The arithmetic expression is decomposed into addition and multiplication gates.",
          },
          {
            title: "Circuit to R1CS",
            description:
              "Each gate becomes a Rank-1 Constraint: A*B = C using sparse vectors.",
          },
          {
            title: "R1CS to QAP",
            description:
              "Constraint vectors are interpolated into polynomials via Lagrange interpolation.",
          },
          {
            title: "Trusted Setup",
            description:
              "Generate CRS (common reference string) with toxic waste that must be destroyed.",
          },
          {
            title: "Prove",
            description:
              "The prover evaluates polynomials at a secret point to create a succinct proof.",
          },
          {
            title: "Verify",
            description:
              "The verifier checks the polynomial identity using bilinear pairings (simulated here).",
          },
        ]}
        whyItMatters="SNARKs compress arbitrary computation into constant-size proofs that can be verified in milliseconds, enabling scalable and private blockchain computation."
        tips={[
          "The trusted setup is a one-time ceremony — if compromised, fake proofs can be generated",
          "Real SNARKs use elliptic curve pairings; this demo simulates with modular arithmetic",
          "Groth16 produces the smallest proofs (~200 bytes) among SNARK constructions",
        ]}
      />

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
