"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  TextInput,
  NumberInput,
  Button,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createERC20,
  mint,
  approve,
  transferFrom,
  balanceOf,
  type ERC20State,
} from "../../lib/tokens/erc20";

export function TokenAllowanceDemo() {
  const [state, setState] = useState<ERC20State>(() => {
    let s = createERC20("TestToken", "TT", 0);
    s = mint(s, "owner", BigInt(10000)).newState;
    return s;
  });

  const [approveSpender, setApproveSpender] = useState("spender");
  const [approveAmount, setApproveAmount] = useState(500);
  const [tfSpender, setTfSpender] = useState("spender");
  const [tfFrom, setTfFrom] = useState("owner");
  const [tfTo, setTfTo] = useState("recipient");
  const [tfAmount, setTfAmount] = useState(200);
  const [lastMessage, setLastMessage] = useState("owner starts with 10,000 TT");

  const addresses = useMemo(() => {
    return Array.from(new Set(Object.keys(state.balances)));
  }, [state.balances]);

  const handleApprove = () => {
    const result = approve(
      state,
      "owner",
      approveSpender,
      BigInt(approveAmount),
    );
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleTransferFrom = () => {
    const result = transferFrom(
      state,
      tfSpender,
      tfFrom,
      tfTo,
      BigInt(tfAmount),
    );
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Step 1: Owner Approves Spender
          </Text>
          <Group grow>
            <TextInput
              label="Spender"
              value={approveSpender}
              onChange={(e) => setApproveSpender(e.currentTarget.value)}
            />
            <NumberInput
              label="Amount"
              value={approveAmount}
              onChange={(v) => setApproveAmount(Number(v) || 0)}
              min={0}
            />
          </Group>
          <Button onClick={handleApprove} variant="light" color="orange">
            Approve
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Step 2: Spender Transfers From Owner
          </Text>
          <Group grow>
            <TextInput
              label="Spender"
              value={tfSpender}
              onChange={(e) => setTfSpender(e.currentTarget.value)}
            />
            <TextInput
              label="From"
              value={tfFrom}
              onChange={(e) => setTfFrom(e.currentTarget.value)}
            />
            <TextInput
              label="To"
              value={tfTo}
              onChange={(e) => setTfTo(e.currentTarget.value)}
            />
            <NumberInput
              label="Amount"
              value={tfAmount}
              onChange={(v) => setTfAmount(Number(v) || 0)}
              min={1}
            />
          </Group>
          <Button onClick={handleTransferFrom} variant="light" color="blue">
            Transfer From
          </Button>
        </Stack>
      </Paper>

      {lastMessage && (
        <Alert icon={<IconInfoCircle size={16} />} variant="light">
          {lastMessage}
        </Alert>
      )}

      {Object.keys(state.allowances).length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Approval Flow
            </Text>
            <svg
              width="100%"
              height={
                80 *
                Object.entries(state.allowances).reduce(
                  (sum, [, spenders]) => sum + Object.keys(spenders).length,
                  0,
                )
              }
              viewBox={`0 0 500 ${
                80 *
                Object.entries(state.allowances).reduce(
                  (sum, [, spenders]) => sum + Object.keys(spenders).length,
                  0,
                )
              }`}
              style={{ maxHeight: 300 }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="var(--mantine-color-orange-6)"
                  />
                </marker>
              </defs>
              {Object.entries(state.allowances).flatMap(
                ([owner, spenders]) => {
                  let rowIdx = 0;
                  for (const entries of Object.entries(state.allowances)) {
                    if (entries[0] === owner) break;
                    rowIdx += Object.keys(entries[1]).length;
                  }
                  return Object.entries(spenders).map(
                    ([spender, amount], si) => {
                      const y = 40 + (rowIdx + si) * 80;
                      return (
                        <g key={`${owner}-${spender}`}>
                          <rect
                            x={20}
                            y={y - 18}
                            width={120}
                            height={36}
                            rx={6}
                            fill="var(--mantine-color-blue-light)"
                            stroke="var(--mantine-color-blue-6)"
                            strokeWidth={1}
                          />
                          <text
                            x={80}
                            y={y + 5}
                            textAnchor="middle"
                            fontSize={13}
                            fill="var(--mantine-color-blue-9)"
                          >
                            {owner}
                          </text>
                          <line
                            x1={140}
                            y1={y}
                            x2={340}
                            y2={y}
                            stroke="var(--mantine-color-orange-6)"
                            strokeWidth={2}
                            markerEnd="url(#arrowhead)"
                          />
                          <text
                            x={240}
                            y={y - 8}
                            textAnchor="middle"
                            fontSize={11}
                            fill="var(--mantine-color-orange-7)"
                          >
                            Limit: {amount.toString()}
                          </text>
                          <rect
                            x={350}
                            y={y - 18}
                            width={120}
                            height={36}
                            rx={6}
                            fill="var(--mantine-color-green-light)"
                            stroke="var(--mantine-color-green-6)"
                            strokeWidth={1}
                          />
                          <text
                            x={410}
                            y={y + 5}
                            textAnchor="middle"
                            fontSize={13}
                            fill="var(--mantine-color-green-9)"
                          >
                            {spender}
                          </text>
                        </g>
                      );
                    },
                  );
                },
              )}
            </svg>
          </Stack>
        </Paper>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Balances
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Address</Table.Th>
                <Table.Th ta="right">Balance</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {addresses.map((addr) => (
                <Table.Tr key={addr}>
                  <Table.Td>
                    <Code>{addr}</Code>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Code>{balanceOf(state, addr).toString()}</Code>
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
            Allowances
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Owner</Table.Th>
                <Table.Th>Spender</Table.Th>
                <Table.Th ta="right">Allowance</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.entries(state.allowances).flatMap(([owner, spenders]) =>
                Object.entries(spenders).map(([spender, amount]) => (
                  <Table.Tr key={`${owner}-${spender}`}>
                    <Table.Td>
                      <Code>{owner}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Code>{spender}</Code>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Badge
                        variant="light"
                        color={amount > BigInt(0) ? "green" : "gray"}
                      >
                        {amount.toString()}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                )),
              )}
              {Object.keys(state.allowances).length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={3} ta="center">
                    <Text size="sm" c="dimmed">
                      No allowances set
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
