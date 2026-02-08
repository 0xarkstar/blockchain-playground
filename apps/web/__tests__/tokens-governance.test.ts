import { describe, it, expect } from "vitest";
import {
  createGovernance,
  setVotingPower,
  delegate,
  getEffectiveVotingPower,
  getTotalVotingPower,
  createProposal,
  vote,
  finalizeProposal,
} from "../lib/tokens/governance";

describe("createGovernance", () => {
  it("creates with defaults", () => {
    const state = createGovernance();
    expect(state.quorumPercent).toBe(10);
    expect(state.votingDuration).toBe(86400);
    expect(state.nextProposalId).toBe(1);
  });

  it("clamps quorum to valid range", () => {
    expect(createGovernance(0).quorumPercent).toBe(1);
    expect(createGovernance(200).quorumPercent).toBe(100);
  });
});

describe("setVotingPower", () => {
  it("sets power for account", () => {
    let state = createGovernance();
    state = setVotingPower(state, "alice", 100);
    expect(state.votingPower["alice"]).toBe(100);
  });

  it("clamps negative to zero", () => {
    let state = createGovernance();
    state = setVotingPower(state, "alice", -50);
    expect(state.votingPower["alice"]).toBe(0);
  });
});

describe("delegation", () => {
  it("delegates voting power", () => {
    let state = createGovernance();
    state = setVotingPower(state, "alice", 100);
    state = setVotingPower(state, "bob", 50);
    state = delegate(state, "alice", "bob").newState;

    expect(getEffectiveVotingPower(state, "alice")).toBe(0);
    expect(getEffectiveVotingPower(state, "bob")).toBe(150);
  });

  it("self-delegation removes delegation", () => {
    let state = createGovernance();
    state = setVotingPower(state, "alice", 100);
    state = delegate(state, "alice", "bob").newState;
    state = delegate(state, "alice", "alice").newState;

    expect(getEffectiveVotingPower(state, "alice")).toBe(100);
  });

  it("getTotalVotingPower sums all base power", () => {
    let state = createGovernance();
    state = setVotingPower(state, "alice", 100);
    state = setVotingPower(state, "bob", 50);
    expect(getTotalVotingPower(state)).toBe(150);
  });
});

describe("createProposal", () => {
  it("creates proposal with quorum", () => {
    let state = createGovernance(10, 100);
    state = setVotingPower(state, "alice", 100);
    const result = createProposal(
      state,
      "Test Proposal",
      "A description",
      "alice",
      1000,
    );
    expect(result.success).toBe(true);
    const proposal = result.newState.proposals[0]!;
    expect(proposal.title).toBe("Test Proposal");
    expect(proposal.status).toBe("active");
    expect(proposal.quorumRequired).toBe(10); // 10% of 100
    expect(proposal.endTime).toBe(1100); // 1000 + 100
  });

  it("rejects empty title", () => {
    const state = createGovernance();
    expect(createProposal(state, "", "desc", "alice", 1000).success).toBe(
      false,
    );
  });

  it("increments proposal ID", () => {
    let state = createGovernance(10, 100);
    state = setVotingPower(state, "alice", 100);
    state = createProposal(state, "P1", "d", "alice", 1000).newState;
    state = createProposal(state, "P2", "d", "alice", 1000).newState;
    expect(state.proposals).toHaveLength(2);
    expect(state.proposals[1]!.id).toBe(2);
  });
});

describe("vote", () => {
  function setupVoting() {
    let state = createGovernance(10, 100);
    state = setVotingPower(state, "alice", 60);
    state = setVotingPower(state, "bob", 40);
    state = createProposal(state, "Test", "desc", "alice", 1000).newState;
    return state;
  }

  it("records vote with power", () => {
    const state = setupVoting();
    const result = vote(state, 1, "alice", "for", 1050);
    expect(result.success).toBe(true);
    expect(result.newState.proposals[0]!.votesFor).toBe(60);
  });

  it("records against vote", () => {
    const state = setupVoting();
    const result = vote(state, 1, "bob", "against", 1050);
    expect(result.success).toBe(true);
    expect(result.newState.proposals[0]!.votesAgainst).toBe(40);
  });

  it("rejects double voting", () => {
    let state = setupVoting();
    state = vote(state, 1, "alice", "for", 1050).newState;
    expect(vote(state, 1, "alice", "against", 1060).success).toBe(false);
  });

  it("rejects vote after end time", () => {
    const state = setupVoting();
    expect(vote(state, 1, "alice", "for", 1200).success).toBe(false);
  });

  it("rejects vote with no power", () => {
    let state = setupVoting();
    state = setVotingPower(state, "charlie", 0);
    expect(vote(state, 1, "charlie", "for", 1050).success).toBe(false);
  });

  it("rejects vote on non-existent proposal", () => {
    const state = setupVoting();
    expect(vote(state, 99, "alice", "for", 1050).success).toBe(false);
  });

  it("uses delegated power for voting", () => {
    let state = setupVoting();
    state = delegate(state, "alice", "bob").newState;
    const result = vote(state, 1, "bob", "for", 1050);
    expect(result.success).toBe(true);
    expect(result.newState.proposals[0]!.votesFor).toBe(100); // 40 own + 60 delegated
  });
});

describe("finalizeProposal", () => {
  function setupForFinalize() {
    let state = createGovernance(10, 100);
    state = setVotingPower(state, "alice", 60);
    state = setVotingPower(state, "bob", 40);
    state = createProposal(state, "Test", "desc", "alice", 1000).newState;
    return state;
  }

  it("passes with quorum and majority", () => {
    let state = setupForFinalize();
    state = vote(state, 1, "alice", "for", 1050).newState;
    const result = finalizeProposal(state, 1, 1200);
    expect(result.success).toBe(true);
    expect(result.newState.proposals[0]!.status).toBe("passed");
  });

  it("rejects when quorum not met", () => {
    const state = setupForFinalize();
    // No votes cast, quorum is 10 (10% of 100)
    const result = finalizeProposal(state, 1, 1200);
    expect(result.success).toBe(true);
    expect(result.newState.proposals[0]!.status).toBe("rejected");
  });

  it("rejects when against > for", () => {
    // alice: 60 for, bob: 40 against → passes (for > against)
    // Need more against than for — let's adjust
    let state2 = createGovernance(10, 100);
    state2 = setVotingPower(state2, "alice", 40);
    state2 = setVotingPower(state2, "bob", 60);
    state2 = createProposal(state2, "Test", "desc", "alice", 1000).newState;
    state2 = vote(state2, 1, "alice", "for", 1050).newState;
    state2 = vote(state2, 1, "bob", "against", 1060).newState;
    const result = finalizeProposal(state2, 1, 1200);
    expect(result.newState.proposals[0]!.status).toBe("rejected");
  });

  it("rejects finalization before end time", () => {
    const state = setupForFinalize();
    expect(finalizeProposal(state, 1, 1050).success).toBe(false);
  });

  it("rejects finalizing non-active proposal", () => {
    let state = setupForFinalize();
    state = vote(state, 1, "alice", "for", 1050).newState;
    state = finalizeProposal(state, 1, 1200).newState;
    expect(finalizeProposal(state, 1, 1300).success).toBe(false);
  });
});
