import { describe, it, expect } from "vitest";
import {
  createERC20,
  mint,
  burn,
  transfer,
  approve,
  transferFrom,
  balanceOf,
  allowance,
  formatTokenAmount,
} from "../lib/tokens/erc20";

describe("createERC20", () => {
  it("creates token with correct initial state", () => {
    const state = createERC20("Test Token", "TEST", 18);
    expect(state.name).toBe("Test Token");
    expect(state.symbol).toBe("TEST");
    expect(state.decimals).toBe(18);
    expect(state.totalSupply).toBe(BigInt(0));
  });
});

describe("mint", () => {
  it("mints tokens to an address", () => {
    const state = createERC20("T", "T");
    const result = mint(state, "alice", BigInt(1000));
    expect(result.success).toBe(true);
    expect(balanceOf(result.newState, "alice")).toBe(BigInt(1000));
    expect(result.newState.totalSupply).toBe(BigInt(1000));
  });

  it("rejects zero amount", () => {
    const state = createERC20("T", "T");
    expect(mint(state, "alice", BigInt(0)).success).toBe(false);
  });

  it("rejects negative amount", () => {
    const state = createERC20("T", "T");
    expect(mint(state, "alice", BigInt(-1)).success).toBe(false);
  });
});

describe("burn", () => {
  it("burns tokens from an address", () => {
    let state = createERC20("T", "T");
    state = mint(state, "alice", BigInt(1000)).newState;
    const result = burn(state, "alice", BigInt(400));
    expect(result.success).toBe(true);
    expect(balanceOf(result.newState, "alice")).toBe(BigInt(600));
    expect(result.newState.totalSupply).toBe(BigInt(600));
  });

  it("rejects burning more than balance", () => {
    let state = createERC20("T", "T");
    state = mint(state, "alice", BigInt(100)).newState;
    expect(burn(state, "alice", BigInt(200)).success).toBe(false);
  });
});

describe("transfer", () => {
  it("transfers tokens between addresses", () => {
    let state = createERC20("T", "T");
    state = mint(state, "alice", BigInt(1000)).newState;
    const result = transfer(state, "alice", "bob", BigInt(300));
    expect(result.success).toBe(true);
    expect(balanceOf(result.newState, "alice")).toBe(BigInt(700));
    expect(balanceOf(result.newState, "bob")).toBe(BigInt(300));
  });

  it("rejects insufficient balance", () => {
    let state = createERC20("T", "T");
    state = mint(state, "alice", BigInt(100)).newState;
    expect(transfer(state, "alice", "bob", BigInt(200)).success).toBe(false);
  });

  it("rejects self-transfer", () => {
    let state = createERC20("T", "T");
    state = mint(state, "alice", BigInt(100)).newState;
    expect(transfer(state, "alice", "alice", BigInt(50)).success).toBe(false);
  });
});

describe("approve and transferFrom", () => {
  it("approves and transfers via spender", () => {
    let state = createERC20("T", "T");
    state = mint(state, "alice", BigInt(1000)).newState;
    state = approve(state, "alice", "spender", BigInt(500)).newState;
    expect(allowance(state, "alice", "spender")).toBe(BigInt(500));

    const result = transferFrom(state, "spender", "alice", "bob", BigInt(300));
    expect(result.success).toBe(true);
    expect(balanceOf(result.newState, "bob")).toBe(BigInt(300));
    expect(allowance(result.newState, "alice", "spender")).toBe(BigInt(200));
  });

  it("rejects exceeding allowance", () => {
    let state = createERC20("T", "T");
    state = mint(state, "alice", BigInt(1000)).newState;
    state = approve(state, "alice", "spender", BigInt(100)).newState;
    expect(
      transferFrom(state, "spender", "alice", "bob", BigInt(200)).success,
    ).toBe(false);
  });

  it("rejects negative approval", () => {
    const state = createERC20("T", "T");
    expect(approve(state, "alice", "spender", BigInt(-1)).success).toBe(false);
  });
});

describe("formatTokenAmount", () => {
  it("formats with 18 decimals", () => {
    expect(formatTokenAmount(BigInt("1000000000000000000"), 18)).toBe("1");
  });

  it("formats fractional amounts", () => {
    expect(formatTokenAmount(BigInt("1500000000000000000"), 18)).toBe("1.5");
  });

  it("formats zero decimals", () => {
    expect(formatTokenAmount(BigInt(42), 0)).toBe("42");
  });

  it("formats small amounts", () => {
    expect(formatTokenAmount(BigInt("100000000000000"), 18)).toBe("0.0001");
  });
});
