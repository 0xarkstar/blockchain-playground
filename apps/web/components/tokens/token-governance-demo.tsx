"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  TextInput,
  NumberInput,
  Button,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Alert,
  Select,
  Progress,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createGovernance,
  setVotingPower,
  delegate,
  getEffectiveVotingPower,
  getTotalVotingPower,
  createProposal,
  vote,
  finalizeProposal,
  type GovernanceState,
} from "../../lib/tokens/governance";
import { SimpleBarChart } from "../shared";

export function TokenGovernanceDemo() {
  const [state, setState] = useState<GovernanceState>(() => {
    let s = createGovernance(10, 100);
    s = setVotingPower(s, "alice", 100);
    s = setVotingPower(s, "bob", 60);
    s = setVotingPower(s, "charlie", 40);
    return s;
  });

  const [powerAddr, setPowerAddr] = useState("dave");
  const [powerAmount, setPowerAmount] = useState(50);
  const [delegateFrom, setDelegateFrom] = useState("charlie");
  const [delegateTo, setDelegateTo] = useState("alice");
  const [proposalTitle, setProposalTitle] = useState("Increase Treasury");
  const [proposalDesc, setProposalDesc] = useState("Allocate 10% of reserves");
  const [proposalCreator, setProposalCreator] = useState("alice");
  const [voteProposalId, setVoteProposalId] = useState(1);
  const [voter, setVoter] = useState("alice");
  const [voteChoice, setVoteChoice] = useState<"for" | "against" | "abstain">(
    "for",
  );
  const [currentTime, setCurrentTime] = useState(50);
  const [lastMessage, setLastMessage] = useState(
    "Governance initialized with alice(100), bob(60), charlie(40)",
  );

  const totalPower = useMemo(() => getTotalVotingPower(state), [state]);
  const members = useMemo(
    () => Object.keys(state.votingPower),
    [state.votingPower],
  );

  const handleSetPower = () => {
    setState(setVotingPower(state, powerAddr, powerAmount));
    setLastMessage(`Set ${powerAddr} voting power to ${powerAmount}`);
  };

  const handleDelegate = () => {
    const result = delegate(state, delegateFrom, delegateTo);
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleCreateProposal = () => {
    const result = createProposal(
      state,
      proposalTitle,
      proposalDesc,
      proposalCreator,
      currentTime,
    );
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleVote = () => {
    const result = vote(state, voteProposalId, voter, voteChoice, currentTime);
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleFinalize = () => {
    const result = finalizeProposal(state, voteProposalId, currentTime);
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Members
            </Text>
            <Badge variant="light">Total Power: {totalPower}</Badge>
          </Group>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Address</Table.Th>
                <Table.Th ta="right">Base Power</Table.Th>
                <Table.Th ta="right">Effective Power</Table.Th>
                <Table.Th>Delegated To</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {members.map((addr) => (
                <Table.Tr key={addr}>
                  <Table.Td>
                    <Code>{addr}</Code>
                  </Table.Td>
                  <Table.Td ta="right">{state.votingPower[addr]}</Table.Td>
                  <Table.Td ta="right">
                    <Badge
                      variant="light"
                      color={
                        getEffectiveVotingPower(state, addr) > 0
                          ? "blue"
                          : "gray"
                      }
                    >
                      {getEffectiveVotingPower(state, addr)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {state.delegations[addr] ? (
                      <Code>{state.delegations[addr]}</Code>
                    ) : (
                      "—"
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Group grow>
            <TextInput
              label="Address"
              value={powerAddr}
              onChange={(e) => setPowerAddr(e.currentTarget.value)}
            />
            <NumberInput
              label="Power"
              value={powerAmount}
              onChange={(v) => setPowerAmount(Number(v) || 0)}
              min={0}
            />
          </Group>
          <Button onClick={handleSetPower} variant="light" size="sm">
            Set Power
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Delegate
          </Text>
          <Group grow>
            <TextInput
              label="From"
              value={delegateFrom}
              onChange={(e) => setDelegateFrom(e.currentTarget.value)}
            />
            <TextInput
              label="To (self = undelegate)"
              value={delegateTo}
              onChange={(e) => setDelegateTo(e.currentTarget.value)}
            />
          </Group>
          <Button onClick={handleDelegate} variant="light" color="orange">
            Delegate
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Time & Proposals
          </Text>
          <NumberInput
            label="Current Time"
            value={currentTime}
            onChange={(v) => setCurrentTime(Number(v) || 0)}
          />
          <Group grow>
            <TextInput
              label="Title"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.currentTarget.value)}
            />
            <TextInput
              label="Proposer"
              value={proposalCreator}
              onChange={(e) => setProposalCreator(e.currentTarget.value)}
            />
          </Group>
          <TextInput
            label="Description"
            value={proposalDesc}
            onChange={(e) => setProposalDesc(e.currentTarget.value)}
          />
          <Button onClick={handleCreateProposal} variant="light" color="green">
            Create Proposal
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Vote
          </Text>
          <Group grow>
            <NumberInput
              label="Proposal ID"
              value={voteProposalId}
              onChange={(v) => setVoteProposalId(Number(v) || 0)}
              min={1}
            />
            <TextInput
              label="Voter"
              value={voter}
              onChange={(e) => setVoter(e.currentTarget.value)}
            />
            <Select
              label="Choice"
              value={voteChoice}
              onChange={(v) =>
                setVoteChoice((v as "for" | "against" | "abstain") ?? "for")
              }
              data={[
                { value: "for", label: "For" },
                { value: "against", label: "Against" },
                { value: "abstain", label: "Abstain" },
              ]}
            />
          </Group>
          <Group>
            <Button onClick={handleVote} variant="light" color="blue">
              Vote
            </Button>
            <Button onClick={handleFinalize} variant="light" color="violet">
              Finalize
            </Button>
          </Group>
        </Stack>
      </Paper>

      {lastMessage && (
        <Alert icon={<IconInfoCircle size={16} />} variant="light">
          {lastMessage}
        </Alert>
      )}

      {state.proposals.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Proposals
            </Text>
            {state.proposals.map((p) => {
              const totalVotes = p.votesFor + p.votesAgainst + p.votesAbstain;
              const forPct =
                totalVotes > 0 ? (p.votesFor / totalVotes) * 100 : 0;
              const againstPct =
                totalVotes > 0 ? (p.votesAgainst / totalVotes) * 100 : 0;
              const abstainPct =
                totalVotes > 0 ? (p.votesAbstain / totalVotes) * 100 : 0;
              const statusColor =
                p.status === "passed"
                  ? "green"
                  : p.status === "rejected"
                    ? "red"
                    : "blue";
              return (
                <Paper key={p.id} p="sm" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text fw={600}>
                        #{p.id}: {p.title}
                      </Text>
                      <Badge color={statusColor} variant="light">
                        {p.status}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      By {p.proposer} | Ends at {p.endTime} | Quorum:{" "}
                      {p.quorumRequired}
                    </Text>
                    <Progress.Root size="lg">
                      <Progress.Section value={forPct} color="green">
                        <Progress.Label>For {p.votesFor}</Progress.Label>
                      </Progress.Section>
                      <Progress.Section value={againstPct} color="red">
                        <Progress.Label>
                          Against {p.votesAgainst}
                        </Progress.Label>
                      </Progress.Section>
                      <Progress.Section value={abstainPct} color="gray">
                        <Progress.Label>
                          Abstain {p.votesAbstain}
                        </Progress.Label>
                      </Progress.Section>
                    </Progress.Root>
                    <Text size="xs" c="dimmed">
                      Total: {totalVotes} / {p.quorumRequired} quorum
                      {totalVotes >= p.quorumRequired ? " (met)" : " (not met)"}
                    </Text>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Paper>
      )}

      {state.proposals.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Voting Results
            </Text>
            <SimpleBarChart
              data={state.proposals.map((p) => ({
                proposal: `#${p.id}`,
                For: p.votesFor,
                Against: p.votesAgainst,
                Abstain: p.votesAbstain,
              }))}
              xKey="proposal"
              yKeys={["For", "Against", "Abstain"]}
              colors={["#40c057", "#fa5252", "#868e96"]}
              grouped
              height={250}
            />
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
