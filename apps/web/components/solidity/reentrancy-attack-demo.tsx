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
import { EducationPanel } from "../../components/shared";

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
        return simulateReentrancyAttack(
          victimBalance,
          attackerDeposit,
          maxDepth,
        );
      case "guard":
        return simulateWithReentrancyGuard(victimBalance, attackerDeposit);
      case "cei":
        return simulateChecksEffectsInteractions(
          victimBalance,
          attackerDeposit,
        );
    }
  }, [victimBalance, attackerDeposit, maxDepth, defense]);

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Configuration
          </Text>
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
              onChange={(v) => setAttackerDeposit(Number(v) || 1)}
              min={1}
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
            <Text size="sm" fw={600}>
              Result
            </Text>
            <Badge
              size="lg"
              color={simulation.attackSuccessful ? "red" : "green"}
            >
              {simulation.attackSuccessful
                ? "ATTACK SUCCESSFUL"
                : "ATTACK BLOCKED"}
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
                <Table.Td ta="right">
                  {simulation.initialBalances.victim} ETH
                </Table.Td>
                <Table.Td ta="right">
                  {simulation.finalBalances.victim} ETH
                </Table.Td>
                <Table.Td ta="right">
                  <Badge
                    color={
                      simulation.finalBalances.victim <
                      simulation.initialBalances.victim
                        ? "red"
                        : "gray"
                    }
                    variant="light"
                  >
                    {simulation.finalBalances.victim -
                      simulation.initialBalances.victim}{" "}
                    ETH
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Attacker</Table.Td>
                <Table.Td ta="right">
                  {simulation.initialBalances.attacker} ETH
                </Table.Td>
                <Table.Td ta="right">
                  {simulation.finalBalances.attacker} ETH
                </Table.Td>
                <Table.Td ta="right">
                  <Badge
                    color={simulation.attackerProfit > 0 ? "red" : "green"}
                    variant="light"
                  >
                    {simulation.attackerProfit > 0 ? "+" : ""}
                    {simulation.attackerProfit} ETH
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

      {simulation.totalReentrancyDepth > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Re-Entry Depth Visualization
            </Text>
            <Stack gap={4}>
              {Array.from(
                { length: simulation.totalReentrancyDepth },
                (_, i) => (
                  <Paper
                    key={i}
                    p="xs"
                    withBorder
                    style={{
                      marginLeft: i * 24,
                      borderColor:
                        i === simulation.totalReentrancyDepth - 1
                          ? "var(--mantine-color-red-5)"
                          : "var(--mantine-color-orange-3)",
                    }}
                    bg={
                      i === simulation.totalReentrancyDepth - 1
                        ? "red.0"
                        : "orange.0"
                    }
                  >
                    <Group gap="xs">
                      <Badge
                        size="xs"
                        color={
                          i === simulation.totalReentrancyDepth - 1
                            ? "red"
                            : "orange"
                        }
                      >
                        Depth {i + 1}
                      </Badge>
                      <Text size="xs">
                        {i === 0
                          ? "Initial withdraw() call"
                          : `Re-entrant withdraw() call #${i}`}
                      </Text>
                    </Group>
                  </Paper>
                ),
              )}
            </Stack>
          </Stack>
        </Paper>
      )}

      {simulation.frames.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Call Trace
            </Text>
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
                          frame.status === "reverted"
                            ? "red"
                            : frame.status === "success"
                              ? "green"
                              : "yellow"
                        }
                      >
                        {frame.status}
                      </Badge>
                      <Code style={{ fontSize: 11 }}>
                        {frame.caller} → {frame.target}.{frame.functionName}()
                      </Code>
                      {frame.ethValue > 0 && (
                        <Badge size="xs" variant="light">
                          {frame.ethValue} ETH
                        </Badge>
                      )}
                    </Group>
                  }
                  description={
                    <Text size="xs" c="dimmed" ml={frame.depth * 16}>
                      {"  ".repeat(frame.depth)}
                      {frame.description}
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
              The withdraw function sends ETH before updating the balance. The
              attacker&apos;s receive() function re-calls withdraw(), draining
              the contract.
            </Text>
          </>
        )}
        {defense === "guard" && (
          <>
            <Text fw={600}>ReentrancyGuard (OpenZeppelin)</Text>
            <Text size="sm">
              A mutex lock prevents re-entering the function. The second
              withdraw() call reverts because the lock is still held.
            </Text>
          </>
        )}
        {defense === "cei" && (
          <>
            <Text fw={600}>Checks-Effects-Interactions (CEI)</Text>
            <Text size="sm">
              Update state (set balance to 0) BEFORE sending ETH. When the
              attacker re-enters, the check fails because balance is already 0.
            </Text>
          </>
        )}
      </Alert>

      <EducationPanel
        howItWorks={[
          {
            title: "The Attack",
            description:
              "Attacker deposits, then calls withdraw(). The victim sends ETH, triggering the attacker's receive(). The attacker re-calls withdraw() before state updates.",
          },
          {
            title: "ReentrancyGuard",
            description:
              "A boolean mutex (_locked) prevents re-entry. On function entry, lock is set. Any re-entrant call sees the lock and reverts.",
          },
          {
            title: "CEI Pattern",
            description:
              "Checks-Effects-Interactions: validate conditions, update state, THEN interact with external contracts. Re-entry finds state already updated.",
          },
        ]}
        whyItMatters="The DAO hack (2016, $60M) exploited reentrancy. It remains one of the most common smart contract vulnerabilities. Understanding it is essential for any Solidity developer."
        tips={[
          "Always use ReentrancyGuard or CEI pattern for functions that send ETH",
          "Use transfer() or send() instead of call() to limit gas forwarded",
          "Audit all external calls — any can trigger re-entry via fallback/receive",
        ]}
      />
    </Stack>
  );
}
