"use client";

import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import {
  hash,
  computeAvalancheEffect,
  type HashAlgorithm,
} from "../../lib/blockchain/hash";
import { HashAvalancheVisualizer } from "./hash-avalanche-visualizer";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { SimpleBarChart } from "../shared/charts";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

function computeHexDistribution(hexHash: string): Record<string, unknown>[] {
  const hex = hexHash.startsWith("0x") ? hexHash.slice(2) : hexHash;
  const counts: Record<string, number> = {};
  for (let i = 0; i < 16; i++) {
    counts[i.toString(16)] = 0;
  }
  for (const ch of hex.toLowerCase()) {
    if (counts[ch] !== undefined) {
      counts[ch]++;
    }
  }
  return Object.entries(counts).map(([char, count]) => ({
    char: char.toUpperCase(),
    count,
  }));
}

export function HashExplorerDemo() {
  const [input, setInput] = useState("Hello, Blockchain!");
  const [compareInput, setCompareInput] = useState("Hello, Blockchain?");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("sha256");

  const hashes = useMemo(
    () => ({
      sha256: hash(input, "sha256"),
      keccak256: hash(input, "keccak256"),
      blake2b: hash(input, "blake2b"),
    }),
    [input],
  );

  const currentHash = hashes[algorithm];

  const hexDistribution = useMemo(
    () => computeHexDistribution(currentHash),
    [currentHash],
  );

  const avalanche = useMemo(
    () => computeAvalancheEffect(input, compareInput, algorithm),
    [input, compareInput, algorithm],
  );

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(currentHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Input Text</Label>
        <p className="text-xs text-muted-foreground mb-1">
          Type anything — see how the hash changes instantly
        </p>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <Tabs value={algorithm} onValueChange={(v) => setAlgorithm(v as HashAlgorithm)}>
        <TabsList className="w-full">
          <TabsTrigger value="sha256" className="flex-1">SHA-256</TabsTrigger>
          <TabsTrigger value="keccak256" className="flex-1">Keccak-256</TabsTrigger>
          <TabsTrigger value="blake2b" className="flex-1">BLAKE2b</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-semibold mb-1">
          Hash Output ({algorithm})
        </p>
        <div className="flex items-center gap-1">
          <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto flex-1 break-all">
            <code>{currentHash}</code>
          </pre>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 text-teal-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Badge variant="secondary">
            {currentHash.length - 2} hex chars
          </Badge>
          <Badge variant="secondary">
            {(currentHash.length - 2) * 4} bits
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["sha256", "keccak256", "blake2b"] as const).map((algo) => (
          <div key={algo} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
              {algo}
            </p>
            <pre
              className="rounded-lg bg-muted p-3 overflow-x-auto break-all"
              style={{ fontSize: "0.65rem" }}
            >
              <code>{hashes[algo]}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4" data-testid="hex-distribution-chart">
        <p className="text-sm font-semibold mb-1">
          Hex Character Distribution
        </p>
        <SimpleBarChart
          data={hexDistribution}
          xKey="char"
          yKeys={["count"]}
          height={200}
        />
        <p className="text-xs text-muted-foreground mt-1">
          A good hash function distributes hex characters uniformly (each ~4 for
          64-char hash)
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-semibold mb-4">
          Avalanche Effect Comparison
        </p>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Original Input</Label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div>
            <Label>Modified Input</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Change one character to see the avalanche effect
            </p>
            <Input
              value={compareInput}
              onChange={(e) => setCompareInput(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <Badge
            className={
              avalanche.diffPercent > 40
                ? "bg-green-600 text-white"
                : "bg-orange-500 text-white"
            }
          >
            {avalanche.diffPercent.toFixed(1)}% bits changed
          </Badge>
          <p className="text-sm text-muted-foreground">
            Ideal: ~50% (good hash function)
          </p>
        </div>

        <div className="mt-4">
          <HashAvalancheVisualizer
            binary1={avalanche.binary1}
            binary2={avalanche.binary2}
            diffBits={avalanche.diffBits}
          />
        </div>
      </div>
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
              title: "Input Processing",
              description:
                "The hash function takes any input and converts it to bytes.",
              details: [
                "Text is encoded as UTF-8 bytes",
                "Any length input is accepted",
              ],
            },
            {
              title: "Compression Function",
              description:
                "The algorithm processes blocks of data through rounds of mathematical operations.",
              details: [
                "SHA-256 uses 64 rounds per block",
                "Keccak-256 uses a sponge construction",
                "BLAKE2b uses a tree-based structure",
              ],
            },
            {
              title: "Fixed-Size Output",
              description:
                "Regardless of input size, the output is always the same length (256 bits / 64 hex chars).",
            },
            {
              title: "Avalanche Effect",
              description:
                "Changing even 1 bit of input flips ~50% of output bits, making it impossible to predict changes.",
            },
          ]}
          whyItMatters="Hash functions are the backbone of blockchain security. They create unique digital fingerprints for blocks, transactions, and addresses. Without collision-resistant hashes, blockchains couldn't guarantee data integrity."
          tips={[
            "A good hash function produces uniformly distributed output — check the hex distribution chart",
            "Try changing just one character and observe how the entire hash changes (avalanche effect)",
            "SHA-256 is used in Bitcoin, Keccak-256 in Ethereum",
          ]}
        />
      }
    />
  );
}
