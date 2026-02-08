export type ProposalStatus =
  | "pending"
  | "active"
  | "passed"
  | "rejected"
  | "executed";

export interface Proposal {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly proposer: string;
  readonly votesFor: number;
  readonly votesAgainst: number;
  readonly votesAbstain: number;
  readonly voters: Readonly<Record<string, "for" | "against" | "abstain">>;
  readonly status: ProposalStatus;
  readonly startTime: number;
  readonly endTime: number;
  readonly quorumRequired: number;
}

export interface GovernanceState {
  readonly proposals: readonly Proposal[];
  readonly nextProposalId: number;
  readonly votingPower: Readonly<Record<string, number>>;
  readonly delegations: Readonly<Record<string, string>>;
  readonly quorumPercent: number;
  readonly votingDuration: number;
}

export interface GovernanceResult {
  readonly success: boolean;
  readonly newState: GovernanceState;
  readonly message: string;
}

export function createGovernance(
  quorumPercent: number = 10,
  votingDuration: number = 86400,
): GovernanceState {
  return {
    proposals: [],
    nextProposalId: 1,
    votingPower: {},
    delegations: {},
    quorumPercent: Math.max(1, Math.min(100, quorumPercent)),
    votingDuration: Math.max(1, votingDuration),
  };
}

export function setVotingPower(
  state: GovernanceState,
  account: string,
  power: number,
): GovernanceState {
  return {
    ...state,
    votingPower: { ...state.votingPower, [account]: Math.max(0, power) },
  };
}

export function delegate(
  state: GovernanceState,
  from: string,
  to: string,
): GovernanceResult {
  if (from === to) {
    // Self-delegation removes delegation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [from]: _, ...restDelegations } = state.delegations;
    return {
      success: true,
      newState: { ...state, delegations: restDelegations },
      message: `${from} removed delegation`,
    };
  }
  return {
    success: true,
    newState: {
      ...state,
      delegations: { ...state.delegations, [from]: to },
    },
    message: `${from} delegated to ${to}`,
  };
}

export function getEffectiveVotingPower(
  state: GovernanceState,
  account: string,
): number {
  let power = state.votingPower[account] ?? 0;

  // If this account has delegated away, they lose their own power
  if (state.delegations[account]) {
    power = 0;
  }

  // Add delegated power from others
  for (const [delegator, delegatee] of Object.entries(state.delegations)) {
    if (delegatee === account) {
      power += state.votingPower[delegator] ?? 0;
    }
  }

  return power;
}

export function getTotalVotingPower(state: GovernanceState): number {
  return Object.values(state.votingPower).reduce((sum, v) => sum + v, 0);
}

export function createProposal(
  state: GovernanceState,
  title: string,
  description: string,
  proposer: string,
  currentTime: number,
): GovernanceResult {
  if (!title.trim()) {
    return { success: false, newState: state, message: "Title required" };
  }
  const totalPower = getTotalVotingPower(state);
  const quorumRequired = totalPower * (state.quorumPercent / 100);

  const proposal: Proposal = {
    id: state.nextProposalId,
    title: title.trim(),
    description: description.trim(),
    proposer,
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0,
    voters: {},
    status: "active",
    startTime: currentTime,
    endTime: currentTime + state.votingDuration,
    quorumRequired,
  };

  return {
    success: true,
    newState: {
      ...state,
      proposals: [...state.proposals, proposal],
      nextProposalId: state.nextProposalId + 1,
    },
    message: `Proposal #${proposal.id}: "${title}" created`,
  };
}

export function vote(
  state: GovernanceState,
  proposalId: number,
  voter: string,
  choice: "for" | "against" | "abstain",
  currentTime: number,
): GovernanceResult {
  const proposal = state.proposals.find((p) => p.id === proposalId);
  if (!proposal) {
    return { success: false, newState: state, message: "Proposal not found" };
  }
  if (proposal.status !== "active") {
    return { success: false, newState: state, message: "Proposal not active" };
  }
  if (currentTime > proposal.endTime) {
    return { success: false, newState: state, message: "Voting period ended" };
  }
  if (proposal.voters[voter]) {
    return { success: false, newState: state, message: "Already voted" };
  }

  const power = getEffectiveVotingPower(state, voter);
  if (power <= 0) {
    return { success: false, newState: state, message: "No voting power" };
  }

  const updatedProposal: Proposal = {
    ...proposal,
    votesFor: proposal.votesFor + (choice === "for" ? power : 0),
    votesAgainst: proposal.votesAgainst + (choice === "against" ? power : 0),
    votesAbstain: proposal.votesAbstain + (choice === "abstain" ? power : 0),
    voters: { ...proposal.voters, [voter]: choice },
  };

  return {
    success: true,
    newState: {
      ...state,
      proposals: state.proposals.map((p) =>
        p.id === proposalId ? updatedProposal : p,
      ),
    },
    message: `${voter} voted "${choice}" with ${power} power`,
  };
}

export function finalizeProposal(
  state: GovernanceState,
  proposalId: number,
  currentTime: number,
): GovernanceResult {
  const proposal = state.proposals.find((p) => p.id === proposalId);
  if (!proposal) {
    return { success: false, newState: state, message: "Proposal not found" };
  }
  if (proposal.status !== "active") {
    return { success: false, newState: state, message: "Proposal not active" };
  }
  if (currentTime < proposal.endTime) {
    return {
      success: false,
      newState: state,
      message: "Voting period not ended",
    };
  }

  const totalVotes =
    proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const quorumMet = totalVotes >= proposal.quorumRequired;
  const passed = quorumMet && proposal.votesFor > proposal.votesAgainst;

  const updatedProposal: Proposal = {
    ...proposal,
    status: passed ? "passed" : "rejected",
  };

  return {
    success: true,
    newState: {
      ...state,
      proposals: state.proposals.map((p) =>
        p.id === proposalId ? updatedProposal : p,
      ),
    },
    message: passed
      ? `Proposal #${proposalId} passed (${proposal.votesFor} for, ${proposal.votesAgainst} against, quorum: ${totalVotes}/${proposal.quorumRequired})`
      : `Proposal #${proposalId} rejected ${!quorumMet ? "(quorum not met)" : `(${proposal.votesFor} for, ${proposal.votesAgainst} against)`}`,
  };
}
