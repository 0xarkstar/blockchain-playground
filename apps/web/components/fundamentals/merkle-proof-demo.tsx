"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Stack,
  TextInput,
  Button,
  Code,
  Text,
  Paper,
  Group,
  Badge,
  Alert,
  Table,
  ActionIcon,
} from "@mantine/core";
import {
  IconBinaryTree,
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { MerkleTree, type MerkleProof } from "../../lib/blockchain/merkle";

export function MerkleProofDemo() {
  const [items, setItems] = useState<string[]>([
    "Alice",
    "Bob",
    "Charlie",
    "Dave",
  ]);
  const [newItem, setNewItem] = useState("");
  const [selectedLeaf, setSelectedLeaf] = useState<number | null>(null);
  const [proof, setProof] = useState<MerkleProof | null>(null);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const tree = useMemo(() => {
    if (items.length < 2) return null;
    return new MerkleTree(items);
  }, [items]);

  const handleAddItem = useCallback(() => {
    if (!newItem.trim()) return;
    setItems((prev) => [...prev, newItem.trim()]);
    setNewItem("");
    setProof(null);
    setVerifyResult(null);
  }, [newItem]);

  const handleRemoveItem = useCallback(
    (index: number) => {
      setItems((prev) => prev.filter((_, i) => i !== index));
      setProof(null);
      setVerifyResult(null);
      setSelectedLeaf(null);
    },
    []
  );

  const handleGenerateProof = useCallback(
    (index: number) => {
      if (!tree) return;
      setSelectedLeaf(index);
      const p = tree.getProof(index);
      setProof(p);
      setVerifyResult(null);
    },
    [tree]
  );

  const handleVerifyProof = useCallback(() => {
    if (!proof) return;
    const result = MerkleTree.verifyProof(proof);
    setVerifyResult(result);
  }, [proof]);

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Step 1: Build Merkle Tree
          </Text>
          <Group>
            <TextInput
              placeholder="Add data item..."
              value={newItem}
              onChange={(e) => setNewItem(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              style={{ flex: 1 }}
              size="sm"
            />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAddItem}
              variant="outline"
              size="sm"
            >
              Add
            </Button>
          </Group>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Index</Table.Th>
                <Table.Th>Data</Table.Th>
                <Table.Th>Leaf Hash</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item, i) => (
                <Table.Tr
                  key={i}
                  style={{
                    backgroundColor:
                      selectedLeaf === i
                        ? "var(--mantine-color-blue-light)"
                        : undefined,
                  }}
                >
                  <Table.Td>{i}</Table.Td>
                  <Table.Td>{item}</Table.Td>
                  <Table.Td>
                    <Code style={{ fontSize: "0.6rem" }}>
                      {tree?.leaves[i]?.hash.slice(0, 16)}...
                    </Code>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => handleGenerateProof(i)}
                        disabled={!tree}
                      >
                        Prove
                      </Button>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleRemoveItem(i)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {tree && (
            <div>
              <Text size="xs" c="dimmed">
                Merkle Root
              </Text>
              <Code block style={{ wordBreak: "break-all" }}>
                {tree.root.hash}
              </Code>
              <Group gap="xs" mt="xs">
                <Badge variant="light" size="sm">
                  {items.length} leaves
                </Badge>
                <Badge variant="light" size="sm">
                  {tree.levels.length} levels
                </Badge>
              </Group>
            </div>
          )}
        </Stack>
      </Paper>

      {proof && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Step 2: Merkle Proof for &quot;{items[selectedLeaf!]}&quot;
            </Text>

            <div>
              <Text size="xs" c="dimmed">
                Leaf Hash
              </Text>
              <Code block style={{ wordBreak: "break-all", fontSize: "0.7rem" }}>
                {proof.leaf}
              </Code>
            </div>

            <div>
              <Text size="xs" c="dimmed">
                Proof Siblings ({proof.siblings.length})
              </Text>
              {proof.siblings.map((s, i) => (
                <Group key={i} gap="xs" mt="xs">
                  <Badge variant="light" size="sm">
                    {s.position}
                  </Badge>
                  <Code style={{ fontSize: "0.6rem", wordBreak: "break-all" }}>
                    {s.hash.slice(0, 24)}...
                  </Code>
                </Group>
              ))}
            </div>

            <Button
              leftSection={<IconBinaryTree size={16} />}
              onClick={handleVerifyProof}
            >
              Verify Proof
            </Button>

            {verifyResult !== null && (
              <Alert
                icon={
                  verifyResult ? (
                    <IconCheck size={16} />
                  ) : (
                    <IconX size={16} />
                  )
                }
                color={verifyResult ? "green" : "red"}
                title={verifyResult ? "Proof Valid" : "Proof Invalid"}
              >
                {verifyResult
                  ? "The Merkle proof is valid — the data is included in the tree."
                  : "The Merkle proof is invalid."}
              </Alert>
            )}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
