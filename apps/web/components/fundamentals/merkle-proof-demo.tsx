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
  Box,
} from "@mantine/core";
import {
  IconBinaryTree,
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { MerkleTree, type MerkleProof } from "../../lib/blockchain/merkle";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { OnChainSection } from "../shared/on-chain-section";

function MerkleTreeVisual({
  tree,
  selectedLeaf,
  proof,
}: {
  tree: MerkleTree;
  selectedLeaf: number | null;
  proof: MerkleProof | null;
}) {
  const levels = tree.levels;
  const totalLevels = levels.length;
  const nodeWidth = 80;
  const nodeHeight = 28;
  const levelGap = 48;
  const maxWidth = Math.max(levels[0].length * (nodeWidth + 12), 300);
  const svgHeight = totalLevels * (nodeHeight + levelGap) + 20;

  const proofHashes = new Set<string>();
  if (proof) {
    proofHashes.add(proof.leaf);
    proofHashes.add(proof.root);
    for (const s of proof.siblings) {
      proofHashes.add(s.hash);
    }
  }

  function getNodeX(position: number, levelLength: number): number {
    const spacing = maxWidth / (levelLength + 1);
    return spacing * (position + 1);
  }

  function getNodeY(level: number): number {
    return (totalLevels - 1 - level) * (nodeHeight + levelGap) + 10;
  }

  function isOnProofPath(hash: string): boolean {
    return proofHashes.has(hash);
  }

  return (
    <Paper p="md" withBorder data-testid="merkle-tree-visual">
      <Text size="sm" fw={600} mb="sm">
        Merkle Tree Structure
      </Text>
      <Box style={{ overflowX: "auto" }}>
        <svg
          width={maxWidth}
          height={svgHeight}
          viewBox={`0 0 ${maxWidth} ${svgHeight}`}
        >
          {/* Lines connecting parent to children */}
          {levels.map(
            (levelNodes, levelIdx) =>
              levelIdx > 0 &&
              levelNodes.map((node) => {
                const px = getNodeX(node.position, levelNodes.length);
                const py = getNodeY(node.level) + nodeHeight;
                const childLevel = levels[levelIdx - 1];
                const leftChildPos = node.position * 2;
                const rightChildPos = node.position * 2 + 1;

                return (
                  <g key={`lines-${levelIdx}-${node.position}`}>
                    {leftChildPos < childLevel.length && (
                      <line
                        x1={px}
                        y1={py}
                        x2={getNodeX(leftChildPos, childLevel.length)}
                        y2={getNodeY(levelIdx - 1)}
                        stroke={
                          isOnProofPath(node.hash) &&
                          isOnProofPath(childLevel[leftChildPos].hash)
                            ? "var(--mantine-color-blue-5)"
                            : "var(--mantine-color-gray-4)"
                        }
                        strokeWidth={
                          isOnProofPath(node.hash) &&
                          isOnProofPath(childLevel[leftChildPos].hash)
                            ? 2.5
                            : 1
                        }
                      />
                    )}
                    {rightChildPos < childLevel.length && (
                      <line
                        x1={px}
                        y1={py}
                        x2={getNodeX(rightChildPos, childLevel.length)}
                        y2={getNodeY(levelIdx - 1)}
                        stroke={
                          isOnProofPath(node.hash) &&
                          isOnProofPath(childLevel[rightChildPos].hash)
                            ? "var(--mantine-color-blue-5)"
                            : "var(--mantine-color-gray-4)"
                        }
                        strokeWidth={
                          isOnProofPath(node.hash) &&
                          isOnProofPath(childLevel[rightChildPos].hash)
                            ? 2.5
                            : 1
                        }
                      />
                    )}
                  </g>
                );
              }),
          )}

          {/* Nodes */}
          {levels.map((levelNodes, levelIdx) =>
            levelNodes.map((node) => {
              const x = getNodeX(node.position, levelNodes.length);
              const y = getNodeY(node.level);
              const isSelected = levelIdx === 0 && node.index === selectedLeaf;
              const onPath = isOnProofPath(node.hash);

              let fill = "var(--mantine-color-gray-1)";
              let stroke = "var(--mantine-color-gray-4)";
              const textFill = "var(--mantine-color-dark-6)";

              if (isSelected) {
                fill = "var(--mantine-color-green-1)";
                stroke = "var(--mantine-color-green-5)";
              } else if (onPath) {
                fill = "var(--mantine-color-blue-1)";
                stroke = "var(--mantine-color-blue-5)";
              }

              if (levelIdx === totalLevels - 1) {
                fill = onPath
                  ? "var(--mantine-color-blue-2)"
                  : "var(--mantine-color-violet-1)";
                stroke = onPath
                  ? "var(--mantine-color-blue-5)"
                  : "var(--mantine-color-violet-4)";
              }

              return (
                <g key={`node-${levelIdx}-${node.position}`}>
                  <rect
                    x={x - nodeWidth / 2}
                    y={y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx={4}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSelected || onPath ? 2 : 1}
                  />
                  <text
                    x={x}
                    y={y + nodeHeight / 2 + 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill={textFill}
                    fontFamily="monospace"
                  >
                    {node.data ? node.data : node.hash.slice(2, 10) + "..."}
                  </text>
                </g>
              );
            }),
          )}
        </svg>
      </Box>
      {proof && (
        <Text size="xs" c="dimmed" mt="xs">
          Blue path shows the verification route from leaf to root. Sibling
          nodes are highlighted along the proof path.
        </Text>
      )}
    </Paper>
  );
}

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

  const handleRemoveItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setProof(null);
    setVerifyResult(null);
    setSelectedLeaf(null);
  }, []);

  const handleGenerateProof = useCallback(
    (index: number) => {
      if (!tree) return;
      setSelectedLeaf(index);
      const p = tree.getProof(index);
      setProof(p);
      setVerifyResult(null);
    },
    [tree],
  );

  const handleVerifyProof = useCallback(() => {
    if (!proof) return;
    const result = MerkleTree.verifyProof(proof);
    setVerifyResult(result);
  }, [proof]);

  const inputPanel = (
    <Stack gap="md">
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
              <Code
                block
                style={{ wordBreak: "break-all", fontSize: "0.7rem" }}
              >
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
                  verifyResult ? <IconCheck size={16} /> : <IconX size={16} />
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

  const resultPanel = (
    <Stack gap="md">
      {tree ? (
        <MerkleTreeVisual
          tree={tree}
          selectedLeaf={selectedLeaf}
          proof={proof}
        />
      ) : (
        <Paper p="md" withBorder>
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Add at least 2 items to build a Merkle tree
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
              title: "Hash Leaves",
              description:
                "Each data item is hashed to create leaf nodes at the bottom of the tree.",
            },
            {
              title: "Pairwise Hashing",
              description:
                "Adjacent leaf hashes are concatenated and hashed again to form parent nodes, repeating until one root remains.",
            },
            {
              title: "Generate Proof",
              description:
                "A proof consists of sibling hashes along the path from a leaf to the root — only log2(N) hashes needed.",
            },
            {
              title: "Verify Inclusion",
              description:
                "The verifier reconstructs the root by hashing up the proof path. If it matches, the data is proven to be in the tree.",
            },
          ]}
          whyItMatters="Merkle trees enable efficient data verification in blockchains. Bitcoin and Ethereum use them to summarize all transactions in a block into a single merkle root, allowing light clients to verify individual transactions without downloading the entire block."
          tips={[
            "Click 'Prove' on a leaf to generate its proof, then observe the highlighted path in the tree",
            "The proof size is logarithmic — even with millions of leaves, only ~20 hashes are needed",
            "Try adding more items to see the tree grow deeper",
          ]}
        />
      }
      onChainContent={
        <OnChainSection
          contractName="MerkleProofVerifier"
          contractDescription="An on-chain Merkle proof verifier that recomputes the root hash from a leaf and its sibling proof path. It uses the same algorithm as the demo: iteratively hashing with siblings based on the leaf index to reconstruct and compare the Merkle root."
          network="Base Sepolia"
          functions={[
            {
              name: "verify",
              signature:
                "function verify(bytes32[] calldata proof, bytes32 root, bytes32 leaf, uint256 index) external returns (bool valid)",
              description:
                "Verify a Merkle inclusion proof on-chain. Takes the array of sibling hashes, the expected root, the leaf hash, and the leaf index. Emits a ProofVerified event with the result.",
            },
          ]}
        />
      }
    />
  );
}
