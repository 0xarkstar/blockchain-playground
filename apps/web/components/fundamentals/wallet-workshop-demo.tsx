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
} from "@mantine/core";
import { IconWallet, IconCopy, IconCheck, IconInfoCircle } from "@tabler/icons-react";
import { generateNewMnemonic, isValidMnemonic } from "../../lib/wallet/mnemonic";
import {
  deriveAccountsFromMnemonic,
  type HDWalletInfo,
} from "../../lib/wallet/hd-wallet";

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

  return (
    <Stack gap="lg">
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
}
