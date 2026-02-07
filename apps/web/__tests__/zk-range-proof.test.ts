import { describe, it, expect } from "vitest";
import {
  decomposeToBits,
  constructRangeProof,
  verifyRangeProof,
} from "../lib/zk/range-proof";
import { createPedersenParams } from "../lib/zk/pedersen";

describe("Range Proof", () => {
  const params = createPedersenParams();

  describe("decomposeToBits", () => {
    it("decomposes 5 into [1,0,1]", () => {
      expect(decomposeToBits(5n, 3)).toEqual([1, 0, 1]);
    });
    it("decomposes 0 into [0,0,0]", () => {
      expect(decomposeToBits(0n, 3)).toEqual([0, 0, 0]);
    });
    it("decomposes 7 into [1,1,1]", () => {
      expect(decomposeToBits(7n, 3)).toEqual([1, 1, 1]);
    });
    it("decomposes 1 into [1,0,0,0]", () => {
      expect(decomposeToBits(1n, 4)).toEqual([1, 0, 0, 0]);
    });
  });

  describe("constructRangeProof", () => {
    it("proves value in range [0, 2^4)", () => {
      const proof = constructRangeProof(params, 5n, 4);
      expect(proof.valid).toBe(true);
      expect(proof.bitCommitments).toHaveLength(4);
      expect(proof.value).toBe(5n);
    });

    it("proves zero is in range", () => {
      const proof = constructRangeProof(params, 0n, 4);
      expect(proof.valid).toBe(true);
    });

    it("proves max value is in range", () => {
      const proof = constructRangeProof(params, 7n, 3);
      expect(proof.valid).toBe(true);
    });

    it("rejects value out of range", () => {
      const proof = constructRangeProof(params, 16n, 4);
      expect(proof.valid).toBe(false);
    });

    it("rejects negative value", () => {
      const proof = constructRangeProof(params, -1n, 4);
      expect(proof.valid).toBe(false);
    });

    it("works with null params (uses defaults)", () => {
      const proof = constructRangeProof(null, 3n, 3);
      expect(proof.valid).toBe(true);
    });
  });

  describe("verifyRangeProof", () => {
    it("verifies valid proof", () => {
      const proof = constructRangeProof(params, 5n, 4);
      expect(verifyRangeProof(proof)).toBe(true);
    });

    it("rejects invalid proof", () => {
      const proof = constructRangeProof(params, 16n, 4);
      expect(verifyRangeProof(proof)).toBe(false);
    });

    it("rejects proof with no bit commitments", () => {
      expect(
        verifyRangeProof({
          value: 5n,
          numBits: 4,
          totalCommitment: 0n,
          bitCommitments: [],
          reconstructed: 0n,
          valid: false,
        })
      ).toBe(false);
    });
  });
});
