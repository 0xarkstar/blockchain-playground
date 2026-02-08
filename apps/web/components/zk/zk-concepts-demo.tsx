"use client";

import { useState } from "react";
import {
  Stack,
  Paper,
  Button,
  Table,
  Badge,
  Group,
  Text,
  Alert,
  NumberInput,
  Progress,
} from "@mantine/core";
import { IconInfoCircle, IconCheck, IconX } from "@tabler/icons-react";
import {
  simulateAliBabaCave,
  calculateSoundness,
  getZKProperties,
  type CaveSimulation,
} from "../../lib/zk/proof-concepts";
import { EducationPanel } from "../shared";

export function ZKConceptsDemo() {
  const [numRounds, setNumRounds] = useState(5);
  const [hasSecret, setHasSecret] = useState(true);
  const [simulation, setSimulation] = useState<CaveSimulation | null>(null);

  const properties = getZKProperties();

  const soundness = calculateSoundness(numRounds);
  const cheatingProb = (soundness * 100).toFixed(soundness < 0.01 ? 4 : 2);

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        The Ali Baba Cave analogy explains ZK proofs without math. A cave has
        two paths (A and B) connected by a magic door. The prover enters one
        side; the verifier asks them to exit from a specific side.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Three Properties of ZK Proofs
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Property</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Example</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {properties.map((prop) => (
                <Table.Tr key={prop.name}>
                  <Table.Td>
                    <Badge variant="light">{prop.name}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{prop.description}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {prop.example}
                    </Text>
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
            Ali Baba Cave Simulation
          </Text>
          <Group grow>
            <NumberInput
              label="Rounds"
              value={numRounds}
              onChange={(v) => setNumRounds(Number(v) || 1)}
              min={1}
              max={20}
            />
          </Group>
          <Group>
            <Button
              onClick={() => {
                setHasSecret(true);
                setSimulation(simulateAliBabaCave(true, numRounds));
              }}
              variant={hasSecret ? "filled" : "light"}
              color="green"
            >
              Prover Knows Secret
            </Button>
            <Button
              onClick={() => {
                setHasSecret(false);
                setSimulation(simulateAliBabaCave(false, numRounds));
              }}
              variant={!hasSecret ? "filled" : "light"}
              color="red"
            >
              Prover is Cheating
            </Button>
          </Group>
          <Text size="sm" c="dimmed">
            Cheating probability after {numRounds} round(s): {cheatingProb}%
          </Text>
          <Progress value={100 - soundness * 100} color="green" size="lg" />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            SNARK vs STARK Comparison
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Feature</Table.Th>
                <Table.Th>SNARK</Table.Th>
                <Table.Th>STARK</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Trusted Setup</Table.Td>
                <Table.Td>
                  <Badge color="red" variant="light" size="sm">
                    Required
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color="green" variant="light" size="sm">
                    Not needed
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Proof Size</Table.Td>
                <Table.Td>
                  <Badge color="green" variant="light" size="sm">
                    ~200 bytes
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color="red" variant="light" size="sm">
                    ~50 KB
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Verification Time</Table.Td>
                <Table.Td>
                  <Badge color="green" variant="light" size="sm">
                    ~10ms
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color="yellow" variant="light" size="sm">
                    ~50ms
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Quantum Resistant</Table.Td>
                <Table.Td>
                  <Badge color="red" variant="light" size="sm">
                    No
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color="green" variant="light" size="sm">
                    Yes
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Prover Time</Table.Td>
                <Table.Td>
                  <Badge color="yellow" variant="light" size="sm">
                    Moderate
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color="green" variant="light" size="sm">
                    Fast
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Used In</Table.Td>
                <Table.Td>Zcash, zkSync, Tornado Cash</Table.Td>
                <Table.Td>StarkNet, Cairo, dYdX</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <EducationPanel
        howItWorks={[
          {
            title: "Interactive Proof System",
            description:
              "A prover convinces a verifier of a statement through a series of rounds without revealing the secret.",
          },
          {
            title: "Soundness via Repetition",
            description:
              "Each round halves the chance of cheating. After n rounds, cheating probability is (1/2)^n.",
          },
          {
            title: "Non-Interactive Proofs",
            description:
              "Fiat-Shamir heuristic converts interactive proofs into non-interactive ones using hash functions.",
          },
        ]}
        whyItMatters="Zero-knowledge proofs enable privacy-preserving verification on public blockchains. They power private transactions (Zcash), scalable computation (zkRollups), and anonymous credentials."
        tips={[
          "SNARKs offer small proofs but need trusted setup",
          "STARKs are quantum-resistant with no trusted setup",
          "More rounds = higher confidence = lower cheating probability",
        ]}
      />

      {simulation && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Results
              </Text>
              <Badge
                variant="light"
                color={simulation.allPassed ? "green" : "red"}
              >
                {simulation.allPassed ? "All Passed" : "Failed"}
              </Badge>
            </Group>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Round</Table.Th>
                  <Table.Th>Path Entered</Table.Th>
                  <Table.Th>Verifier Asks</Table.Th>
                  <Table.Th>Result</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {simulation.rounds.map((round) => (
                  <Table.Tr key={round.round}>
                    <Table.Td>{round.round}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="sm">
                        Path {round.pathChosen}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="sm" color="blue">
                        Exit {round.verifierAsks}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {round.success ? (
                        <IconCheck size={16} color="green" />
                      ) : (
                        <IconX size={16} color="red" />
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
