"use client";

import { useState, useCallback } from "react";
import {
  Stack,
  Button,
  Text,
  Paper,
  Group,
  Badge,
  Code,
  NumberInput,
  SegmentedControl,
  Table,
  CopyButton,
  ActionIcon,
  Alert,
  Box,
} from "@mantine/core";
import {
  IconWallet,
  IconCopy,
  IconCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  generateNewMnemonic,
  isValidMnemonic,
} from "../../lib/wallet/mnemonic";
import {
  deriveAccountsFromMnemonic,
  type HDWalletInfo,
} from "../../lib/wallet/hd-wallet";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";

function KeyDerivationTree({ walletInfo }: { walletInfo: HDWalletInfo }) {
  const accounts = walletInfo.accounts.slice(0, 5);
  const treeWidth = 320;
  const rowHeight = 40;
  const svgHeight = 80 + accounts.length * rowHeight;

  return (
    <Paper p="md" withBorder data-testid="key-derivation-tree">
      <Text size="sm" fw={600} mb="sm">
        BIP32 Key Derivation Tree
      </Text>
      <Box style={{ overflowX: "auto" }}>
        <svg
          width={treeWidth}
          height={svgHeight}
          viewBox={`0 0 ${treeWidth} ${svgHeight}`}
        >
          {/* Master seed */}
          <rect
            x={treeWidth / 2 - 60}
            y={5}
            width={120}
            height={30}
            rx={6}
            fill="var(--mantine-color-violet-1)"
            stroke="var(--mantine-color-violet-5)"
            strokeWidth="2"
          />
          <text
            x={treeWidth / 2}
            y={25}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="var(--mantine-color-dark-6)"
          >
            Master Seed
          </text>

          {/* Line to path root */}
          <line
            x1={treeWidth / 2}
            y1={35}
            x2={treeWidth / 2}
            y2={50}
            stroke="var(--mantine-color-gray-4)"
            strokeWidth="1.5"
          />

          {/* Path root m/44'/60'/0'/0 */}
          <rect
            x={treeWidth / 2 - 70}
            y={50}
            width={140}
            height={26}
            rx={4}
            fill="var(--mantine-color-blue-1)"
            stroke="var(--mantine-color-blue-4)"
            strokeWidth="1.5"
          />
          <text
            x={treeWidth / 2}
            y={67}
            textAnchor="middle"
            fontSize="9"
            fill="var(--mantine-color-dark-6)"
          >
            {"m/44'/60'/0'/0"}
          </text>

          {/* Child accounts */}
          {accounts.map((account, i) => {
            const y = 90 + i * rowHeight;
            return (
              <g key={account.index}>
                <line
                  x1={treeWidth / 2}
                  y1={76}
                  x2={treeWidth / 2}
                  y2={y}
                  stroke="var(--mantine-color-gray-3)"
                  strokeWidth="1"
                />
                <line
                  x1={treeWidth / 2}
                  y1={y}
                  x2={treeWidth / 2 - 40}
                  y2={y}
                  stroke="var(--mantine-color-gray-3)"
                  strokeWidth="1"
                />
                <rect
                  x={10}
                  y={y - 12}
                  width={treeWidth / 2 - 55}
                  height={24}
                  rx={4}
                  fill="var(--mantine-color-green-1)"
                  stroke="var(--mantine-color-green-4)"
                  strokeWidth="1"
                />
                <text
                  x={16}
                  y={y + 4}
                  fontSize="8"
                  fill="var(--mantine-color-dark-6)"
                >
                  /{account.index}
                </text>
                <text
                  x={treeWidth / 2 - 50}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="7"
                  fontFamily="monospace"
                  fill="var(--mantine-color-dimmed)"
                >
                  {account.address.slice(0, 14)}...
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
    </Paper>
  );
}

export function WalletWorkshopDemo() {
  const [strength, setStrength] = useState<"128" | "256">("128");
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<HDWalletInfo | null>(null);
  const [accountCount, setAccountCount] = useState<number>(5);
  const [deriving, setDeriving] = useState(false);

  const handleGenerate = useCallback(() => {
    const m = generateNewMnemonic(Number(strength) as 128 | 256);
    setMnemonic(m);
    setWalletInfo(null);
  }, [strength]);

  const handleDerive = useCallback(() => {
    if (!mnemonic) return;
    setDeriving(true);
    setTimeout(() => {
      const info = deriveAccountsFromMnemonic(mnemonic, accountCount);
      setWalletInfo(info);
      setDeriving(false);
    }, 10);
  }, [mnemonic, accountCount]);

  const inputPanel = (
    <Stack gap="md">
      <Alert icon={<IconInfoCircle size={16} />} color="orange" variant="light">
        This demo generates real BIP39 mnemonics. Never use demo-generated
        mnemonics for real funds.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Step 1: Generate BIP39 Mnemonic
          </Text>
          <SegmentedControl
            value={strength}
            onChange={(v) => setStrength(v as "128" | "256")}
            data={[
              { label: "12 words (128-bit)", value: "128" },
              { label: "24 words (256-bit)", value: "256" },
            ]}
          />
          <Button
            leftSection={<IconWallet size={16} />}
            onClick={handleGenerate}
          >
            Generate Mnemonic
          </Button>

          {mnemonic && (
            <Paper p="md" withBorder bg="var(--mantine-color-dark-7)">
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed">
                  Mnemonic Phrase ({mnemonic.split(" ").length} words)
                </Text>
                <CopyButton value={mnemonic}>
                  {({ copied, copy }) => (
                    <ActionIcon
                      variant="subtle"
                      color={copied ? "teal" : "gray"}
                      onClick={copy}
                      size="sm"
                    >
                      {copied ? (
                        <IconCheck size={14} />
                      ) : (
                        <IconCopy size={14} />
                      )}
                    </ActionIcon>
                  )}
                </CopyButton>
              </Group>
              <Group gap="xs" wrap="wrap">
                {mnemonic.split(" ").map((word, i) => (
                  <Badge key={i} variant="light" size="lg">
                    {i + 1}. {word}
                  </Badge>
                ))}
              </Group>
              <Badge
                mt="xs"
                color={isValidMnemonic(mnemonic) ? "green" : "red"}
                variant="light"
              >
                {isValidMnemonic(mnemonic) ? "Valid BIP39" : "Invalid"}
              </Badge>
            </Paper>
          )}
        </Stack>
      </Paper>

      {mnemonic && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Step 2: Derive HD Wallet Accounts (BIP44)
            </Text>
            <Text size="xs" c="dimmed">
              Derivation path: m/44&apos;/60&apos;/0&apos;/0/index
            </Text>
            <NumberInput
              label="Number of Accounts"
              value={accountCount}
              onChange={(v) => setAccountCount(Number(v))}
              min={1}
              max={20}
              size="sm"
            />
            <Button onClick={handleDerive} loading={deriving} variant="outline">
              Derive Accounts
            </Button>

            {walletInfo && (
              <>
                <div>
                  <Text size="xs" c="dimmed">
                    Master Seed
                  </Text>
                  <Code
                    block
                    style={{ fontSize: "0.6rem", wordBreak: "break-all" }}
                  >
                    {walletInfo.seed.slice(0, 64)}...
                  </Code>
                </div>

                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Index</Table.Th>
                      <Table.Th>Path</Table.Th>
                      <Table.Th>Address</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {walletInfo.accounts.map((account) => (
                      <Table.Tr key={account.index}>
                        <Table.Td>{account.index}</Table.Td>
                        <Table.Td>
                          <Code>{account.path}</Code>
                        </Table.Td>
                        <Table.Td>
                          <Code style={{ fontSize: "0.7rem" }}>
                            {account.address}
                          </Code>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </>
            )}
          </Stack>
        </Paper>
      )}
    </Stack>
  );

  const resultPanel = (
    <Stack gap="md">
      {walletInfo ? (
        <KeyDerivationTree walletInfo={walletInfo} />
      ) : (
        <Paper p="md" withBorder>
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Generate a mnemonic and derive accounts to see the key derivation
            tree
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
              title: "Generate Entropy",
              description:
                "Random bytes (128 or 256 bits) are generated securely as the seed for the mnemonic.",
            },
            {
              title: "BIP39 Mnemonic",
              description:
                "The entropy is converted to a human-readable 12 or 24 word phrase using a standard wordlist.",
            },
            {
              title: "Derive Master Key",
              description:
                "The mnemonic + optional passphrase is converted to a 512-bit seed using PBKDF2, then to a master key.",
            },
            {
              title: "BIP44 Child Keys",
              description:
                "Using the path m/44'/60'/0'/0/index, deterministic child keys are derived for each account.",
            },
          ]}
          whyItMatters="HD wallets allow you to manage unlimited accounts from a single backup (the mnemonic). This is the standard used by MetaMask, Ledger, and virtually all modern wallets."
          tips={[
            "The same mnemonic always produces the same accounts — this is what makes it a backup",
            "24-word mnemonics provide 256-bit security vs 128-bit for 12 words",
            "Never share your mnemonic — anyone with it can access all your accounts",
          ]}
        />
      }
    />
  );
}
