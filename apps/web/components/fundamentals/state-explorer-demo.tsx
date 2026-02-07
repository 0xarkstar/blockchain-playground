"use client";

import { useState, useCallback } from "react";
import {
  Stack,
  TextInput,
  Button,
  Text,
  Paper,
  Group,
  Badge,
  Code,
  SimpleGrid,
  Alert,
} from "@mantine/core";
import { IconDatabase, IconSearch, IconInfoCircle } from "@tabler/icons-react";

interface AccountState {
  address: string;
  balance: string;
  nonce: string;
  codeHash: string;
  storageRoot: string;
}

const EXAMPLE_ACCOUNTS: AccountState[] = [
  {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    balance: "1,234.56 ETH",
    nonce: "892",
    codeHash:
      "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    storageRoot:
      "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  },
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    balance: "0.00 ETH",
    nonce: "1",
    codeHash: "0x7f5c764cbc14f9669b88837ca1490cca17c31607...",
    storageRoot: "0x3a8f4c9d2e7b1f6a5c8d3e2b7a4f9c1d6e8b3a5f...",
  },
];

export function StateExplorerDemo() {
  const [address, setAddress] = useState(EXAMPLE_ACCOUNTS[0].address);
  const [account, setAccount] = useState<AccountState | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const found = EXAMPLE_ACCOUNTS.find(
        (a) => a.address.toLowerCase() === address.toLowerCase(),
      );
      setAccount(
        found ?? {
          address,
          balance: "0.00 ETH",
          nonce: "0",
          codeHash:
            "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
          storageRoot:
            "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
        },
      );
      setLoading(false);
    }, 300);
  }, [address]);

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        This demo simulates browsing Ethereum state. In a full implementation,
        it would query live RPC endpoints to fetch real account data.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Account Lookup
          </Text>
          <Group>
            <TextInput
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Button
              leftSection={<IconSearch size={16} />}
              onClick={handleLookup}
              loading={loading}
            >
              Lookup
            </Button>
          </Group>
          <Group gap="xs">
            {EXAMPLE_ACCOUNTS.map((a) => (
              <Badge
                key={a.address}
                variant="light"
                style={{ cursor: "pointer" }}
                onClick={() => setAddress(a.address)}
              >
                {a.address.slice(0, 8)}...
              </Badge>
            ))}
          </Group>
        </Stack>
      </Paper>

      {account && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Account State
              </Text>
              <Badge variant="light" color="blue">
                <IconDatabase size={12} /> State Trie
              </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper p="sm" withBorder>
                <Text size="xs" c="dimmed">
                  Balance
                </Text>
                <Text size="lg" fw={700}>
                  {account.balance}
                </Text>
              </Paper>
              <Paper p="sm" withBorder>
                <Text size="xs" c="dimmed">
                  Nonce (TX Count)
                </Text>
                <Text size="lg" fw={700}>
                  {account.nonce}
                </Text>
              </Paper>
            </SimpleGrid>

            <div>
              <Text size="xs" c="dimmed">
                Code Hash (keccak256 of contract bytecode)
              </Text>
              <Code
                block
                style={{ wordBreak: "break-all", fontSize: "0.7rem" }}
              >
                {account.codeHash}
              </Code>
            </div>

            <div>
              <Text size="xs" c="dimmed">
                Storage Root (Merkle Patricia Trie root of contract storage)
              </Text>
              <Code
                block
                style={{ wordBreak: "break-all", fontSize: "0.7rem" }}
              >
                {account.storageRoot}
              </Code>
            </div>

            <Alert
              icon={<IconDatabase size={16} />}
              color="gray"
              variant="light"
            >
              Each Ethereum account is stored as an RLP-encoded node in the
              global state trie, identified by keccak256(address). The state
              consists of: nonce, balance, storageRoot, and codeHash.
            </Alert>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
