"use client";

import { useState } from "react";
import {
  Stack, Paper, Button, Table, Badge, Group, Text, Alert, NumberInput, Progress,
} from "@mantine/core";
import { IconInfoCircle, IconCheck, IconX } from "@tabler/icons-react";
import {
  simulateAliBabaCave,
  calculateSoundness,
  getZKProperties,
  type CaveSimulation,
} from "../../lib/zk/proof-concepts";

export function ZKConceptsDemo() {
  const [numRounds, setNumRounds] = useState(5);
  const [hasSecret, setHasSecret] = useState(true);
  const [simulation, setSimulation] = useState<CaveSimulation | null>(null);

  const properties = getZKProperties();

  const handleSimulate = () => {
    setSimulation(simulateAliBabaCave(hasSecret, numRounds));
  };

  const soundness = calculateSoundness(numRounds);
  const cheatingProb = (soundness * 100).toFixed(
    soundness < 0.01 ? 4 : 2
  );

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        The Ali Baba Cave analogy explains ZK proofs without math.
        A cave has two paths (A and B) connected by a magic door.
        The prover enters one side; the verifier asks them to exit from a specific side.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Three Properties of ZK Proofs</Text>
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
                  <Table.Td><Text size="sm">{prop.description}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{prop.example}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Ali Baba Cave Simulation</Text>
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
              onClick={() => { setHasSecret(true); setSimulation(simulateAliBabaCave(true, numRounds)); }}
              variant={hasSecret ? "filled" : "light"}
              color="green"
            >
              Prover Knows Secret
            </Button>
            <Button
              onClick={() => { setHasSecret(false); setSimulation(simulateAliBabaCave(false, numRounds)); }}
              variant={!hasSecret ? "filled" : "light"}
              color="red"
            >
              Prover is Cheating
            </Button>
          </Group>
          <Text size="sm" c="dimmed">
            Cheating probability after {numRounds} round(s): {cheatingProb}%
          </Text>
          <Progress
            value={100 - soundness * 100}
            color="green"
            size="lg"
          />
        </Stack>
      </Paper>

      {simulation && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" fw={600}>Results</Text>
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
