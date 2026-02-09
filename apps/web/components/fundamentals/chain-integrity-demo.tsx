"use client";

import { useState, useCallback, useMemo } from "react";
import { Link2, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  createGenesisBlock,
  createBlock,
  createTransaction,
  mineBlock,
  computeBlockHash,
  type Block,
} from "../../lib/blockchain/block";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

function ChainLinkArrow({ broken }: { broken: boolean }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minWidth: 36 }}
    >
      <svg width="36" height="24" viewBox="0 0 36 24">
        {broken ? (
          <>
            <line
              x1="0"
              y1="12"
              x2="10"
              y2="12"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
            />
            <line
              x1="26"
              y1="12"
              x2="36"
              y2="12"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
            />
            <text
              x="18"
              y="16"
              textAnchor="middle"
              fill="hsl(var(--destructive))"
              fontSize="14"
              fontWeight="bold"
            >
              ✕
            </text>
          </>
        ) : (
          <>
            <line
              x1="0"
              y1="12"
              x2="26"
              y2="12"
              stroke="hsl(142.1 76.2% 36.3%)"
              strokeWidth="2"
            />
            <polygon
              points="26,6 36,12 26,18"
              fill="hsl(142.1 76.2% 36.3%)"
            />
          </>
        )}
      </svg>
    </div>
  );
}

