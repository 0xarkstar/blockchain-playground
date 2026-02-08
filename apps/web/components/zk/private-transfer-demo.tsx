"use client";

import { useState } from "react";
import {
  Stack,
  Paper,
  Button,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Alert,
  TextInput,
  NumberInput,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createPrivateState,
  mintShieldedCoin,
  privateTransfer,
  getPrivacyAnalysis,
  type PrivateState,
  type ShieldedNote,
} from "../../lib/zk/private-transfer";

export function PrivateTransferDemo() {
  const [state, setState] = useState<PrivateState>(createPrivateState);
  const [mintOwner, setMintOwner] = useState("alice");
  const [mintValue, setMintValue] = useState(100);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [recipient, setRecipient] = useState("bob");
  const [sendAmount, setSendAmount] = useState(60);
  const [lastMessage, setLastMessage] = useState("");
  const [lastSuccess, setLastSuccess] = useState<boolean | null>(null);

  const privacy = getPrivacyAnalysis();

  const handleMint = () => {
    const result = mintShieldedCoin(state, BigInt(mintValue), mintOwner);
    setState(result.newState);
    setLastMessage(result.message);
    setLastSuccess(result.success);
  };

  const handleTransfer = () => {
    if (selectedNote === null || !state.notes[selectedNote]) return;
    const note = state.notes[selectedNote];
    const result = privateTransfer(state, note, recipient, BigInt(sendAmount));
    setState(result.newState);
    setLastMessage(result.message);
    setLastSuccess(result.success);
    if (result.success) setSelectedNote(null);
  };

  const handleReset = () => {
    setState(createPrivateState());
    setSelectedNote(null);
    setLastMessage("");
    setLastSuccess(null);
  };

  // Only show unspent notes
  const unspentNotes = state.notes.filter(
    (n) => !state.nullifiers.includes(n.nullifier),
  );

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        Private transfers use commitments and nullifiers (Zcash/Tornado Cash
        style). The verifier sees opaque hashes but NOT who sent what to whom or
        how much.
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Mint Shielded Coin
            </Text>
            <Button
              onClick={handleReset}
              variant="light"
              color="gray"
              size="xs"
            >
              Reset
            </Button>
          </Group>
          <Group grow>
            <TextInput
              label="Owner"
              value={mintOwner}
              onChange={(e) => setMintOwner(e.currentTarget.value)}
            />
            <NumberInput
              label="Value"
              value={mintValue}
              onChange={(v) => setMintValue(Number(v) || 0)}
              min={1}
            />
          </Group>
          <Button onClick={handleMint} variant="light" color="green">
            Mint
          </Button>
        </Stack>
      </Paper>

      {unspentNotes.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Unspent Notes (private view)
            </Text>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Select</Table.Th>
                  <Table.Th>Owner</Table.Th>
                  <Table.Th>Value</Table.Th>
                  <Table.Th>Commitment</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {unspentNotes.map((note) => {
                  const idx = state.notes.indexOf(note);
                  return (
                    <Table.Tr
                      key={idx}
                      style={{
                        cursor: "pointer",
                        background:
                          selectedNote === idx
                            ? "var(--mantine-color-blue-light)"
                            : undefined,
                      }}
                      onClick={() => setSelectedNote(idx)}
                    >
                      <Table.Td>
                        <Badge
                          variant={selectedNote === idx ? "filled" : "light"}
                          size="sm"
                          color="blue"
                        >
                          {selectedNote === idx ? "Selected" : "Select"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{note.owner}</Table.Td>
                      <Table.Td>
                        <Code>{note.value.toString()}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Code>{note.commitment.slice(0, 16)}...</Code>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      )}

      {selectedNote !== null && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Transfer
            </Text>
            <Group grow>
              <TextInput
                label="Recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.currentTarget.value)}
              />
              <NumberInput
                label="Amount"
                value={sendAmount}
                onChange={(v) => setSendAmount(Number(v) || 0)}
                min={1}
              />
            </Group>
            <Button onClick={handleTransfer} variant="light" color="violet">
              Send Private Transfer
            </Button>
          </Stack>
        </Paper>
      )}

      {lastMessage && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          variant="light"
          color={lastSuccess ? "green" : "red"}
        >
          {lastMessage}
        </Alert>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            UTXO Flow
          </Text>
          <svg width="100%" height={80} viewBox="0 0 520 80">
            {[
              { label: "Mint", x: 10, color: "green", desc: "Create Note" },
              {
                label: "Transfer",
                x: 140,
                color: "blue",
                desc: "Spend + Create",
              },
              { label: "Nullify", x: 270, color: "red", desc: "Mark Spent" },
              { label: "Verify", x: 400, color: "violet", desc: "ZK Proof" },
            ].map((step, i) => (
              <g key={step.label}>
                <rect
                  x={step.x}
                  y={10}
                  width={100}
                  height={55}
                  rx={8}
                  fill={`var(--mantine-color-${step.color}-light)`}
                  stroke={`var(--mantine-color-${step.color}-6)`}
                  strokeWidth={1.5}
                />
                <text
                  x={step.x + 50}
                  y={32}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={600}
                  fill={`var(--mantine-color-${step.color}-9)`}
                >
                  {step.label}
                </text>
                <text
                  x={step.x + 50}
                  y={50}
                  textAnchor="middle"
                  fontSize={10}
                  fill={`var(--mantine-color-${step.color}-7)`}
                >
                  {step.desc}
                </text>
                {i < 3 && (
                  <text
                    x={step.x + 120}
                    y={42}
                    textAnchor="middle"
                    fontSize={16}
                    fill="var(--mantine-color-dimmed)"
                  >
                    {"\u2192"}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text size="sm" fw={600}>
            Public State (what the blockchain sees)
          </Text>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Commitments</Table.Td>
                <Table.Td>
                  <Code>{state.commitments.length}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Nullifiers (spent)</Table.Td>
                <Table.Td>
                  <Code>{state.nullifiers.length}</Code>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          {state.nullifiers.length > 0 && (
            <>
              <Text size="xs" fw={600} c="dimmed">
                Spent nullifiers:
              </Text>
              {state.nullifiers.map((n, i) => (
                <Code key={i} block>
                  {n.slice(0, 40)}...
                </Code>
              ))}
            </>
          )}
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text size="sm" fw={600}>
            Privacy Analysis
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Category</Table.Th>
                <Table.Th>Details</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>
                  <Badge variant="light" color="green">
                    Public
                  </Badge>
                </Table.Td>
                <Table.Td>{privacy.publicInfo.join(", ")}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Badge variant="light" color="red">
                    Hidden
                  </Badge>
                </Table.Td>
                <Table.Td>{privacy.hiddenInfo.join(", ")}</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          <Alert variant="light" color="green" p="xs">
            <Text size="xs">
              <strong>Verifier knows:</strong> {privacy.verifierKnows}
            </Text>
          </Alert>
          <Alert variant="light" color="red" p="xs">
            <Text size="xs">
              <strong>Verifier does NOT know:</strong>{" "}
              {privacy.verifierDoesNotKnow}
            </Text>
          </Alert>
        </Stack>
      </Paper>
    </Stack>
  );
}
