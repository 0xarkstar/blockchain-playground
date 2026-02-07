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
  SegmentedControl,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createERC1155,
  mintERC1155,
  transferERC1155,
  balanceOfERC1155,
  type ERC1155State,
} from "../../lib/tokens/erc1155";

export function ERC1155MultiTokenDemo() {
  const [state, setState] = useState<ERC1155State>(() => createERC1155());
  const [mintTo, setMintTo] = useState("alice");
  const [mintTokenId, setMintTokenId] = useState(1);
  const [mintAmount, setMintAmount] = useState(100);
  const [mintType, setMintType] = useState<"fungible" | "non-fungible">(
    "fungible",
  );
  const [mintUri, setMintUri] = useState("");

  const [tfFrom, setTfFrom] = useState("alice");
  const [tfTo, setTfTo] = useState("bob");
  const [tfTokenId, setTfTokenId] = useState(1);
  const [tfAmount, setTfAmount] = useState(10);
  const [lastMessage, setLastMessage] = useState("");

  const allTokenIds = useMemo(() => {
    return Array.from(new Set(Object.keys(state.totalSupply).map(Number))).sort(
      (a, b) => a - b,
    );
  }, [state.totalSupply]);

  const allAddresses = useMemo(() => {
    return Object.keys(state.balances).sort();
  }, [state.balances]);

  const handleMint = () => {
    const result = mintERC1155(
      state,
      mintTo,
      mintTokenId,
      BigInt(mintAmount),
      mintType,
      mintUri || undefined,
    );
    setState(result.newState);
    setLastMessage(
      result.success
        ? `Minted ${mintAmount} of token #${mintTokenId} to ${mintTo}`
        : result.message,
    );
  };

  const handleTransfer = () => {
    const result = transferERC1155(
      state,
      tfFrom,
      tfTo,
      tfTokenId,
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
            Mint Token
          </Text>
          <SegmentedControl
            value={mintType}
            onChange={(v) => {
              setMintType(v as "fungible" | "non-fungible");
              if (v === "non-fungible") setMintAmount(1);
            }}
            data={[
              { label: "Fungible", value: "fungible" },
              { label: "Non-Fungible", value: "non-fungible" },
            ]}
          />
          <Group grow>
            <TextInput
              label="To"
              value={mintTo}
              onChange={(e) => setMintTo(e.currentTarget.value)}
            />
            <NumberInput
              label="Token ID"
              value={mintTokenId}
              onChange={(v) => setMintTokenId(Number(v) || 0)}
              min={1}
            />
            <NumberInput
              label="Amount"
              value={mintAmount}
              onChange={(v) => setMintAmount(Number(v) || 0)}
              min={1}
              disabled={mintType === "non-fungible"}
            />
          </Group>
          <TextInput
            label="URI (optional)"
            value={mintUri}
            onChange={(e) => setMintUri(e.currentTarget.value)}
            placeholder="ipfs://..."
          />
          <Button onClick={handleMint} variant="light" color="green">
            Mint
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Transfer
          </Text>
          <Group grow>
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
              label="Token ID"
              value={tfTokenId}
              onChange={(v) => setTfTokenId(Number(v) || 0)}
              min={1}
            />
            <NumberInput
              label="Amount"
              value={tfAmount}
              onChange={(v) => setTfAmount(Number(v) || 0)}
              min={1}
            />
          </Group>
          <Button onClick={handleTransfer} variant="light" color="blue">
            Transfer
          </Button>
        </Stack>
      </Paper>

      {lastMessage && (
        <Alert icon={<IconInfoCircle size={16} />} variant="light">
          {lastMessage}
        </Alert>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Token Balances
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Address</Table.Th>
                {allTokenIds.map((id) => (
                  <Table.Th key={id} ta="right">
                    ID #{id}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {allAddresses.map((addr) => (
                <Table.Tr key={addr}>
                  <Table.Td>
                    <Code>{addr}</Code>
                  </Table.Td>
                  {allTokenIds.map((id) => (
                    <Table.Td key={id} ta="right">
                      <Code>
                        {balanceOfERC1155(state, addr, id).toString()}
                      </Code>
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
              {allAddresses.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={allTokenIds.length + 1} ta="center">
                    <Text size="sm" c="dimmed">
                      No tokens minted
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      {allTokenIds.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Token Info
            </Text>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Token ID</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th ta="right">Total Supply</Table.Th>
                  <Table.Th>URI</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {allTokenIds.map((id) => (
                  <Table.Tr key={id}>
                    <Table.Td>
                      <Badge variant="light">#{id}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={
                          state.tokenTypes[id] === "non-fungible"
                            ? "violet"
                            : "blue"
                        }
                      >
                        {state.tokenTypes[id] ?? "fungible"}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Code>{state.totalSupply[id]?.toString() ?? "0"}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Code style={{ fontSize: 11 }}>
                        {state.uris[id] ?? "—"}
                      </Code>
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
