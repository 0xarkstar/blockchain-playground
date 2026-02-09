"use client";

import { useState, useCallback, useRef } from "react";
import { Pickaxe, Square } from "lucide-react";
import {
  createGenesisBlock,
  createBlock,
  createTransaction,
  computeBlockHash,
  meetsTarget,
} from "../../lib/blockchain/block";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { SimpleLineChart } from "../shared/charts";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Progress } from "../ui/progress";

interface MiningStats {
  hashesComputed: number;
  hashRate: number;
  currentNonce: number;
  currentHash: string;
  elapsedMs: number;
  found: boolean;
}

interface MiningHistoryEntry {
  attempt: number;
  difficulty: number;
  hashes: number;
  timeMs: number;
  hashRate: number;
}

export function MiningSimulatorDemo() {
  const [difficulty, setDifficulty] = useState(3);
  const [mining, setMining] = useState(false);
  const [stats, setStats] = useState<MiningStats | null>(null);
  const [miningHistory, setMiningHistory] = useState<MiningHistoryEntry[]>([]);
  const cancelRef = useRef(false);

  const handleStartMining = useCallback(() => {
    setMining(true);
    cancelRef.current = false;

    const genesis = createGenesisBlock();
    const tx = createTransaction("0xMiner", "0xReward", 6.25);
    const block = createBlock(genesis, [tx], difficulty);
    const start = performance.now();
    let hashesComputed = 0;
    let nonce = 0;

    const batchSize = 5000;

    const mineStep = () => {
      if (cancelRef.current) {
        setMining(false);
        return;
      }

      for (let i = 0; i < batchSize; i++) {
        const header = { ...block.header, nonce };
        const blockHash = computeBlockHash(header);
        hashesComputed++;

        if (meetsTarget(blockHash, difficulty)) {
          const elapsed = performance.now() - start;
          const rate = hashesComputed / (elapsed / 1000);
          setStats({
            hashesComputed,
            hashRate: rate,
            currentNonce: nonce,
            currentHash: blockHash,
            elapsedMs: elapsed,
            found: true,
          });
          setMiningHistory((prev) => [
            ...prev,
            {
              attempt: prev.length + 1,
              difficulty,
              hashes: hashesComputed,
              timeMs: Math.round(elapsed),
              hashRate: Math.round(rate),
            },
          ]);
          setMining(false);
          return;
        }
        nonce++;
      }

      const elapsed = performance.now() - start;
      setStats({
        hashesComputed,
        hashRate: hashesComputed / (elapsed / 1000),
        currentNonce: nonce,
        currentHash: computeBlockHash({ ...block.header, nonce }),
        elapsedMs: elapsed,
        found: false,
      });

      requestAnimationFrame(mineStep);
    };

    requestAnimationFrame(mineStep);
  }, [difficulty]);

  const handleStop = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Mining Difficulty
          </p>
          <p className="text-xs text-muted-foreground">
            Difficulty: {difficulty} (hash must start with {difficulty} zeros).
            Higher = exponentially harder.
          </p>
          <Slider
            value={[difficulty]}
            onValueChange={(v) => setDifficulty(v[0])}
            min={1}
            max={6}
            step={1}
            disabled={mining}
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            {[1, 2, 3, 4, 5, 6].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!mining ? (
          <Button onClick={handleStartMining}>
            <Pickaxe className="h-4 w-4 mr-2" />
            Start Mining
          </Button>
        ) : (
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleStop}
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Mining
          </Button>
        )}
      </div>

      {stats && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Mining Progress
              </p>
              {stats.found && (
                <Badge className="bg-green-600 text-white">
                  Block Found!
                </Badge>
              )}
            </div>

            {mining && <Progress value={100} className="animate-pulse" />}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  Hashes Computed
                </p>
                <p className="text-lg font-bold">
                  {stats.hashesComputed.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  Hash Rate
                </p>
                <p className="text-lg font-bold">
                  {stats.hashRate > 1000
                    ? `${(stats.hashRate / 1000).toFixed(1)} KH/s`
                    : `${stats.hashRate.toFixed(0)} H/s`}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  Current Nonce
                </p>
                <p className="text-lg font-bold">
                  {stats.currentNonce.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  Elapsed Time
                </p>
                <p className="text-lg font-bold">
                  {(stats.elapsedMs / 1000).toFixed(2)}s
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                {stats.found ? "Winning Hash" : "Current Hash"}
              </p>
              <pre
                className={`rounded-lg p-3 text-sm overflow-x-auto break-all ${stats.found ? "bg-green-100 dark:bg-green-900" : "bg-muted"}`}
              >
                <code>{stats.currentHash}</code>
              </pre>
            </div>

            <p className="text-xs text-muted-foreground">
              Target: hash must start with <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{"0".repeat(difficulty)}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      {miningHistory.length > 0 ? (
        <div className="rounded-lg border border-border bg-card p-4" data-testid="mining-history-chart">
          <p className="text-sm font-semibold mb-2">
            Mining History
          </p>
          <SimpleLineChart
            data={miningHistory}
            xKey="attempt"
            yKeys={["hashes", "hashRate"]}
            height={250}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Track how difficulty affects hashes needed and hash rate across
            mining attempts
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground text-center py-8">
            Mine blocks at different difficulty levels to build a history chart
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
              title: "Set Difficulty Target",
              description:
                "The difficulty determines how many leading zeros the block hash must have.",
              details: [
                "Difficulty 1 = hash starts with '0'",
                "Difficulty 4 = hash starts with '0000'",
                "Each additional zero makes it ~16x harder",
              ],
            },
            {
              title: "Nonce Search",
              description:
                "The miner tries different nonce values, computing the block hash each time, until one meets the target.",
            },
            {
              title: "Proof of Work",
              description:
                "Finding a valid nonce proves the miner invested computational effort. This is easy to verify but hard to find.",
            },
          ]}
          whyItMatters="Mining is the mechanism that secures Proof-of-Work blockchains like Bitcoin. The difficulty adjustment ensures blocks are found at a predictable rate regardless of total network hash power."
          tips={[
            "Try difficulty 1 vs 5 — notice the exponential increase in hashes needed",
            "Mine several blocks at different difficulties to see the history chart populate",
            "Real Bitcoin mining adjusts difficulty every 2016 blocks (~2 weeks)",
          ]}
        />
      }
    />
  );
}
