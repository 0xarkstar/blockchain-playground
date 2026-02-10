"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Members</p>
            <Badge variant="secondary">Total Power: {totalPower}</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Base Power</TableHead>
                <TableHead className="text-right">Effective Power</TableHead>
                <TableHead>Delegated To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((addr) => (
                <TableRow key={addr}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{addr}</code>
                  </TableCell>
                  <TableCell className="text-right">{state.votingPower[addr]}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className={
                        getEffectiveVotingPower(state, addr) > 0
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                      }
                    >
                      {getEffectiveVotingPower(state, addr)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {state.delegations[addr] ? (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{state.delegations[addr]}</code>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tok-gov-address">Address</Label>
              <Input
                id="tok-gov-address"
                value={powerAddr}
                onChange={(e) => setPowerAddr(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-gov-power">Power</Label>
              <Input
                id="tok-gov-power"
                type="number"
                value={powerAmount}
                onChange={(e) => setPowerAmount(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleSetPower}>
            Set Power
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Delegate</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tok-gov-delFrom">From</Label>
              <Input
                id="tok-gov-delFrom"
                value={delegateFrom}
                onChange={(e) => setDelegateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-gov-delTo">To (self = undelegate)</Label>
              <Input
                id="tok-gov-delTo"
                value={delegateTo}
                onChange={(e) => setDelegateTo(e.target.value)}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800" onClick={handleDelegate}>
            Delegate
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Time & Proposals</p>
          <div>
            <Label htmlFor="tok-gov-time">Current Time</Label>
            <Input
              id="tok-gov-time"
              type="number"
              value={currentTime}
              onChange={(e) => setCurrentTime(Number(e.target.value) || 0)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tok-gov-propTitle">Title</Label>
              <Input
                id="tok-gov-propTitle"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-gov-proposer">Proposer</Label>
              <Input
                id="tok-gov-proposer"
                value={proposalCreator}
                onChange={(e) => setProposalCreator(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tok-gov-propDesc">Description</Label>
            <Input
              id="tok-gov-propDesc"
              value={proposalDesc}
              onChange={(e) => setProposalDesc(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800" onClick={handleCreateProposal}>
            Create Proposal
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Vote</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tok-gov-voteProposalId">Proposal ID</Label>
              <Input
                id="tok-gov-voteProposalId"
                type="number"
                value={voteProposalId}
                onChange={(e) => setVoteProposalId(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="tok-gov-voter">Voter</Label>
              <Input
                id="tok-gov-voter"
                value={voter}
                onChange={(e) => setVoter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-gov-choice">Choice</Label>
              <Select
                value={voteChoice}
                onValueChange={(v) =>
                  setVoteChoice(v as "for" | "against" | "abstain")
                }
              >
                <SelectTrigger id="tok-gov-choice">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="for">For</SelectItem>
                  <SelectItem value="against">Against</SelectItem>
                  <SelectItem value="abstain">Abstain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800" onClick={handleVote}>
              Vote
            </Button>
            <Button variant="secondary" className="bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900 dark:text-violet-300 dark:hover:bg-violet-800" onClick={handleFinalize}>
              Finalize
            </Button>
          </div>
        </div>
      </div>

      {lastMessage && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{lastMessage}</AlertDescription>
        </Alert>
      )}

      {state.proposals.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Proposals</p>
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
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : p.status === "rejected"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
              return (
                <div key={p.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        #{p.id}: {p.title}
                      </p>
                      <Badge variant="secondary" className={statusColor}>
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      By {p.proposer} | Ends at {p.endTime} | Quorum:{" "}
                      {p.quorumRequired}
                    </p>
                    <div className="flex h-6 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${forPct}%` }}
                      >
                        {forPct > 15 ? `For ${p.votesFor}` : ""}
                      </div>
                      <div
                        className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${againstPct}%` }}
                      >
                        {againstPct > 15 ? `Against ${p.votesAgainst}` : ""}
                      </div>
                      <div
                        className="bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${abstainPct}%` }}
                      >
                        {abstainPct > 15 ? `Abstain ${p.votesAbstain}` : ""}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total: {totalVotes} / {p.quorumRequired} quorum
                      {totalVotes >= p.quorumRequired ? " (met)" : " (not met)"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {state.proposals.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Voting Results</p>
            <SimpleBarChart
              data={state.proposals.map((p) => ({
                proposal: `#${p.id}`,
                For: p.votesFor,
                Against: p.votesAgainst,
                Abstain: p.votesAbstain,
              }))}
              xKey="proposal"
              yKeys={["For", "Against", "Abstain"]}
              grouped
              height={250}
            />
          </div>
        </div>
      )}
    </div>
  );
}
