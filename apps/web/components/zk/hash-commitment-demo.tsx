"use client";

import { useState } from "react";
import {
  Stack, Paper, TextInput, Button, Table, Code, Badge, Group, Text, Alert, Select,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createCommitment,
  verifyCommitment,
  generateNonce,
  type HashScheme,
} from "../../lib/zk/commitment";

type Phase = "commit" | "reveal";

export function HashCommitmentDemo() {
  const [secret, setSecret] = useState("42");
  const [nonce, setNonce] = useState(() => generateNonce());
  const [scheme, setScheme] = useState<HashScheme>("sha256");
  const [phase, setPhase] = useState<Phase>("commit");
  const [commitHash, setCommitHash] = useState("");
  const [revealSecret, setRevealSecret] = useState("");
  const [revealNonce, setRevealNonce] = useState("");
  const [result, setResult] = useState("");
  const [resultValid, setResultValid] = useState<boolean | null>(null);

  const handleCommit = () => {
    const c = createCommitment(secret, nonce, scheme);
    setCommitHash(c.commitHash);
    setPhase("reveal");
    setResult(`Commitment created with ${scheme}`);
    setResultValid(null);
  };

  const handleReveal = () => {
    const v = verifyCommitment(revealSecret, revealNonce, commitHash, scheme);
    setResult(v.message);
    setResultValid(v.valid);
  };

  const handleReset = () => {
    setPhase("commit");
    setCommitHash("");
    setRevealSecret("");
    setRevealNonce("");
    setResult("");
    setResultValid(null);
    setNonce(generateNonce());
  };

  return (
    <Stack gap="lg">
      <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
        A commitment scheme lets you &quot;lock in&quot; a value without revealing it.
        Later, you reveal the value and nonce to prove you committed to it.
      </Alert>

      {phase === "commit" ? (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>Phase 1: Commit</Text>
            <TextInput
              label="Secret value"
              value={secret}
              onChange={(e) => setSecret(e.currentTarget.value)}
            />
            <TextInput
              label="Random nonce"
              value={nonce}
              onChange={(e) => setNonce(e.currentTarget.value)}
              description="Random blinding factor prevents guessing"
            />
            <Select
              label="Hash scheme"
              value={scheme}
              onChange={(v) => setScheme((v as HashScheme) ?? "sha256")}
              data={[
                { value: "sha256", label: "SHA-256" },
                { value: "keccak256", label: "Keccak-256 (Ethereum)" },
              ]}
            />
            <Button onClick={handleCommit} variant="light">
              Create Commitment
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="md">
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text size="sm" fw={600}>Commitment (public)</Text>
              <Code block>{commitHash}</Code>
              <Badge variant="light" color="blue">{scheme}</Badge>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="md">
              <Text size="sm" fw={600}>Phase 2: Reveal</Text>
              <TextInput
                label="Reveal secret"
                value={revealSecret}
                onChange={(e) => setRevealSecret(e.currentTarget.value)}
                placeholder="Enter the original secret"
              />
              <TextInput
                label="Reveal nonce"
                value={revealNonce}
                onChange={(e) => setRevealNonce(e.currentTarget.value)}
                placeholder="Enter the original nonce"
              />
              <Group>
                <Button onClick={handleReveal} variant="light" color="green">
                  Verify
                </Button>
                <Button onClick={handleReset} variant="light" color="gray">
                  Reset
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      )}

      {result && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          variant="light"
          color={resultValid === null ? "blue" : resultValid ? "green" : "red"}
        >
          {result}
        </Alert>
      )}

      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text size="sm" fw={600}>How It Works</Text>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td><Badge variant="light" size="sm">Commit</Badge></Table.Td>
                <Table.Td>hash(secret || nonce) → commitment</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td><Badge variant="light" size="sm" color="green">Reveal</Badge></Table.Td>
                <Table.Td>Publish (secret, nonce). Anyone can verify hash matches.</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td><Badge variant="light" size="sm" color="yellow">Hiding</Badge></Table.Td>
                <Table.Td>Commitment reveals nothing about the secret</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td><Badge variant="light" size="sm" color="red">Binding</Badge></Table.Td>
                <Table.Td>Cannot find another (secret, nonce) that gives the same hash</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
