"use client";

import { useState, useCallback } from "react";
import { Box, Pickaxe, Plus } from "lucide-react";
import {
  createGenesisBlock,
  createBlock,
  createTransaction,
  mineBlock,
  type Block,
  type Transaction,
  type MiningResult,
} from "../../lib/blockchain/block";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function BlockchainVisual({ block }: { block: Block }) {
  const genesis = {
    index: 0,
    hash: block.header.previousHash,
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4" data-testid="blockchain-visual">
      <p className="text-sm font-semibold mb-4">
        Blockchain Structure
      </p>
      <div className="flex gap-0 flex-nowrap overflow-x-auto">
        {/* Genesis block */}
        <div
          className="rounded-lg border border-gray-400 bg-card p-3"
          style={{ minWidth: 160 }}
        >
          <Badge variant="secondary" className="mb-1 text-xs">
            Genesis
          </Badge>
          <p className="text-xs text-muted-foreground">
            Hash
          </p>
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
            {genesis.hash.slice(0, 16)}...
          </code>
        </div>

        {/* Arrow connecting blocks */}
        <div className="px-1 flex items-center">
          <svg width="40" height="24" viewBox="0 0 40 24">
            <line
              x1="0"
              y1="12"
              x2="30"
              y2="12"
              stroke="hsl(217.2 91.2% 59.8%)"
              strokeWidth="2"
            />
            <polygon
              points="30,6 40,12 30,18"
              fill="hsl(217.2 91.2% 59.8%)"
            />
          </svg>
        </div>

        {/* Mined block */}
        <div
          className="rounded-lg border-2 border-green-500 bg-card p-3"
          style={{ minWidth: 160 }}
        >
          <Badge className="mb-1 text-xs bg-green-600">
            Block #{block.index}
          </Badge>
          <p className="text-xs text-muted-foreground">
            Prev Hash
          </p>
          <code className="rounded bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 text-xs font-mono">
            {block.header.previousHash.slice(0, 16)}...
          </code>
          <p className="text-xs text-muted-foreground mt-1">
            Hash
          </p>
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
            {block.hash.slice(0, 16)}...
          </code>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="secondary" className="text-xs">
              {block.transactions.length} TXs
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Nonce: {block.header.nonce}
            </Badge>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        The previous hash in Block #{block.index} matches the genesis block
        hash, creating a cryptographic link
      </p>
    </div>
  );
}

export function BlockBuilderDemo() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [from, setFrom] = useState("0xAlice");
  const [to, setTo] = useState("0xBob");
  const [amount, setAmount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState(2);
  const [block, setBlock] = useState<Block | null>(null);
  const [miningResult, setMiningResult] = useState<MiningResult | null>(null);
  const [mining, setMining] = useState(false);

  const handleAddTransaction = useCallback(() => {
    const tx = createTransaction(from, to, amount);
    setTransactions((prev) => [...prev, tx]);
  }, [from, to, amount]);

  const handleMineBlock = useCallback(() => {
    if (transactions.length === 0) return;
    setMining(true);

    setTimeout(() => {
      const genesis = createGenesisBlock();
      const newBlock = createBlock(genesis, transactions, difficulty);
      const result = mineBlock(newBlock);
      setBlock(result.block);
      setMiningResult(result);
      setMining(false);
    }, 10);
  }, [transactions, difficulty]);

  const handleReset = useCallback(() => {
    setTransactions([]);
    setBlock(null);
    setMiningResult(null);
  }, []);

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Step 1: Create Transactions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label>From</Label>
              <Input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleAddTransaction}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>

          {transactions.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{tx.id.slice(0, 10)}...</code>
                    </TableCell>
                    <TableCell>{tx.from}</TableCell>
                    <TableCell>{tx.to}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Step 2: Configure Mining Difficulty
          </p>
          <p className="text-xs text-muted-foreground">
            Difficulty: {difficulty} (requires {difficulty} leading zeros in
            hash)
          </p>
          <Slider
            value={[difficulty]}
            onValueChange={(v) => setDifficulty(v[0])}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleMineBlock}
          disabled={transactions.length === 0 || mining}
        >
          <Pickaxe className="h-4 w-4 mr-2" />
          {mining ? "Mining..." : "Mine Block"}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      {miningResult && block ? (
        <>
          <BlockchainVisual block={block} />

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Mined Block
                </p>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Block #{block.index}
                  </Badge>
                  <Badge variant="secondary">Nonce: {miningResult.nonce}</Badge>
                </div>
              </div>

              <Alert className="border-green-500">
                <Box className="h-4 w-4" />
                <AlertTitle>Block Mined Successfully</AlertTitle>
                <AlertDescription>
                  Found valid nonce after {miningResult.hashesComputed} hashes in{" "}
                  {miningResult.timeMs.toFixed(1)}ms
                </AlertDescription>
              </Alert>

              <div>
                <p className="text-xs text-muted-foreground">
                  Block Hash
                </p>
                <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto break-all">
                  <code>{block.hash}</code>
                </pre>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Previous Hash
                </p>
                <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto break-all">
                  <code>{block.header.previousHash}</code>
                </pre>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Merkle Root
                </p>
                <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto break-all">
                  <code>{block.header.merkleRoot}</code>
                </pre>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <Badge>Difficulty: {block.header.difficulty}</Badge>
                <Badge>Nonce: {block.header.nonce}</Badge>
                <Badge>TXs: {block.transactions.length}</Badge>
                <Badge>
                  Hash Rate:{" "}
                  {(
                    miningResult.hashesComputed /
                    (miningResult.timeMs / 1000)
                  ).toFixed(0)}{" "}
                  H/s
                </Badge>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground text-center py-8">
            Add transactions and mine a block to see the blockchain structure
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
              title: "Collect Transactions",
              description:
                "Miners gather pending transactions from the mempool into a candidate block.",
            },
            {
              title: "Build Block Header",
              description:
                "The header includes previous block hash, merkle root of transactions, timestamp, and difficulty target.",
            },
            {
              title: "Mine (Proof of Work)",
              description:
                "The miner increments the nonce until the block hash meets the difficulty target (starts with N zeros).",
            },
            {
              title: "Chain the Block",
              description:
                "The new block's previous hash field links it to the last block, forming an immutable chain.",
            },
          ]}
          whyItMatters="Blocks are the fundamental data structure of a blockchain. Each block cryptographically references its predecessor, making it computationally infeasible to alter past transactions without redoing all subsequent proof-of-work."
          tips={[
            "Higher difficulty exponentially increases mining time — try difficulty 4 vs 2",
            "The merkle root is a single hash summarizing all transactions in the block",
            "Notice how the previous hash in the mined block exactly matches the genesis hash",
          ]}
        />
      }
    />
  );
}
