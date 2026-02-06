import { describe, it, expect } from "vitest";
import { MerkleTree } from "../lib/blockchain/merkle";

describe("MerkleTree", () => {
  it("builds a tree from data", () => {
    const tree = new MerkleTree(["a", "b", "c", "d"]);
    expect(tree.root.hash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(tree.leaves).toHaveLength(4);
    expect(tree.levels.length).toBeGreaterThan(1);
  });

  it("produces deterministic roots", () => {
    const tree1 = new MerkleTree(["a", "b", "c", "d"]);
    const tree2 = new MerkleTree(["a", "b", "c", "d"]);
    expect(tree1.root.hash).toBe(tree2.root.hash);
  });

  it("different data produces different roots", () => {
    const tree1 = new MerkleTree(["a", "b", "c", "d"]);
    const tree2 = new MerkleTree(["a", "b", "c", "e"]);
    expect(tree1.root.hash).not.toBe(tree2.root.hash);
  });

  it("handles odd number of leaves", () => {
    const tree = new MerkleTree(["a", "b", "c"]);
    expect(tree.root.hash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it("handles single leaf", () => {
    const tree = new MerkleTree(["alone"]);
    expect(tree.root.hash).toBe(tree.leaves[0].hash);
  });

  describe("proof generation and verification", () => {
    it("generates and verifies a valid proof", () => {
      const tree = new MerkleTree(["a", "b", "c", "d"]);
      const proof = tree.getProof(0);
      expect(proof.root).toBe(tree.root.hash);
      expect(proof.leaf).toBe(tree.leaves[0].hash);
      expect(MerkleTree.verifyProof(proof)).toBe(true);
    });

    it("verifies proof for any leaf index", () => {
      const tree = new MerkleTree(["a", "b", "c", "d", "e", "f", "g", "h"]);
      for (let i = 0; i < 8; i++) {
        const proof = tree.getProof(i);
        expect(MerkleTree.verifyProof(proof)).toBe(true);
      }
    });

    it("fails verification with tampered proof", () => {
      const tree = new MerkleTree(["a", "b", "c", "d"]);
      const proof = tree.getProof(0);
      const tampered = { ...proof, leaf: "0x" + "ff".repeat(32) };
      expect(MerkleTree.verifyProof(tampered)).toBe(false);
    });
  });
});
