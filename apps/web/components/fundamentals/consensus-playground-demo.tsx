"use client";

import { useState, useCallback } from "react";
import { Network, Play, RefreshCw } from "lucide-react";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface ConsensusNode {
  id: string;
  stake: number;
  blocks: number[];
  isLeader: boolean;
  status: "idle" | "proposing" | "validating" | "accepted" | "rejected";
}

interface ConsensusRound {
  round: number;
  leader: string;
  blockNumber: number;
  votes: Record<string, boolean>;
  accepted: boolean;
}

const NODE_POSITIONS = [
  { x: 150, y: 50 },
  { x: 50, y: 150 },
  { x: 250, y: 150 },
  { x: 150, y: 250 },
];

function NodeNetworkVisual({ nodes }: { nodes: ConsensusNode[] }) {
  const nodeRadius = 28;

  return (
    <div className="rounded-lg border border-border bg-card p-4" data-testid="node-network-visual">
      <p className="text-sm font-semibold mb-2">
        Network Topology
      </p>
      <div className="flex justify-center">
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* Connection lines between all nodes */}
          {nodes.map((_, i) =>
            nodes.map((_, j) => {
              if (j <= i) return null;
              return (
                <line
                  key={`line-${i}-${j}`}
                  x1={NODE_POSITIONS[i].x}
                  y1={NODE_POSITIONS[i].y}
                  x2={NODE_POSITIONS[j].x}
                  y2={NODE_POSITIONS[j].y}
                  stroke="hsl(var(--muted-foreground) / 0.2)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            }),
          )}

          {/* Node circles */}
          {nodes.map((node, i) => {
            const pos = NODE_POSITIONS[i];
            let fillColor = "hsl(var(--muted))";
            let strokeColor = "hsl(var(--muted-foreground) / 0.3)";

            if (node.isLeader) {
              fillColor = "hsl(47.9 95.8% 53.1% / 0.15)";
              strokeColor = "hsl(47.9 95.8% 53.1%)";
            } else if (node.status === "accepted") {
              fillColor = "hsl(142.1 76.2% 36.3% / 0.15)";
              strokeColor = "hsl(142.1 76.2% 36.3%)";
            } else if (node.status === "rejected") {
              fillColor = "hsl(var(--destructive) / 0.15)";
              strokeColor = "hsl(var(--destructive))";
            }

            return (
              <g key={node.id}>
                {node.isLeader && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 6}
                    fill="none"
                    stroke="hsl(47.9 95.8% 53.1% / 0.5)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                />
                <text
                  x={pos.x}
                  y={pos.y - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="hsl(var(--foreground))"
                >
                  {node.id}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 10}
                  textAnchor="middle"
                  fontSize="8"
                  fill="hsl(var(--muted-foreground))"
                >
                  {node.stake} ETH
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex items-center gap-1 justify-center mt-1">
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          Leader
        </Badge>
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Accepted
        </Badge>
        <Badge variant="secondary" className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          Rejected
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Idle
        </Badge>
      </div>
    </div>
  );
}

export function ConsensusPlaygroundDemo() {
  const [mechanism, setMechanism] = useState<"pow" | "pos">("pos");
  const [nodes, setNodes] = useState<ConsensusNode[]>([
    { id: "Node-A", stake: 32, blocks: [], isLeader: false, status: "idle" },
    { id: "Node-B", stake: 16, blocks: [], isLeader: false, status: "idle" },
    { id: "Node-C", stake: 64, blocks: [], isLeader: false, status: "idle" },
    { id: "Node-D", stake: 48, blocks: [], isLeader: false, status: "idle" },
  ]);
  const [rounds, setRounds] = useState<ConsensusRound[]>([]);
  const [running, setRunning] = useState(false);

  const selectLeader = useCallback(
    (currentNodes: ConsensusNode[]): string => {
      if (mechanism === "pos") {
        const totalStake = currentNodes.reduce((sum, n) => sum + n.stake, 0);
        let random = Math.random() * totalStake;
        for (const node of currentNodes) {
          random -= node.stake;
          if (random <= 0) return node.id;
        }
        return currentNodes[0].id;
      }
      return currentNodes[Math.floor(Math.random() * currentNodes.length)].id;
    },
    [mechanism],
  );

  const handleRunRound = useCallback(() => {
    setRunning(true);

    setTimeout(() => {
      const leaderId = selectLeader(nodes);
      const blockNumber = rounds.length + 1;

      const votes: Record<string, boolean> = {};
      nodes.forEach((node) => {
        votes[node.id] = Math.random() > 0.15;
      });
      votes[leaderId] = true;

      const acceptCount = Object.values(votes).filter(Boolean).length;
      const accepted = acceptCount >= Math.ceil((nodes.length * 2) / 3);

      const newRound: ConsensusRound = {
        round: rounds.length + 1,
        leader: leaderId,
        blockNumber,
        votes,
        accepted,
      };

      setRounds((prev) => [...prev, newRound]);

      if (accepted) {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            blocks:
              node.id === leaderId
                ? [...node.blocks, blockNumber]
                : node.blocks,
            isLeader: node.id === leaderId,
            status: votes[node.id] ? "accepted" : "rejected",
          })),
        );
      } else {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            isLeader: node.id === leaderId,
            status: "rejected",
          })),
        );
      }

      setRunning(false);
    }, 500);
  }, [nodes, rounds, selectLeader]);

  const handleReset = useCallback(() => {
    setNodes((prev) =>
      prev.map((n) => ({ ...n, blocks: [], isLeader: false, status: "idle" })),
    );
    setRounds([]);
  }, []);

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Consensus Mechanism
          </p>
          <Tabs
            value={mechanism}
            onValueChange={(v) => {
              setMechanism(v as "pow" | "pos");
              handleReset();
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="pos" className="flex-1">Proof of Stake (PoS)</TabsTrigger>
              <TabsTrigger value="pow" className="flex-1">Proof of Work (PoW)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {nodes.map((node) => (
          <div key={node.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  {node.id}
                </p>
                {node.isLeader && (
                  <Badge className="text-xs bg-yellow-600 text-white">
                    Leader
                  </Badge>
                )}
              </div>
              {mechanism === "pos" && (
                <p className="text-xs text-muted-foreground">
                  Stake: {node.stake} ETH
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Blocks produced: {node.blocks.length}
              </p>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  node.status === "accepted"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : node.status === "rejected"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : ""
                }`}
              >
                {node.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleRunRound}
          disabled={running}
        >
          <Play className="h-4 w-4 mr-2" />
          {running ? "Running..." : "Run Consensus Round"}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      <NodeNetworkVisual nodes={nodes} />

      {rounds.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold mb-4">
            Consensus History
          </p>
          <div className="relative pl-6 border-l-2 border-border">
            {rounds.map((round) => (
              <div key={round.round} className="mb-4 relative">
                <div
                  className={`absolute -left-[25px] h-6 w-6 rounded-full flex items-center justify-center ${
                    round.accepted
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-red-100 dark:bg-red-900"
                  }`}
                >
                  <Network className="h-3 w-3" />
                </div>
                <p className="text-sm font-semibold">Round {round.round}</p>
                <p className="text-xs text-muted-foreground">
                  Leader: {round.leader} | Block #{round.blockNumber} |{" "}
                  {Object.values(round.votes).filter(Boolean).length}/
                  {nodes.length} votes |{" "}
                  {round.accepted ? "Accepted" : "Rejected"}
                </p>
              </div>
            ))}
          </div>
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
              title: "Leader Selection",
              description:
                "In PoS, a validator is selected proportionally to their stake. In PoW, the first miner to solve the puzzle wins.",
            },
            {
              title: "Block Proposal",
              description:
                "The selected leader proposes a new block containing pending transactions.",
            },
            {
              title: "Voting",
              description:
                "Other validators vote on whether to accept the block. A 2/3 supermajority is needed for acceptance.",
            },
            {
              title: "Finalization",
              description:
                "If accepted, the block is added to the chain. The leader earns rewards. If rejected, a new round begins.",
            },
          ]}
          whyItMatters="Consensus mechanisms allow decentralized networks to agree on a single truth without a central authority. PoS is more energy-efficient than PoW, which is why Ethereum switched to PoS in 'The Merge' (Sept 2022)."
          tips={[
            "Node-C has 64 ETH stake — notice it gets selected as leader more often in PoS",
            "Run many rounds to see the statistical distribution of leader selection",
            "A block is rejected if fewer than 2/3 of validators vote to accept",
          ]}
        />
      }
    />
  );
}
