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
import {
  generateSchnorrKeys,
  runProtocol,
  type SchnorrProtocolResult,
} from "../../lib/zk/schnorr";
import { getSchnorrField } from "../../lib/zk/field";

export function SchnorrProtocolDemo() {
  const [numRounds, setNumRounds] = useState(3);
  const [result, setResult] = useState<SchnorrProtocolResult | null>(null);
  const params = getSchnorrField();

  const handleRun = () => {
    const keys = generateSchnorrKeys(params);
    setResult(runProtocol(params, keys, numRounds));
  };

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        Schnorr&apos;s sigma protocol: prove &quot;I know x such that y = g^x
        mod p&quot; without revealing x. Uses field p=23, subgroup generator
        g=2, order q=11.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Protocol Parameters
          </Text>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Prime p</Table.Td>
                <Table.Td>
                  <Code>23</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Generator g</Table.Td>
                <Table.Td>
                  <Code>2</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Subgroup order q</Table.Td>
                <Table.Td>
                  <Code>11</Code>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Run Protocol
          </Text>
          <NumberInput
            label="Number of rounds"
            value={numRounds}
            onChange={(v) => setNumRounds(Number(v) || 1)}
            min={1}
            max={10}
          />
          <Button onClick={handleRun} variant="light">
            Generate Keys & Run
          </Button>
        </Stack>
      </Paper>

      {result && (
        <>
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                Keys
              </Text>
              <Group>
                <Text size="sm">
                  Secret key x = <Code>{result.keys.secretKey.toString()}</Code>
                </Text>
                <Text size="sm">
                  Public key y = g^x ={" "}
                  <Code>{result.keys.publicKey.toString()}</Code>
                </Text>
              </Group>
              <Badge
                variant="light"
                color={result.allVerified ? "green" : "red"}
              >
                {result.allVerified
                  ? "All rounds verified"
                  : "Verification failed"}
              </Badge>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                Round Details
              </Text>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>R = g^r</Table.Th>
                    <Table.Th>Challenge e</Table.Th>
                    <Table.Th>Response s</Table.Th>
                    <Table.Th>g^s</Table.Th>
                    <Table.Th>R*y^e</Table.Th>
                    <Table.Th>Valid</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {result.rounds.map((round) => (
                    <Table.Tr key={round.round}>
                      <Table.Td>{round.round}</Table.Td>
                      <Table.Td>
                        <Code>{round.commitment.toString()}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Code>{round.challenge.toString()}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Code>{round.response.toString()}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Code>{round.lhs.toString()}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Code>{round.rhs.toString()}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          variant="light"
                          color={round.verified ? "green" : "red"}
                        >
                          {round.verified ? "Yes" : "No"}
                        </Badge>
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
                Protocol Visualization
              </Text>
              <svg
                width="100%"
                height={result.rounds.length * 130 + 60}
                viewBox={`0 0 460 ${result.rounds.length * 130 + 60}`}
              >
                <rect
                  x={40}
                  y={10}
                  width={100}
                  height={30}
                  rx={6}
                  fill="var(--mantine-color-blue-light)"
                  stroke="var(--mantine-color-blue-6)"
                  strokeWidth={1.5}
                />
                <text
                  x={90}
                  y={30}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="var(--mantine-color-blue-9)"
                >
                  Prover
                </text>
                <rect
                  x={320}
                  y={10}
                  width={100}
                  height={30}
                  rx={6}
                  fill="var(--mantine-color-green-light)"
                  stroke="var(--mantine-color-green-6)"
                  strokeWidth={1.5}
                />
                <text
                  x={370}
                  y={30}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="var(--mantine-color-green-9)"
                >
                  Verifier
                </text>
                <line
                  x1={90}
                  y1={40}
                  x2={90}
                  y2={result.rounds.length * 130 + 50}
                  stroke="var(--mantine-color-blue-3)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <line
                  x1={370}
                  y1={40}
                  x2={370}
                  y2={result.rounds.length * 130 + 50}
                  stroke="var(--mantine-color-green-3)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                {result.rounds.map((round, i) => {
                  const baseY = 60 + i * 130;
                  return (
                    <g key={round.round}>
                      <text
                        x={10}
                        y={baseY + 20}
                        fontSize={10}
                        fill="var(--mantine-color-dimmed)"
                      >
                        R{round.round}
                      </text>
                      <line
                        x1={100}
                        y1={baseY + 15}
                        x2={310}
                        y2={baseY + 15}
                        stroke="var(--mantine-color-blue-5)"
                        strokeWidth={1.5}
                        markerEnd="url(#schnorr-arrow)"
                      />
                      <text
                        x={200}
                        y={baseY + 10}
                        textAnchor="middle"
                        fontSize={10}
                        fill="var(--mantine-color-blue-7)"
                      >
                        R = g^r = {round.commitment.toString()}
                      </text>
                      <line
                        x1={310}
                        y1={baseY + 55}
                        x2={100}
                        y2={baseY + 55}
                        stroke="var(--mantine-color-green-5)"
                        strokeWidth={1.5}
                        markerEnd="url(#schnorr-arrow-rev)"
                      />
                      <text
                        x={200}
                        y={baseY + 50}
                        textAnchor="middle"
                        fontSize={10}
                        fill="var(--mantine-color-green-7)"
                      >
                        e = {round.challenge.toString()}
                      </text>
                      <line
                        x1={100}
                        y1={baseY + 95}
                        x2={310}
                        y2={baseY + 95}
                        stroke="var(--mantine-color-blue-5)"
                        strokeWidth={1.5}
                        markerEnd="url(#schnorr-arrow)"
                      />
                      <text
                        x={200}
                        y={baseY + 90}
                        textAnchor="middle"
                        fontSize={10}
                        fill="var(--mantine-color-blue-7)"
                      >
                        s = {round.response.toString()}
                      </text>
                      <text
                        x={380}
                        y={baseY + 105}
                        fontSize={10}
                        fill={
                          round.verified
                            ? "var(--mantine-color-green-7)"
                            : "var(--mantine-color-red-7)"
                        }
                      >
                        {round.verified ? "OK" : "FAIL"}
                      </text>
                    </g>
                  );
                })}
                <defs>
                  <marker
                    id="schnorr-arrow"
                    markerWidth="8"
                    markerHeight="6"
                    refX="8"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      fill="var(--mantine-color-blue-5)"
                    />
                  </marker>
                  <marker
                    id="schnorr-arrow-rev"
                    markerWidth="8"
                    markerHeight="6"
                    refX="8"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      fill="var(--mantine-color-green-5)"
                    />
                  </marker>
                </defs>
              </svg>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                Protocol Steps
              </Text>
              <Table>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>
                      <Badge variant="light" size="sm">
                        1
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      Prover picks random r, sends R = g^r mod p
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Badge variant="light" size="sm" color="blue">
                        2
                      </Badge>
                    </Table.Td>
                    <Table.Td>Verifier sends random challenge e</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Badge variant="light" size="sm" color="yellow">
                        3
                      </Badge>
                    </Table.Td>
                    <Table.Td>Prover responds s = (r + e*x) mod q</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Badge variant="light" size="sm" color="green">
                        4
                      </Badge>
                    </Table.Td>
                    <Table.Td>Verifier checks: g^s ≡ R * y^e (mod p)</Table.Td>
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
