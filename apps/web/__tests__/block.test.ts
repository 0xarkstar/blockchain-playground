import { describe, it, expect } from "vitest";
import {
  computeBlockHash,
  createGenesisBlock,
  createBlock,
  createTransaction,
  mineBlock,
  meetsTarget,
} from "../lib/blockchain/block";

describe("block", () => {
  describe("computeBlockHash", () => {
    it("produces deterministic hash", () => {
      const header = {
        version: 1,
        previousHash: "0x" + "0".repeat(64),
        merkleRoot: "0x" + "ab".repeat(32),
        timestamp: 1000000,
        difficulty: 1,
        nonce: 42,
      };
      const h1 = computeBlockHash(header);
      const h2 = computeBlockHash(header);
      expect(h1).toBe(h2);
      expect(h1).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it("different nonce produces different hash", () => {
      const header = {
        version: 1,
        previousHash: "0x" + "0".repeat(64),
        merkleRoot: "0x" + "ab".repeat(32),
        timestamp: 1000000,
        difficulty: 1,
        nonce: 0,
      };
      const h1 = computeBlockHash(header);
      const h2 = computeBlockHash({ ...header, nonce: 1 });
      expect(h1).not.toBe(h2);
    });
  });

  describe("createGenesisBlock", () => {
    it("creates block at index 0", () => {
      const genesis = createGenesisBlock();
      expect(genesis.index).toBe(0);
      expect(genesis.transactions).toHaveLength(0);
      expect(genesis.hash).toMatch(/^0x[a-f0-9]{64}$/);
    });
  });

  describe("createBlock", () => {
    it("links to previous block", () => {
      const genesis = createGenesisBlock();
      const tx = createTransaction("0xAlice", "0xBob", 10);
      const block = createBlock(genesis, [tx], 1);
      expect(block.header.previousHash).toBe(genesis.hash);
      expect(block.index).toBe(1);
      expect(block.transactions).toHaveLength(1);
    });
  });

  describe("meetsTarget", () => {
    it("accepts hash with sufficient leading zeros", () => {
      expect(meetsTarget("0x0abc", 1)).toBe(true);
      expect(meetsTarget("0x00abc", 2)).toBe(true);
    });

    it("rejects hash without sufficient leading zeros", () => {
      expect(meetsTarget("0xabc", 1)).toBe(false);
    });
  });

  describe("mineBlock", () => {
    it("finds a valid nonce for difficulty 1", () => {
      const genesis = createGenesisBlock();
      const tx = createTransaction("0xAlice", "0xBob", 10);
      const block = createBlock(genesis, [tx], 1);
      const result = mineBlock(block);
      expect(meetsTarget(result.block.hash, 1)).toBe(true);
      expect(result.hashesComputed).toBeGreaterThan(0);
      expect(result.timeMs).toBeGreaterThanOrEqual(0);
    });
  });
});
