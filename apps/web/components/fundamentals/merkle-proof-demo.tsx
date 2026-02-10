"use client";

import { useState, useCallback, useMemo } from "react";
import { GitBranch, Plus, Trash2, Check, X } from "lucide-react";
import { MerkleTree, type MerkleProof } from "../../lib/blockchain/merkle";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { OnChainSection } from "../shared/on-chain-section";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

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
    <div className="rounded-lg border border-border bg-card p-4" data-testid="merkle-tree-visual">
      <p className="text-sm font-semibold mb-2">
        Merkle Tree Structure
      </p>
      <div className="overflow-x-auto">
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
                        style={{
                          stroke:
                            isOnProofPath(node.hash) &&
                            isOnProofPath(childLevel[leftChildPos].hash)
                              ? "var(--viz-blue)"
                              : "hsl(var(--muted-foreground) / 0.3)",
                        }}
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
                        style={{
                          stroke:
                            isOnProofPath(node.hash) &&
                            isOnProofPath(childLevel[rightChildPos].hash)
                              ? "var(--viz-blue)"
                              : "hsl(var(--muted-foreground) / 0.3)",
                        }}
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

              let fill = "hsl(var(--muted))";
              let fillOpacity: number | undefined;
              let stroke = "hsl(var(--muted-foreground) / 0.3)";
              let strokeOpacity: number | undefined;
              const textFill = "hsl(var(--foreground))";

              if (isSelected) {
                fill = "var(--viz-green)";
                fillOpacity = 0.15;
                stroke = "var(--viz-green)";
              } else if (onPath) {
                fill = "var(--viz-blue)";
                fillOpacity = 0.15;
                stroke = "var(--viz-blue)";
              }

              if (levelIdx === totalLevels - 1) {
                fill = onPath ? "var(--viz-blue)" : "var(--viz-purple)";
                fillOpacity = onPath ? 0.2 : 0.15;
                stroke = onPath ? "var(--viz-blue)" : "var(--viz-purple)";
                strokeOpacity = onPath ? undefined : 0.5;
              }

              return (
                <g key={`node-${levelIdx}-${node.position}`}>
                  <rect
                    x={x - nodeWidth / 2}
                    y={y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx={4}
                    style={{ fill, fillOpacity, stroke, strokeOpacity }}
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
      </div>
      {proof && (
        <p className="text-xs text-muted-foreground mt-1">
          Blue path shows the verification route from leaf to root. Sibling
          nodes are highlighted along the proof path.
        </p>
      )}
    </div>
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
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Step 1: Build Merkle Tree
          </p>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add data item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Index</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Leaf Hash</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow
                  key={i}
                  className={selectedLeaf === i ? "bg-blue-50 dark:bg-blue-950" : ""}
                >
                  <TableCell>{i}</TableCell>
                  <TableCell>{item}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.6rem]">
                      {tree?.leaves[i]?.hash.slice(0, 16)}...
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleGenerateProof(i)}
                        disabled={!tree}
                      >
                        Prove
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 dark:text-red-400"
                        onClick={() => handleRemoveItem(i)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {tree && (
            <div>
              <p className="text-xs text-muted-foreground">
                Merkle Root
              </p>
              <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto break-all">
                <code>{tree.root.hash}</code>
              </pre>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="secondary">
                  {items.length} leaves
                </Badge>
                <Badge variant="secondary">
                  {tree.levels.length} levels
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {proof && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">
              Step 2: Merkle Proof for &quot;{items[selectedLeaf!]}&quot;
            </p>

            <div>
              <p className="text-xs text-muted-foreground">
                Leaf Hash
              </p>
              <pre className="rounded-lg bg-muted p-3 overflow-x-auto break-all text-[0.7rem]">
                <code>{proof.leaf}</code>
              </pre>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Proof Siblings ({proof.siblings.length})
              </p>
              {proof.siblings.map((s, i) => (
                <div key={i} className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary">
                    {s.position}
                  </Badge>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono break-all text-[0.6rem]">
                    {s.hash.slice(0, 24)}...
                  </code>
                </div>
              ))}
            </div>

            <Button onClick={handleVerifyProof}>
              <GitBranch className="h-4 w-4 mr-2" />
              Verify Proof
            </Button>

            {verifyResult !== null && (
              <Alert className={verifyResult ? "border-green-500" : "border-red-500"}>
                {verifyResult ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <AlertTitle>{verifyResult ? "Proof Valid" : "Proof Invalid"}</AlertTitle>
                <AlertDescription>
                  {verifyResult
                    ? "The Merkle proof is valid — the data is included in the tree."
                    : "The Merkle proof is invalid."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      {tree ? (
        <MerkleTreeVisual
          tree={tree}
          selectedLeaf={selectedLeaf}
          proof={proof}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground text-center py-8">
            Add at least 2 items to build a Merkle tree
          </p>
        </div>
      )}
    </div>
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
