import { describe, it, expect } from "vitest";
import {
  parseExpression,
  gatesToR1CS,
  computeWitness,
  verifySatisfaction,
  getPresetExpressions,
} from "../lib/zk/circuit";

describe("Arithmetic Circuits + R1CS", () => {
  const p = 23n;

  describe("parseExpression", () => {
    it("parses simple multiply", () => {
      const gates = parseExpression("x * y");
      expect(gates).toHaveLength(1);
      expect(gates[0].op).toBe("mul");
      expect(gates[0].left).toBe("x");
      expect(gates[0].right).toBe("y");
    });

    it("parses simple add", () => {
      const gates = parseExpression("x + y");
      expect(gates).toHaveLength(1);
      expect(gates[0].op).toBe("add");
    });

    it("parses compound (x + y) * z", () => {
      const gates = parseExpression("(x + y) * z");
      expect(gates).toHaveLength(2);
      expect(gates[0].op).toBe("add");
      expect(gates[1].op).toBe("mul");
    });

    it("parses x * x + x", () => {
      const gates = parseExpression("x * x + x");
      expect(gates.length).toBeGreaterThanOrEqual(2);
    });

    it("handles constants", () => {
      const gates = parseExpression("x * 3");
      expect(gates).toHaveLength(1);
      expect(gates[0].right).toBe("3");
    });

    it("returns empty for empty input", () => {
      expect(parseExpression("")).toEqual([]);
    });
  });

  describe("gatesToR1CS", () => {
    it("creates R1CS for x * y", () => {
      const gates = parseExpression("x * y");
      const r1cs = gatesToR1CS(gates, p);
      expect(r1cs.numConstraints).toBe(1);
      expect(r1cs.wireNames).toContain("x");
      expect(r1cs.wireNames).toContain("y");
      expect(r1cs.wireNames).toContain("one");
    });

    it("creates R1CS for (x + y) * z", () => {
      const gates = parseExpression("(x + y) * z");
      const r1cs = gatesToR1CS(gates, p);
      expect(r1cs.numConstraints).toBe(2);
    });

    it("A, B, C matrices have correct dimensions", () => {
      const gates = parseExpression("x * y");
      const r1cs = gatesToR1CS(gates, p);
      expect(r1cs.A).toHaveLength(1);
      expect(r1cs.B).toHaveLength(1);
      expect(r1cs.C).toHaveLength(1);
      expect(r1cs.A[0]).toHaveLength(r1cs.wireNames.length);
    });
  });

  describe("computeWitness", () => {
    it("computes x * y = 12 for x=3, y=4", () => {
      const gates = parseExpression("x * y");
      const result = computeWitness(gates, { x: 3n, y: 4n }, p);
      expect(result.satisfied).toBe(true);
      expect(result.values[gates[0].output]).toBe(12n);
    });

    it("computes (x + y) * z for x=2, y=3, z=4", () => {
      const gates = parseExpression("(x + y) * z");
      const result = computeWitness(gates, { x: 2n, y: 3n, z: 4n }, p);
      expect(result.satisfied).toBe(true);
      expect(result.values[gates[gates.length - 1].output]).toBe(20n);
    });

    it("wraps in finite field", () => {
      const gates = parseExpression("x * x");
      const result = computeWitness(gates, { x: 5n }, p);
      expect(result.satisfied).toBe(true);
      expect(result.values[gates[0].output]).toBe(2n); // 25 mod 23
    });

    it("includes one=1 in values", () => {
      const gates = parseExpression("x * y");
      const result = computeWitness(gates, { x: 1n, y: 1n }, p);
      expect(result.values["one"]).toBe(1n);
    });
  });

  describe("verifySatisfaction", () => {
    it("all constraints satisfied for valid witness", () => {
      const gates = parseExpression("(x + y) * z");
      const r1cs = gatesToR1CS(gates, p);
      const witness = computeWitness(gates, { x: 2n, y: 3n, z: 4n }, p);
      const checks = verifySatisfaction(r1cs, witness.wireVector, p);
      expect(checks.every((c) => c.satisfied)).toBe(true);
    });

    it("returns per-constraint check results", () => {
      const gates = parseExpression("x * y + y * z");
      const r1cs = gatesToR1CS(gates, p);
      const witness = computeWitness(
        gates,
        { x: 2n, y: 3n, z: 4n },
        p
      );
      const checks = verifySatisfaction(r1cs, witness.wireVector, p);
      expect(checks.length).toBe(r1cs.numConstraints);
      for (const check of checks) {
        expect(check.lhs).toBe(check.rhs);
      }
    });
  });

  describe("getPresetExpressions", () => {
    it("returns at least 4 presets", () => {
      const presets = getPresetExpressions();
      expect(presets.length).toBeGreaterThanOrEqual(4);
    });

    it("each preset has required fields", () => {
      for (const p of getPresetExpressions()) {
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.expression.length).toBeGreaterThan(0);
        expect(p.variables.length).toBeGreaterThan(0);
        expect(Object.keys(p.suggestedInputs).length).toBeGreaterThan(0);
      }
    });

    it("presets produce valid witnesses", () => {
      for (const preset of getPresetExpressions()) {
        const gates = parseExpression(preset.expression);
        const result = computeWitness(gates, preset.suggestedInputs, 23n);
        expect(result.satisfied).toBe(true);
      }
    });
  });
});
