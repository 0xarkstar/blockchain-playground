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
  Box,
} from "@mantine/core";
import { IconDatabase, IconSearch, IconInfoCircle } from "@tabler/icons-react";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";

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

function StateTrieVisual({ account }: { account: AccountState }) {
  return (
    <Paper p="md" withBorder data-testid="state-trie-visual">
      <Text size="sm" fw={600} mb="sm">
        State Trie Structure
      </Text>
      <Box style={{ display: "flex", justifyContent: "center" }}>
        <svg width="300" height="260" viewBox="0 0 300 260">
          {/* State Root */}
          <rect
            x="100"
            y="5"
            width="100"
            height="30"
            rx="6"
            fill="var(--mantine-color-violet-1)"
            stroke="var(--mantine-color-violet-5)"
            strokeWidth="2"
          />
          <text
            x="150"
            y="25"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--mantine-color-dark-6)"
          >
            State Root
          </text>

          {/* Line to account node */}
          <line
            x1="150"
            y1="35"
            x2="150"
            y2="55"
            stroke="var(--mantine-color-gray-4)"
            strokeWidth="1.5"
          />

          {/* Account node (keyed by address) */}
          <rect
            x="60"
            y="55"
            width="180"
            height="30"
            rx="4"
            fill="var(--mantine-color-blue-1)"
            stroke="var(--mantine-color-blue-4)"
            strokeWidth="1.5"
          />
          <text
            x="150"
            y="73"
            textAnchor="middle"
            fontSize="8"
            fontFamily="monospace"
            fill="var(--mantine-color-dark-6)"
          >
            {account.address.slice(0, 20)}...
          </text>

          {/* Lines to 4 account fields */}
          {[0, 1, 2, 3].map((i) => {
            const x = 30 + i * 75;
            return (
              <line
                key={i}
                x1="150"
                y1="85"
                x2={x}
                y2="110"
                stroke="var(--mantine-color-gray-3)"
                strokeWidth="1"
              />
            );
          })}

          {/* Nonce */}
          <rect
            x="5"
            y="110"
            width="60"
            height="44"
            rx="4"
            fill="var(--mantine-color-green-1)"
            stroke="var(--mantine-color-green-4)"
            strokeWidth="1"
          />
          <text
            x="35"
            y="127"
            textAnchor="middle"
            fontSize="8"
            fontWeight="600"
            fill="var(--mantine-color-dark-6)"
          >
            Nonce
          </text>
          <text
            x="35"
            y="145"
            textAnchor="middle"
            fontSize="9"
            fontFamily="monospace"
            fill="var(--mantine-color-dark-6)"
          >
            {account.nonce}
          </text>

          {/* Balance */}
          <rect
            x="75"
            y="110"
            width="60"
            height="44"
            rx="4"
            fill="var(--mantine-color-yellow-1)"
            stroke="var(--mantine-color-yellow-5)"
            strokeWidth="1"
          />
          <text
            x="105"
            y="127"
            textAnchor="middle"
            fontSize="8"
            fontWeight="600"
            fill="var(--mantine-color-dark-6)"
          >
            Balance
          </text>
          <text
            x="105"
            y="145"
            textAnchor="middle"
            fontSize="7"
            fontFamily="monospace"
            fill="var(--mantine-color-dark-6)"
          >
            {account.balance}
          </text>

          {/* Storage Root */}
          <rect
            x="155"
            y="110"
            width="60"
            height="44"
            rx="4"
            fill="var(--mantine-color-orange-1)"
            stroke="var(--mantine-color-orange-4)"
            strokeWidth="1"
          />
          <text
            x="185"
            y="127"
            textAnchor="middle"
            fontSize="7"
            fontWeight="600"
            fill="var(--mantine-color-dark-6)"
          >
            storageRoot
          </text>
          <text
            x="185"
            y="145"
            textAnchor="middle"
            fontSize="6"
            fontFamily="monospace"
            fill="var(--mantine-color-dimmed)"
          >
            {account.storageRoot.slice(0, 10)}...
          </text>

          {/* Code Hash */}
          <rect
            x="230"
            y="110"
            width="60"
            height="44"
            rx="4"
            fill="var(--mantine-color-red-1)"
            stroke="var(--mantine-color-red-4)"
            strokeWidth="1"
          />
          <text
            x="260"
            y="127"
            textAnchor="middle"
            fontSize="7"
            fontWeight="600"
            fill="var(--mantine-color-dark-6)"
          >
            codeHash
          </text>
          <text
            x="260"
            y="145"
            textAnchor="middle"
            fontSize="6"
            fontFamily="monospace"
            fill="var(--mantine-color-dimmed)"
          >
            {account.codeHash.slice(0, 10)}...
          </text>

          {/* Storage Trie sub-tree indicator */}
          <line
            x1="185"
            y1="154"
            x2="185"
            y2="175"
            stroke="var(--mantine-color-orange-3)"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <rect
            x="145"
            y="175"
            width="80"
            height="26"
            rx="4"
            fill="var(--mantine-color-orange-0)"
            stroke="var(--mantine-color-orange-3)"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <text
            x="185"
            y="192"
            textAnchor="middle"
            fontSize="8"
            fill="var(--mantine-color-dimmed)"
          >
            Storage Trie
          </text>

          {/* Legend */}
          <text x="5" y="230" fontSize="8" fill="var(--mantine-color-dimmed)">
            Merkle Patricia Trie: accounts keyed by keccak256(address)
          </text>
          <text x="5" y="245" fontSize="8" fill="var(--mantine-color-dimmed)">
            Each account stores: nonce, balance, storageRoot, codeHash
          </text>
        </svg>
      </Box>
    </Paper>
  );
}

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

  const inputPanel = (
    <Stack gap="md">
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
          </Stack>
        </Paper>
      )}
    </Stack>
  );

  const resultPanel = (
    <Stack gap="md">
      {account ? (
        <StateTrieVisual account={account} />
      ) : (
        <Paper p="md" withBorder>
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Look up an account to see its state trie structure
          </Text>
        </Paper>
      )}
    </Stack>
  );

  return (
    <DemoLayout
      inputPanel={inputPanel}
      resultPanel={resultPanel}
      learnContent={
        <EducationPanel
          howItWorks={[
            {
              title: "Global State Trie",
              description:
                "Ethereum maintains a Merkle Patricia Trie mapping every address to its account state.",
            },
            {
              title: "Account Fields",
              description:
                "Each account stores: nonce (tx count), balance, storageRoot (for contract storage), and codeHash.",
              details: [
                "EOAs (externally owned accounts) have empty codeHash",
                "Contracts have a storageRoot pointing to their own storage trie",
              ],
            },
            {
              title: "State Root",
              description:
                "The root hash of the state trie is included in every block header, committing to the entire world state.",
            },
          ]}
          whyItMatters="The state trie is how Ethereum stores all account data. Its Merkle structure allows light clients to verify any account's state with a compact proof, without downloading the entire blockchain."
          tips={[
            "An empty codeHash means the account is an EOA (user account), not a contract",
            "The storageRoot is itself a Merkle Patricia Trie — a trie within a trie",
            "State growth is one of Ethereum's biggest scalability challenges",
          ]}
        />
      }
    />
  );
}
