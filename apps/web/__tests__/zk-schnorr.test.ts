import { describe, it, expect } from "vitest";
import {
  generateSchnorrKeys,
  proverCommit,
  proverRespond,
  verifySchnorr,
  runProtocol,
} from "../lib/zk/schnorr";
import { getSchnorrField, modPow } from "../lib/zk/field";

describe("Schnorr Sigma Protocol", () => {
  const params = getSchnorrField();

  describe("generateSchnorrKeys", () => {
    it("creates valid key pair", () => {
      const keys = generateSchnorrKeys(params);
      expect(keys.secretKey).toBeGreaterThan(0n);
      expect(keys.secretKey).toBeLessThan(params.q);
      expect(keys.publicKey).toBe(modPow(params.g, keys.secretKey, params.p));
    });
  });

  describe("proverCommit", () => {
    it("produces commitment in field", () => {
      const c = proverCommit(params);
      expect(c.randomness).toBeGreaterThan(0n);
      expect(c.commitment).toBeGreaterThan(0n);
      expect(c.commitment).toBeLessThan(params.p);
    });
  });

  describe("proverRespond", () => {
    it("computes s = r + e*x mod q", () => {
      const s = proverRespond(3n, 2n, 5n, 11n);
      // s = (3 + 2*5) mod 11 = 13 mod 11 = 2
      expect(s).toBe(2n);
    });
  });

  describe("verifySchnorr", () => {
    it("verifies honest prover", () => {
      const keys = generateSchnorrKeys(params);
      const { randomness, commitment } = proverCommit(params);
      const challenge = 3n;
      const response = proverRespond(
        randomness,
        challenge,
        keys.secretKey,
        params.q,
      );
      const valid = verifySchnorr(
        params,
        commitment,
        challenge,
        response,
        keys.publicKey,
      );
      expect(valid).toBe(true);
    });

    it("rejects wrong response", () => {
      const keys = generateSchnorrKeys(params);
      const { commitment } = proverCommit(params);
      const challenge = 3n;
      const fakeResponse = 7n;
      const valid = verifySchnorr(
        params,
        commitment,
        challenge,
        fakeResponse,
        keys.publicKey,
      );
      expect(valid).toBe(false);
    });
  });

  describe("runProtocol", () => {
    it("all rounds verify for honest prover", () => {
      const keys = generateSchnorrKeys(params);
      const result = runProtocol(params, keys, 5);
      expect(result.allVerified).toBe(true);
      expect(result.rounds).toHaveLength(5);
    });

    it("each round has correct structure", () => {
      const keys = generateSchnorrKeys(params);
      const result = runProtocol(params, keys, 3);
      for (const round of result.rounds) {
        expect(round.commitment).toBeGreaterThan(0n);
        expect(round.challenge).toBeGreaterThan(0n);
        expect(round.lhs).toBe(round.rhs);
        expect(round.verified).toBe(true);
      }
    });

    it("returns keys and params", () => {
      const keys = generateSchnorrKeys(params);
      const result = runProtocol(params, keys, 1);
      expect(result.keys).toBe(keys);
      expect(result.params).toBe(params);
    });
  });
});
