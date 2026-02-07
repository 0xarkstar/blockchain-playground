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
} from "@mantine/core";
import { IconNetwork, IconPlayerPlay, IconRefresh } from "@tabler/icons-react";

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

  return (
    <Stack gap="lg">
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

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
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
}
