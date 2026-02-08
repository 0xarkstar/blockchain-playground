"use client";

import { Stack, TextInput, Button, Text, Group, Paper, SegmentedControl } from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";

type VoteChoice = "yes" | "no";

interface VotingBoothProps {
  readonly voteChoice: VoteChoice;
  readonly phase: string;
  readonly progressMessage: string;
  readonly onVoteChoiceChange: (choice: VoteChoice) => void;
  readonly onVoteAndProve: () => void;
}

export function VotingBooth({
  voteChoice,
  phase,
  progressMessage,
  onVoteChoiceChange,
  onVoteAndProve,
}: VotingBoothProps) {
  if (phase === "setup" || phase === "registering") {
    return null;
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Text fw={600} size="sm">
          Step 2: Cast Your Vote
        </Text>
        <Text size="xs" c="dimmed">
          Your vote is private: the ZK proof shows you are a registered voter
          and your vote is valid, without revealing which voter you are.
        </Text>
        <TextInput
          label="Proposal"
          value="Should the DAO fund the ZK education initiative?"
          readOnly
        />
        <Text size="sm" fw={500}>
          Your Vote:
        </Text>
        <SegmentedControl
          value={voteChoice}
          onChange={(val) => onVoteChoiceChange(val as VoteChoice)}
          data={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
          disabled={phase !== "registered"}
        />
        {progressMessage && (
          <Group gap="xs">
            <IconLoader2 size={14} className="animate-spin" />
            <Text size="xs" c="blue">
              {progressMessage}
            </Text>
          </Group>
        )}
        <Button
          onClick={onVoteAndProve}
          loading={phase === "proving"}
          disabled={phase !== "registered"}
        >
          Vote & Generate ZK Proof
        </Button>
      </Stack>
    </Paper>
  );
}
