"use client";

import { useState, useMemo } from "react";
import {
  Stack, Paper, TextInput, NumberInput, Button, Table, Code, Badge, Group, Text, Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createERC20, mint, approve, transferFrom, balanceOf, allowance,
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
    const result = approve(state, "owner", approveSpender, BigInt(approveAmount));
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleTransferFrom = () => {
    const result = transferFrom(state, tfSpender, tfFrom, tfTo, BigInt(tfAmount));
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Step 1: Owner Approves Spender</Text>
          <Group grow>
            <TextInput label="Spender" value={approveSpender} onChange={(e) => setApproveSpender(e.currentTarget.value)} />
            <NumberInput label="Amount" value={approveAmount} onChange={(v) => setApproveAmount(Number(v) || 0)} min={0} />
          </Group>
          <Button onClick={handleApprove} variant="light" color="orange">Approve</Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Step 2: Spender Transfers From Owner</Text>
          <Group grow>
            <TextInput label="Spender" value={tfSpender} onChange={(e) => setTfSpender(e.currentTarget.value)} />
            <TextInput label="From" value={tfFrom} onChange={(e) => setTfFrom(e.currentTarget.value)} />
            <TextInput label="To" value={tfTo} onChange={(e) => setTfTo(e.currentTarget.value)} />
            <NumberInput label="Amount" value={tfAmount} onChange={(v) => setTfAmount(Number(v) || 0)} min={1} />
          </Group>
          <Button onClick={handleTransferFrom} variant="light" color="blue">Transfer From</Button>
        </Stack>
      </Paper>

      {lastMessage && (
        <Alert icon={<IconInfoCircle size={16} />} variant="light">
          {lastMessage}
        </Alert>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Balances</Text>
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
                  <Table.Td><Code>{addr}</Code></Table.Td>
                  <Table.Td ta="right"><Code>{balanceOf(state, addr).toString()}</Code></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Allowances</Text>
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
                    <Table.Td><Code>{owner}</Code></Table.Td>
                    <Table.Td><Code>{spender}</Code></Table.Td>
                    <Table.Td ta="right">
                      <Badge variant="light" color={amount > BigInt(0) ? "green" : "gray"}>
                        {amount.toString()}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
              {Object.keys(state.allowances).length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={3} ta="center">
                    <Text size="sm" c="dimmed">No allowances set</Text>
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
