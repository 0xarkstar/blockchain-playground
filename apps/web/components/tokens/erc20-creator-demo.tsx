"use client";

import { useState, useMemo } from "react";
import {
  Stack, Paper, TextInput, NumberInput, Button, Table, Code, Badge, Group, Text, Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createERC20, mint, burn, transfer, balanceOf, formatTokenAmount,
  type ERC20State,
} from "../../lib/tokens/erc20";

export function ERC20CreatorDemo() {
  const [tokenName, setTokenName] = useState("MyToken");
  const [tokenSymbol, setTokenSymbol] = useState("MTK");
  const [decimals, setDecimals] = useState(18);
  const [state, setState] = useState<ERC20State>(() =>
    createERC20("MyToken", "MTK", 18)
  );

  const [mintTo, setMintTo] = useState("alice");
  const [mintAmount, setMintAmount] = useState(1000);
  const [burnFrom, setBurnFrom] = useState("alice");
  const [burnAmount, setBurnAmount] = useState(100);
  const [transferFrom, setTransferFrom] = useState("alice");
  const [transferTo, setTransferTo] = useState("bob");
  const [transferAmount, setTransferAmount] = useState(50);
  const [lastMessage, setLastMessage] = useState("");

  const addresses = useMemo(() => {
    const addrs = new Set<string>();
    for (const addr of Object.keys(state.balances)) {
      addrs.add(addr);
    }
    return Array.from(addrs);
  }, [state.balances]);

  const handleCreate = () => {
    setState(createERC20(tokenName, tokenSymbol, decimals));
    setLastMessage(`Created ${tokenName} (${tokenSymbol}) with ${decimals} decimals`);
  };

  const handleMint = () => {
    const result = mint(state, mintTo, BigInt(mintAmount));
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleBurn = () => {
    const result = burn(state, burnFrom, BigInt(burnAmount));
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleTransfer = () => {
    const result = transfer(state, transferFrom, transferTo, BigInt(transferAmount));
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Token Configuration</Text>
          <Group grow>
            <TextInput label="Name" value={tokenName} onChange={(e) => setTokenName(e.currentTarget.value)} />
            <TextInput label="Symbol" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.currentTarget.value)} />
            <NumberInput label="Decimals" value={decimals} onChange={(v) => setDecimals(Number(v) || 0)} min={0} max={18} />
          </Group>
          <Button onClick={handleCreate} variant="light">Create Token</Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Mint</Text>
          <Group grow>
            <TextInput label="To" value={mintTo} onChange={(e) => setMintTo(e.currentTarget.value)} />
            <NumberInput label="Amount" value={mintAmount} onChange={(v) => setMintAmount(Number(v) || 0)} min={1} />
          </Group>
          <Button onClick={handleMint} variant="light" color="green">Mint</Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Burn</Text>
          <Group grow>
            <TextInput label="From" value={burnFrom} onChange={(e) => setBurnFrom(e.currentTarget.value)} />
            <NumberInput label="Amount" value={burnAmount} onChange={(v) => setBurnAmount(Number(v) || 0)} min={1} />
          </Group>
          <Button onClick={handleBurn} variant="light" color="red">Burn</Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Transfer</Text>
          <Group grow>
            <TextInput label="From" value={transferFrom} onChange={(e) => setTransferFrom(e.currentTarget.value)} />
            <TextInput label="To" value={transferTo} onChange={(e) => setTransferTo(e.currentTarget.value)} />
            <NumberInput label="Amount" value={transferAmount} onChange={(v) => setTransferAmount(Number(v) || 0)} min={1} />
          </Group>
          <Button onClick={handleTransfer} variant="light" color="blue">Transfer</Button>
        </Stack>
      </Paper>

      {lastMessage && (
        <Alert icon={<IconInfoCircle size={16} />} variant="light">
          {lastMessage}
        </Alert>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>Token State</Text>
            <Badge variant="light">{state.name} ({state.symbol})</Badge>
          </Group>
          <Text size="sm">Total Supply: <Code>{formatTokenAmount(state.totalSupply, state.decimals)}</Code></Text>
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
                  <Table.Td ta="right">
                    <Code>{formatTokenAmount(balanceOf(state, addr), state.decimals)}</Code>
                  </Table.Td>
                </Table.Tr>
              ))}
              {addresses.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={2} ta="center">
                    <Text size="sm" c="dimmed">No balances yet</Text>
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