function ChainVisualDiagram({
  chain,
  validation,
}: {
  chain: Block[];
  validation: { hashValid: boolean; linkValid: boolean; valid: boolean }[];
}) {
  if (chain.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4" data-testid="chain-visual-diagram">
      <p className="text-sm font-semibold mb-2">
        Chain Structure
      </p>
      <div className="flex gap-0 flex-nowrap overflow-x-auto">
        {chain.map((block, i) => {
          const v = validation[i];
          const showBrokenLink = i > 0 && !v?.linkValid;

          return (
            <div key={i} className="flex gap-0 flex-nowrap">
              {i > 0 && <ChainLinkArrow broken={showBrokenLink} />}
              <div
                className="rounded-lg border bg-card px-2 py-1"
                style={{
                  minWidth: 100,
                  borderColor: v?.valid
                    ? "hsl(142.1 76.2% 36.3%)"
                    : "hsl(var(--destructive))",
                  borderWidth: v?.valid ? 1 : 2,
                  backgroundColor: v?.valid
                    ? undefined
                    : "hsl(var(--destructive) / 0.1)",
                }}
              >
                <Badge
                  className={`w-full justify-center text-xs mb-0.5 ${v?.valid ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
                >
                  #{block.index}
                </Badge>
                <code className="text-xs font-mono block">
                  {block.hash.slice(0, 10)}...
                </code>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChainIntegrityDemo() {
  const [chain, setChain] = useState<Block[]>([]);
  const [building, setBuilding] = useState(false);
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null);

  const handleBuildChain = useCallback(() => {
    setBuilding(true);
    setTamperedIndex(null);

    setTimeout(() => {
      const blocks: Block[] = [];
      const genesis = createGenesisBlock();
      const minedGenesis = mineBlock(genesis);
      blocks.push(minedGenesis.block);

      for (let i = 1; i <= 4; i++) {
        const txs = [createTransaction(`0xUser${i}`, `0xUser${i + 1}`, i * 10)];
        const newBlock = createBlock(blocks[blocks.length - 1], txs, 1);
        const mined = mineBlock(newBlock);
        blocks.push(mined.block);
      }

      setChain(blocks);
      setBuilding(false);
    }, 10);
  }, []);

  const handleTamper = useCallback(
    (index: number) => {
      if (index === 0 || chain.length === 0) return;

      const newChain = chain.map((b) => ({
        ...b,
        header: { ...b.header },
        transactions: [...b.transactions],
      }));

      const tampered = newChain[index];
      if (tampered.transactions.length > 0) {
        tampered.transactions = [
          {
            ...tampered.transactions[0],
            amount: 999999,
          },
        ];
      }
      tampered.hash = computeBlockHash(tampered.header);

      setChain(newChain);
      setTamperedIndex(index);
    },
    [chain],
  );

  const validation = useMemo(() => {
    if (chain.length === 0) return [];
    return chain.map((block, i) => {
      const recomputedHash = computeBlockHash(block.header);
      const hashValid = block.hash === recomputedHash;
      const linkValid =
        i === 0 || block.header.previousHash === chain[i - 1].hash;
      return { hashValid, linkValid, valid: hashValid && linkValid };
    });
  }, [chain]);

  const chainValid = validation.every((v) => v.valid);

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleBuildChain}
          disabled={building}
        >
          <Link2 className="h-4 w-4 mr-2" />
          {building ? "Building..." : "Build 5-Block Chain"}
        </Button>
      </div>

      {chain.length > 0 && (
        <>
          <Alert className={chainValid ? "border-green-500" : "border-red-500"}>
            {chainValid ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle>{chainValid ? "Chain Valid" : "Chain Broken!"}</AlertTitle>
            <AlertDescription>
              {chainValid
                ? "All blocks are valid and properly linked."
                : `Chain integrity broken${tamperedIndex !== null ? ` — Block #${tamperedIndex} was tampered. Subsequent blocks have invalid previous hash links.` : "."}`}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chain.map((block, i) => {
              const v = validation[i];
              return (
                <div
                  key={i}
                  className="rounded-lg border bg-card p-4"
                  style={{
                    borderColor: v?.valid
                      ? undefined
                      : "hsl(var(--destructive))",
                    borderWidth: v?.valid ? 1 : 2,
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={v?.valid ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}>
                        Block #{block.index}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {!v?.hashValid && (
                          <Badge className="bg-red-600 text-white text-xs">
                            Hash Invalid
                          </Badge>
                        )}
                        {!v?.linkValid && (
                          <Badge className="bg-red-600 text-white text-xs">
                            Link Broken
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Hash
                      </p>
                      <code
                        className="rounded bg-muted px-1.5 py-0.5 font-mono break-all"
                        style={{ fontSize: "0.6rem" }}
                      >
                        {block.hash.slice(0, 20)}...
                      </code>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Prev Hash
                      </p>
                      <code
                        className="rounded bg-muted px-1.5 py-0.5 font-mono break-all"
                        style={{ fontSize: "0.6rem" }}
                      >
                        {block.header.previousHash.slice(0, 20)}...
                      </code>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        TXs: {block.transactions.length}
                        {block.transactions[0]
                          ? ` (${block.transactions[0].amount} ETH)`
                          : ""}
                      </p>
                    </div>

                    {i > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleTamper(i)}
                      >
                        Tamper Block
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      <ChainVisualDiagram chain={chain} validation={validation} />
      {chain.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground text-center py-8">
            Build a chain to see the visual integrity diagram
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
              title: "Build Chain",
              description:
                "Each block stores the hash of the previous block in its header, forming a linked chain.",
            },
            {
              title: "Tamper Detection",
              description:
                "If block data is modified, its hash changes but the next block still references the old hash.",
            },
            {
              title: "Cascade Effect",
              description:
                "A single tampered block breaks the chain link for all subsequent blocks.",
            },
            {
              title: "Immutability Guarantee",
              description:
                "To alter history, an attacker must redo the proof-of-work for every block after the tampered one.",
            },
          ]}
          whyItMatters="Chain integrity is what makes blockchains immutable. The cryptographic linking of blocks means any modification to past data is immediately detectable, providing a tamper-evident audit trail."
          tips={[
            "Try tampering with Block #1 and notice how blocks #2-#4 all show broken links",
            "The chain break visual shows exactly where integrity is compromised",
            "In a real blockchain, re-mining all subsequent blocks is computationally infeasible",
          ]}
        />
      }
    />
  );
}
