"use client";

import { useState, useCallback } from "react";
import {
  Stack,
  Button,
  Text,
  Paper,
  Group,
  Badge,
  SimpleGrid,
  SegmentedControl,
  Alert,
  Timeline,
  Box,
} from "@mantine/core";
import { IconNetwork, IconPlayerPlay, IconRefresh } from "@tabler/icons-react";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";

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
    <Paper p="md" withBorder data-testid="node-network-visual">
      <Text size="sm" fw={600} mb="sm">
        Network Topology
      </Text>
      <Box style={{ display: "flex", justifyContent: "center" }}>
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
                  stroke="var(--mantine-color-gray-3)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            }),
          )}

          {/* Node circles */}
          {nodes.map((node, i) => {
            const pos = NODE_POSITIONS[i];
            let fillColor = "var(--mantine-color-gray-1)";
            let strokeColor = "var(--mantine-color-gray-4)";

            if (node.isLeader) {
              fillColor = "var(--mantine-color-yellow-1)";
              strokeColor = "var(--mantine-color-yellow-6)";
            } else if (node.status === "accepted") {
              fillColor = "var(--mantine-color-green-1)";
              strokeColor = "var(--mantine-color-green-5)";
            } else if (node.status === "rejected") {
              fillColor = "var(--mantine-color-red-1)";
              strokeColor = "var(--mantine-color-red-5)";
            }

            return (
              <g key={node.id}>
                {node.isLeader && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 6}
                    fill="none"
                    stroke="var(--mantine-color-yellow-4)"
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
                  fill="var(--mantine-color-dark-6)"
                >
                  {node.id}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 10}
                  textAnchor="middle"
                  fontSize="8"
                  fill="var(--mantine-color-dimmed)"
                >
                  {node.stake} ETH
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
      <Group gap="xs" justify="center" mt="xs">
        <Badge size="xs" color="yellow" variant="light">
          Leader
        </Badge>
        <Badge size="xs" color="green" variant="light">
          Accepted
        </Badge>
        <Badge size="xs" color="red" variant="light">
          Rejected
        </Badge>
        <Badge size="xs" color="gray" variant="light">
          Idle
        </Badge>
      </Group>
    </Paper>
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
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Consensus Mechanism
          </Text>
          <SegmentedControl
            value={mechanism}
            onChange={(v) => {
              setMechanism(v as "pow" | "pos");
              handleReset();
            }}
            data={[
              { label: "Proof of Stake (PoS)", value: "pos" },
              { label: "Proof of Work (PoW)", value: "pow" },
            ]}
          />
        </Stack>
      </Paper>

      <SimpleGrid cols={{ base: 2 }} spacing="md">
        {nodes.map((node) => (
          <Paper key={node.id} p="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  {node.id}
                </Text>
                {node.isLeader && (
                  <Badge color="yellow" size="xs">
                    Leader
                  </Badge>
                )}
              </Group>
              {mechanism === "pos" && (
                <Text size="xs" c="dimmed">
                  Stake: {node.stake} ETH
                </Text>
              )}
              <Text size="xs" c="dimmed">
                Blocks produced: {node.blocks.length}
              </Text>
              <Badge
                variant="light"
                color={
                  node.status === "accepted"
                    ? "green"
                    : node.status === "rejected"
                      ? "red"
                      : "gray"
                }
                size="sm"
              >
                {node.status}
              </Badge>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>

      <Group>
        <Button
          leftSection={<IconPlayerPlay size={16} />}
          onClick={handleRunRound}
          loading={running}
        >
          Run Consensus Round
        </Button>
        <Button
          leftSection={<IconRefresh size={16} />}
          variant="outline"
          onClick={handleReset}
        >
          Reset
        </Button>
      </Group>
    </Stack>
  );

  const resultPanel = (
    <Stack gap="md">
      <NodeNetworkVisual nodes={nodes} />

      {rounds.length > 0 && (
        <Paper p="md" withBorder>
          <Text size="sm" fw={600} mb="md">
            Consensus History
          </Text>
          <Timeline active={rounds.length - 1} bulletSize={24}>
            {rounds.map((round) => (
              <Timeline.Item
                key={round.round}
                bullet={<IconNetwork size={12} />}
                title={`Round ${round.round}`}
                color={round.accepted ? "green" : "red"}
              >
                <Text size="xs" c="dimmed">
                  Leader: {round.leader} | Block #{round.blockNumber} |{" "}
                  {Object.values(round.votes).filter(Boolean).length}/
                  {nodes.length} votes |{" "}
                  {round.accepted ? "Accepted" : "Rejected"}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
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
