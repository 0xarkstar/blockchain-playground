"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import {
  createRollupState,
  processBatch,
  calculateCompression,
  type RollupState,
  type BatchResult,
} from "../../lib/zk/rollup";
import { SimpleBarChart } from "../shared";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const INITIAL_ACCOUNTS = [
  { address: "alice", balance: 1000n },
  { address: "bob", balance: 500n },
  { address: "charlie", balance: 200n },
];

export function ZKRollupDemo() {
  const [state, setState] = useState<RollupState>(() =>
    createRollupState(INITIAL_ACCOUNTS),
  );
  const [batches, setBatches] = useState<BatchResult[]>([]);
  const [txFrom, setTxFrom] = useState("alice");
  const [txTo, setTxTo] = useState("bob");
  const [txAmount, setTxAmount] = useState(100);
  const [pendingTxs, setPendingTxs] = useState<
    { from: string; to: string; amount: bigint }[]
  >([]);
  const [batchSize, setBatchSize] = useState(100);

  const compression = useMemo(
    () => calculateCompression(batchSize),
    [batchSize],
  );

  const handleAddTx = () => {
    setPendingTxs([
      ...pendingTxs,
      { from: txFrom, to: txTo, amount: BigInt(txAmount) },
    ]);
  };

  const handleProcessBatch = () => {
    if (pendingTxs.length === 0) return;
    const result = processBatch(state, pendingTxs);
    setState(result.newState);
    setBatches([...batches, result]);
    setPendingTxs([]);
  };

  const handleReset = () => {
    setState(createRollupState(INITIAL_ACCOUNTS));
    setBatches([]);
    setPendingTxs([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          ZK Rollups batch transactions off-chain and post a validity proof
          on-chain. This simulator shows the mechanics: state roots, batch proofs,
          and gas savings.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              L2 State (Block #{state.blockNumber})
            </p>
            <Button
              onClick={handleReset}
              variant="secondary"
              size="sm"
            >
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Root: <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{state.stateRoot.slice(0, 20)}...</code>
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Nonce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.accounts.map((a) => (
                <TableRow key={a.address}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{a.address}</code>
                  </TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{a.balance.toString()}</code>
                  </TableCell>
                  <TableCell className="text-right">{a.nonce}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Add Transaction
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>From</Label>
              <Input
                value={txFrom}
                onChange={(e) => setTxFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                value={txTo}
                onChange={(e) => setTxTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={txAmount}
                onChange={(e) => setTxAmount(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={handleAddTx}>
              Add to Batch
            </Button>
            <Button
              variant="secondary"
              className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
              onClick={handleProcessBatch}
              disabled={pendingTxs.length === 0}
            >
              Process Batch ({pendingTxs.length} txs)
            </Button>
          </div>
          {pendingTxs.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTxs.map((tx, i) => (
                  <TableRow key={i}>
                    <TableCell>{tx.from}</TableCell>
                    <TableCell>{tx.to}</TableCell>
                    <TableCell>{tx.amount.toString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {batches.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Processed Batches
            </p>
            {batches.map((batch) => (
              <div key={batch.batchNumber} className="rounded-lg border border-border bg-card p-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Batch #{batch.batchNumber}</Badge>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                        {batch.successCount} ok
                      </Badge>
                      {batch.failCount > 0 && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs">
                          {batch.failCount} failed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs">
                    Proof: <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{batch.proofHash.slice(0, 20)}...</code>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Gas Compression Analysis
          </p>
          <div>
            <Label>Batch size (transactions)</Label>
            <Input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value) || 1)}
              min={1}
              max={10000}
            />
          </div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>L1 gas (individual txs)</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{compression.l1TotalGas.toLocaleString()}</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>L2 gas (rollup)</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{compression.l2TotalGas.toLocaleString()}</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Proof verification cost</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{compression.l2ProofGas.toLocaleString()}</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gas savings</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={
                      compression.savings > 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }
                  >
                    {compression.savings}%
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Compression ratio</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{compression.compressionRatio}x</code>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <SimpleBarChart
            data={[
              { type: "L1 Individual", gas: compression.l1TotalGas },
              { type: "L2 Rollup", gas: compression.l2TotalGas },
            ]}
            xKey="type"
            yKeys={["gas"]}
            colors={["#fa5252", "#40c057"]}
            height={200}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Batch Processing Flow
          </p>
          <svg width="100%" height={80} viewBox="0 0 520 80">
            {[
              { label: "Transactions", x: 10, fill: "fill-blue-100 dark:fill-blue-900", stroke: "stroke-blue-500 dark:stroke-blue-400", text: "fill-blue-900 dark:fill-blue-200" },
              { label: "Batch", x: 140, fill: "fill-violet-100 dark:fill-violet-900", stroke: "stroke-violet-500 dark:stroke-violet-400", text: "fill-violet-900 dark:fill-violet-200" },
              { label: "ZK Proof", x: 270, fill: "fill-orange-100 dark:fill-orange-900", stroke: "stroke-orange-500 dark:stroke-orange-400", text: "fill-orange-900 dark:fill-orange-200" },
              { label: "L1 Submit", x: 400, fill: "fill-green-100 dark:fill-green-900", stroke: "stroke-green-500 dark:stroke-green-400", text: "fill-green-900 dark:fill-green-200" },
            ].map((step, i) => (
              <g key={step.label}>
                <rect
                  x={step.x}
                  y={20}
                  width={100}
                  height={40}
                  rx={8}
                  className={`${step.fill} ${step.stroke}`}
                  strokeWidth={1.5}
                />
                <text
                  x={step.x + 50}
                  y={45}
                  textAnchor="middle"
                  fontSize={11}
                  className={step.text}
                >
                  {step.label}
                </text>
                {i < 3 && (
                  <text
                    x={step.x + 120}
                    y={45}
                    textAnchor="middle"
                    fontSize={16}
                    className="fill-muted-foreground"
                  >
                    {"\u2192"}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
