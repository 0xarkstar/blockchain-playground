import { describe, it, expect } from "vitest";
import {
  createPedersenParams,
  pedersenCommit,
  verifyPedersen,
  demonstrateHomomorphic,
} from "../lib/zk/pedersen";
import { modPow, modMul } from "../lib/zk/field";

describe("Pedersen Commitment", () => {
  const params = createPedersenParams();

  describe("createPedersenParams", () => {
    it("returns correct default params", () => {
      expect(params.p).toBe(23n);
      expect(params.g).toBe(2n);
      expect(params.h).toBe(9n);
      expect(params.q).toBe(11n);
    });

    it("h is in the subgroup", () => {
      expect(modPow(params.h, params.q, params.p)).toBe(1n);
    });

    it("g is in the subgroup", () => {
      expect(modPow(params.g, params.q, params.p)).toBe(1n);
    });
  });

  describe("pedersenCommit", () => {
    it("computes C = g^v * h^r mod p", () => {
      const result = pedersenCommit(params, 3n, 5n);
      const expected = modMul(modPow(2n, 3n, 23n), modPow(9n, 5n, 23n), 23n);
      expect(result.commitment).toBe(expected);
    });

    it("returns component parts", () => {
      const result = pedersenCommit(params, 2n, 4n);
      expect(result.gPart).toBe(modPow(params.g, 2n, params.p));
      expect(result.hPart).toBe(modPow(params.h, 4n, params.p));
      expect(result.value).toBe(2n);
      expect(result.randomness).toBe(4n);
    });

    it("different randomness gives different commitments", () => {
      const c1 = pedersenCommit(params, 5n, 1n);
      const c2 = pedersenCommit(params, 5n, 2n);
      expect(c1.commitment).not.toBe(c2.commitment);
    });
  });

  describe("verifyPedersen", () => {
    it("verifies valid commitment", () => {
      const c = pedersenCommit(params, 7n, 3n);
      expect(verifyPedersen(params, 7n, 3n, c.commitment)).toBe(true);
    });

    it("rejects wrong value", () => {
      const c = pedersenCommit(params, 7n, 3n);
      expect(verifyPedersen(params, 8n, 3n, c.commitment)).toBe(false);
    });

    it("rejects wrong randomness", () => {
      const c = pedersenCommit(params, 7n, 3n);
      expect(verifyPedersen(params, 7n, 4n, c.commitment)).toBe(false);
    });
  });

  describe("demonstrateHomomorphic", () => {
    it("C1 * C2 = commit(v1+v2, r1+r2)", () => {
      const demo = demonstrateHomomorphic(params, 3n, 2n, 4n, 5n);
      expect(demo.matches).toBe(true);
      expect(demo.product).toBe(demo.combined);
    });

    it("works with various inputs", () => {
      const cases = [
        [1n, 1n, 1n, 1n],
        [5n, 3n, 7n, 2n],
        [0n, 1n, 0n, 1n],
        [10n, 8n, 9n, 7n],
      ] as const;
      for (const [v1, r1, v2, r2] of cases) {
        const demo = demonstrateHomomorphic(params, v1, r1, v2, r2);
        expect(demo.matches).toBe(true);
      }
    });

    it("returns individual commitments", () => {
      const demo = demonstrateHomomorphic(params, 2n, 3n, 4n, 5n);
      expect(demo.c1.value).toBe(2n);
      expect(demo.c2.value).toBe(4n);
    });
  });
});
