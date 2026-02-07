import { describe, it, expect } from "vitest";
import {
  createRollupState,
  processBatch,
  calculateCompression,
} from "../lib/zk/rollup";

describe("ZK Rollup Simulator", () => {
  const accounts = [
    { address: "alice", balance: 1000n },
    { address: "bob", balance: 500n },
    { address: "charlie", balance: 200n },
  ];

  describe("createRollupState", () => {
    it("creates state with accounts", () => {
      const state = createRollupState(accounts);
      expect(state.accounts).toHaveLength(3);
      expect(state.blockNumber).toBe(0);
      expect(state.stateRoot).toMatch(/^0x/);
    });

    it("initializes nonces to 0", () => {
      const state = createRollupState(accounts);
      for (const acct of state.accounts) {
        expect(acct.nonce).toBe(0);
      }
    });

    it("preserves balances", () => {
      const state = createRollupState(accounts);
      expect(state.accounts[0].balance).toBe(1000n);
      expect(state.accounts[1].balance).toBe(500n);
    });
  });

  describe("processBatch", () => {
    it("processes valid transfer", () => {
      const state = createRollupState(accounts);
      const result = processBatch(state, [
        { from: "alice", to: "bob", amount: 100n },
      ]);
      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(0);
      expect(result.newState.accounts[0].balance).toBe(900n);
      expect(result.newState.accounts[1].balance).toBe(600n);
    });

    it("increments block number", () => {
      const state = createRollupState(accounts);
      const result = processBatch(state, [
        { from: "alice", to: "bob", amount: 10n },
      ]);
      expect(result.newState.blockNumber).toBe(1);
      expect(result.batchNumber).toBe(1);
    });

    it("increments sender nonce", () => {
      const state = createRollupState(accounts);
      const result = processBatch(state, [
        { from: "alice", to: "bob", amount: 10n },
      ]);
      expect(result.newState.accounts[0].nonce).toBe(1);
    });

    it("rejects insufficient balance", () => {
      const state = createRollupState(accounts);
      const result = processBatch(state, [
        { from: "charlie", to: "alice", amount: 500n },
      ]);
      expect(result.successCount).toBe(0);
      expect(result.failCount).toBe(1);
      expect(result.transactions[0].message).toContain("Insufficient");
    });

    it("rejects unknown sender", () => {
      const state = createRollupState(accounts);
      const result = processBatch(state, [
        { from: "unknown", to: "alice", amount: 10n },
      ]);
      expect(result.failCount).toBe(1);
      expect(result.transactions[0].message).toContain("not found");
    });

    it("rejects zero amount", () => {
      const state = createRollupState(accounts);
      const result = processBatch(state, [
        { from: "alice", to: "bob", amount: 0n },
      ]);
      expect(result.failCount).toBe(1);
    });

    it("processes multiple transactions in batch", () => {
      const state = createRollupState(accounts);
      const result = processBatch(state, [
        { from: "alice", to: "bob", amount: 100n },
        { from: "bob", to: "charlie", amount: 50n },
        { from: "charlie", to: "alice", amount: 25n },
      ]);
      expect(result.successCount).toBe(3);
      expect(result.newState.accounts[0].balance).toBe(925n);
    });

    it("generates different state roots", () => {
      const state = createRollupState(accounts);
      const result = processBatch(state, [
        { from: "alice", to: "bob", amount: 10n },
      ]);
      expect(result.postStateRoot).not.toBe(result.preStateRoot);
    });

    it("generates proof hash", () => {
      const state = createRollupState(accounts);
      const result = processBatch(state, [
        { from: "alice", to: "bob", amount: 10n },
      ]);
      expect(result.proofHash).toMatch(/^0x/);
    });
  });

  describe("calculateCompression", () => {
    it("calculates savings for 100 transactions", () => {
      const analysis = calculateCompression(100);
      expect(analysis.txCount).toBe(100);
      expect(analysis.l2TotalGas).toBeLessThan(analysis.l1TotalGas);
      expect(analysis.savings).toBeGreaterThan(0);
    });

    it("returns gas breakdown", () => {
      const analysis = calculateCompression(50);
      expect(analysis.l1GasPerTx).toBeGreaterThan(0);
      expect(analysis.l2GasPerTx).toBeGreaterThan(0);
      expect(analysis.l2ProofGas).toBeGreaterThan(0);
    });

    it("compression ratio increases with batch size", () => {
      const small = calculateCompression(10);
      const large = calculateCompression(1000);
      expect(large.compressionRatio).toBeGreaterThan(small.compressionRatio);
    });

    it("small batches may not save gas", () => {
      const tiny = calculateCompression(1);
      // Proof overhead may exceed savings for single tx
      expect(typeof tiny.savings).toBe("number");
    });
  });
});
