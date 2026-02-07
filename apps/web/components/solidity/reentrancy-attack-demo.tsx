"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  NumberInput,
  SegmentedControl,
  Stepper,
  Table,
  Badge,
  Group,
  Text,
  Alert,
  Code,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  simulateReentrancyAttack,
  simulateWithReentrancyGuard,
  simulateChecksEffectsInteractions,
} from "../../lib/solidity/security";

type Defense = "vulnerable" | "guard" | "cei";

const DEFENSES: { value: Defense; label: string }[] = [
  { value: "vulnerable", label: "Vulnerable" },
  { value: "guard", label: "ReentrancyGuard" },
  { value: "cei", label: "CEI Pattern" },
];

export function ReentrancyAttackDemo() {
  const [victimBalance, setVictimBalance] = useState<number>(100);
  const [attackerDeposit, setAttackerDeposit] = useState<number>(10);
  const [maxDepth, setMaxDepth] = useState<number>(5);
  const [defense, setDefense] = useState<Defense>("vulnerable");

  const simulation = useMemo(() => {
    switch (defense) {
      case "vulnerable":
        return simulateReentrancyAttack(victimBalance, attackerDeposit, maxDepth);
      case "guard":
        return simulateWithReentrancyGuard(victimBalance, attackerDeposit);
      case "cei":
        return simulateChecksEffectsInteractions(victimBalance, attackerDeposit);
    }
  }, [victimBalance, attackerDeposit, maxDepth, defense]);

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Configuration</Text>
          <SegmentedControl
            data={DEFENSES}
            value={defense}
            onChange={(v) => setDefense(v as Defense)}
            fullWidth
          />
          <Group grow>
            <NumberInput
              label="Victim Balance (ETH)"
              value={victimBalance}
              onChange={(v) => setVictimBalance(Number(v) || 0)}
              min={0}
            />
            <NumberInput
              label="Attacker Deposit (ETH)"
              value={attackerDeposit}
              onChange={(v) => setAttackerDeposit(Number(v) || 0)}
              min={0}
            />
            {defense === "vulnerable" && (
              <NumberInput
                label="Max Reentrancy Depth"
                value={maxDepth}
                onChange={(v) => setMaxDepth(Number(v) || 1)}
                min={1}
                max={10}
              />
            )}
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>Result</Text>
            <Badge
              size="lg"
              color={simulation.attackSuccessful ? "red" : "green"}
            >
              {simulation.attackSuccessful ? "ATTACK SUCCESSFUL" : "ATTACK BLOCKED"}
            </Badge>
          </Group>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th />
                <Table.Th ta="right">Before</Table.Th>
                <Table.Th ta="right">After</Table.Th>
                <Table.Th ta="right">Change</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Victim Contract</Table.Td>
                <Table.Td ta="right">{simulation.initialBalances.victim} ETH</Table.Td>
                <Table.Td ta="right">{simulation.finalBalances.victim} ETH</Table.Td>
                <Table.Td ta="right">
                  <Badge
                    color={simulation.finalBalances.victim < simulation.initialBalances.victim ? "red" : "gray"}
                    variant="light"
                  >
                    {simulation.finalBalances.victim - simulation.initialBalances.victim} ETH
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Attacker</Table.Td>
                <Table.Td ta="right">{simulation.initialBalances.attacker} ETH</Table.Td>
                <Table.Td ta="right">{simulation.finalBalances.attacker} ETH</Table.Td>
                <Table.Td ta="right">
                  <Badge
                    color={simulation.attackerProfit > 0 ? "red" : "green"}
                    variant="light"
                  >
                    {simulation.attackerProfit > 0 ? "+" : ""}{simulation.attackerProfit} ETH
                  </Badge>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          {simulation.totalReentrancyDepth > 0 && (
            <Text size="xs" c="dimmed">
              Reentrancy depth: {simulation.totalReentrancyDepth}
            </Text>
          )}
        </Stack>
      </Paper>

      {simulation.frames.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>Call Trace</Text>
            <Stepper
              active={simulation.frames.length}
              orientation="vertical"
              size="xs"
            >
              {simulation.frames.map((frame) => (
                <Stepper.Step
                  key={frame.id}
                  label={
                    <Group gap="xs">
                      <Badge
                        size="xs"
                        color={
                          frame.status === "reverted" ? "red" :
                          frame.status === "success" ? "green" : "yellow"
                        }
                      >
                        {frame.status}
                      </Badge>
                      <Code style={{ fontSize: 11 }}>
                        {frame.caller} → {frame.target}.{frame.functionName}()
                      </Code>
                      {frame.ethValue > 0 && (
                        <Badge size="xs" variant="light">{frame.ethValue} ETH</Badge>
                      )}
                    </Group>
                  }
                  description={
                    <Text size="xs" c="dimmed" ml={frame.depth * 16}>
                      {"  ".repeat(frame.depth)}{frame.description}
                    </Text>
                  }
                  color={frame.status === "reverted" ? "red" : "green"}
                />
              ))}
            </Stepper>
          </Stack>
        </Paper>
      )}

      <Alert
        icon={<IconInfoCircle size={16} />}
        color={defense === "vulnerable" ? "red" : "green"}
        variant="light"
      >
        {defense === "vulnerable" && (
          <>
            <Text fw={600}>Vulnerable Pattern</Text>
            <Text size="sm">
              The withdraw function sends ETH before updating the balance.
              The attacker&apos;s receive() function re-calls withdraw(), draining the contract.
            </Text>
          </>
        )}
        {defense === "guard" && (
          <>
            <Text fw={600}>ReentrancyGuard (OpenZeppelin)</Text>
            <Text size="sm">
              A mutex lock prevents re-entering the function. The second withdraw()
              call reverts because the lock is still held.
            </Text>
          </>
        )}
        {defense === "cei" && (
          <>
            <Text fw={600}>Checks-Effects-Interactions (CEI)</Text>
            <Text size="sm">
              Update state (set balance to 0) BEFORE sending ETH. When the attacker
              re-enters, the check fails because balance is already 0.
            </Text>
          </>
        )}
      </Alert>
    </Stack>
  );
}
