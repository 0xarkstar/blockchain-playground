import { describe, it, expect } from "vitest";
import {
  createERC1155,
  mintERC1155,
  transferERC1155,
  batchTransferERC1155,
  balanceOfERC1155,
  balanceOfBatchERC1155,
} from "../lib/tokens/erc1155";

describe("mintERC1155", () => {
  it("mints fungible tokens", () => {
    const state = createERC1155();
    const result = mintERC1155(state, "alice", 1, BigInt(100), "fungible");
    expect(result.success).toBe(true);
    expect(balanceOfERC1155(result.newState, "alice", 1)).toBe(BigInt(100));
    expect(result.newState.totalSupply[1]).toBe(BigInt(100));
  });

  it("mints non-fungible token (amount=1)", () => {
    const state = createERC1155();
    const result = mintERC1155(state, "alice", 10, BigInt(1), "non-fungible");
    expect(result.success).toBe(true);
    expect(balanceOfERC1155(result.newState, "alice", 10)).toBe(BigInt(1));
  });

  it("rejects non-fungible with amount > 1", () => {
    const state = createERC1155();
    expect(
      mintERC1155(state, "alice", 10, BigInt(5), "non-fungible").success,
    ).toBe(false);
  });

  it("rejects duplicate non-fungible mint", () => {
    let state = createERC1155();
    state = mintERC1155(state, "alice", 10, BigInt(1), "non-fungible").newState;
    expect(
      mintERC1155(state, "bob", 10, BigInt(1), "non-fungible").success,
    ).toBe(false);
  });

  it("rejects zero amount", () => {
    const state = createERC1155();
    expect(mintERC1155(state, "alice", 1, BigInt(0)).success).toBe(false);
  });

  it("stores URI when provided", () => {
    const state = createERC1155();
    const result = mintERC1155(
      state,
      "alice",
      1,
      BigInt(10),
      "fungible",
      "ipfs://meta",
    );
    expect(result.newState.uris[1]).toBe("ipfs://meta");
  });
});

describe("transferERC1155", () => {
  it("transfers fungible tokens", () => {
    let state = createERC1155();
    state = mintERC1155(state, "alice", 1, BigInt(100)).newState;
    const result = transferERC1155(state, "alice", "bob", 1, BigInt(40));
    expect(result.success).toBe(true);
    expect(balanceOfERC1155(result.newState, "alice", 1)).toBe(BigInt(60));
    expect(balanceOfERC1155(result.newState, "bob", 1)).toBe(BigInt(40));
  });

  it("rejects insufficient balance", () => {
    let state = createERC1155();
    state = mintERC1155(state, "alice", 1, BigInt(10)).newState;
    expect(transferERC1155(state, "alice", "bob", 1, BigInt(20)).success).toBe(
      false,
    );
  });

  it("rejects self transfer", () => {
    let state = createERC1155();
    state = mintERC1155(state, "alice", 1, BigInt(10)).newState;
    expect(transferERC1155(state, "alice", "alice", 1, BigInt(5)).success).toBe(
      false,
    );
  });
});

describe("batchTransferERC1155", () => {
  it("transfers multiple token types", () => {
    let state = createERC1155();
    state = mintERC1155(state, "alice", 1, BigInt(100)).newState;
    state = mintERC1155(state, "alice", 2, BigInt(50)).newState;
    const result = batchTransferERC1155(
      state,
      "alice",
      "bob",
      [1, 2],
      [BigInt(30), BigInt(20)],
    );
    expect(result.success).toBe(true);
    expect(balanceOfERC1155(result.newState, "bob", 1)).toBe(BigInt(30));
    expect(balanceOfERC1155(result.newState, "bob", 2)).toBe(BigInt(20));
  });

  it("rejects mismatched array lengths", () => {
    const state = createERC1155();
    expect(
      batchTransferERC1155(state, "alice", "bob", [1, 2], [BigInt(10)]).success,
    ).toBe(false);
  });

  it("rolls back on partial failure", () => {
    let state = createERC1155();
    state = mintERC1155(state, "alice", 1, BigInt(100)).newState;
    state = mintERC1155(state, "alice", 2, BigInt(5)).newState;
    const result = batchTransferERC1155(
      state,
      "alice",
      "bob",
      [1, 2],
      [BigInt(50), BigInt(10)],
    );
    expect(result.success).toBe(false);
    // Original state preserved
    expect(balanceOfERC1155(result.newState, "alice", 1)).toBe(BigInt(100));
  });
});

describe("balanceOfBatchERC1155", () => {
  it("returns batch balances", () => {
    let state = createERC1155();
    state = mintERC1155(state, "alice", 1, BigInt(100)).newState;
    state = mintERC1155(state, "bob", 2, BigInt(50)).newState;
    const balances = balanceOfBatchERC1155(state, ["alice", "bob"], [1, 2]);
    expect(balances).toEqual([BigInt(100), BigInt(50)]);
  });
});
