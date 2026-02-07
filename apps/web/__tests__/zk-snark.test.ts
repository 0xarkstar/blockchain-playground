import { describe, it, expect } from "vitest";
import {
  performTrustedSetup,
  generateSNARKProof,
  verifySNARKProof,
  getFullPipeline,
} from "../lib/zk/snark";
import {
  parseExpression,
  gatesToR1CS,
  computeWitness,
} from "../lib/zk/circuit";
import { r1csToQAP } from "../lib/zk/polynomial";

describe("SNARK Pipeline", () => {
  const p = 23n;

  describe("performTrustedSetup", () => {
    it("generates tau and powers", () => {
      const setup = performTrustedSetup(5, p);
      expect(setup.tau).toBeGreaterThan(0n);
      expect(setup.powers).toHaveLength(6); // 0..5
      expect(setup.powers[0]).toBe(1n); // τ^0 = 1
      expect(setup.degree).toBe(5);
    });
  });

  describe("generateSNARKProof", () => {
    it("generates valid proof for x*y", () => {
      const gates = parseExpression("x * y");
      const r1cs = gatesToR1CS(gates, p);
      const witness = computeWitness(gates, { x: 3n, y: 4n }, p);
      const qap = r1csToQAP(r1cs, p);
      const setup = performTrustedSetup(
        Math.max(...qap.Ai.map((a) => a.length), qap.target.length) + 2,
        p,
      );
      const result = generateSNARKProof(qap, witness.wireVector, setup, p);
      expect(result.verified).toBe(true);
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it("returns proof components", () => {
      const gates = parseExpression("x * y");
      const r1cs = gatesToR1CS(gates, p);
      const witness = computeWitness(gates, { x: 2n, y: 5n }, p);
      const qap = r1csToQAP(r1cs, p);
      const setup = performTrustedSetup(10, p);
      const result = generateSNARKProof(qap, witness.wireVector, setup, p);
      expect(result.proof.piA).toBeDefined();
      expect(result.proof.piB).toBeDefined();
      expect(result.proof.piC).toBeDefined();
    });
  });

  describe("verifySNARKProof", () => {
    it("verifies valid proof", () => {
      const gates = parseExpression("x * y");
      const r1cs = gatesToR1CS(gates, p);
      const witness = computeWitness(gates, { x: 3n, y: 7n }, p);
      const qap = r1csToQAP(r1cs, p);
      const setup = performTrustedSetup(10, p);
      const result = generateSNARKProof(qap, witness.wireVector, setup, p);
      const verified = verifySNARKProof(
        result.proof,
        setup,
        qap,
        witness.wireVector,
        p,
      );
      expect(verified).toBe(true);
    });
  });

  describe("getFullPipeline", () => {
    it("runs end-to-end for x * y", () => {
      const result = getFullPipeline("x * y", { x: 3n, y: 4n }, p);
      expect(result.verified).toBe(true);
      expect(result.output).toBe(12n);
      expect(result.steps.length).toBeGreaterThanOrEqual(5);
    });

    it("runs end-to-end for (x + y) * z", () => {
      const result = getFullPipeline("(x + y) * z", { x: 2n, y: 3n, z: 4n }, p);
      expect(result.verified).toBe(true);
      expect(result.output).toBe(20n);
    });

    it("includes educational step annotations", () => {
      const result = getFullPipeline("x * y", { x: 1n, y: 1n }, p);
      const names = result.steps.map((s) => s.name);
      expect(names.some((n) => n.includes("Parse"))).toBe(true);
      expect(names.some((n) => n.includes("Witness"))).toBe(true);
      expect(names.some((n) => n.includes("R1CS"))).toBe(true);
    });

    it("returns gates and witness", () => {
      const result = getFullPipeline("x * y", { x: 2n, y: 3n }, p);
      expect(result.gates.length).toBeGreaterThan(0);
      expect(result.witness.length).toBeGreaterThan(0);
    });
  });
});
