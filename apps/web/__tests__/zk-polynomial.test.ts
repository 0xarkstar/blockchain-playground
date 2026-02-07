import { describe, it, expect } from "vitest";
import {
  evaluatePolynomial,
  addPolynomials,
  multiplyPolynomials,
  subtractPolynomials,
  dividePolynomials,
  lagrangeInterpolation,
  r1csToQAP,
  verifyQAP,
  formatPolynomial,
} from "../lib/zk/polynomial";
import {
  parseExpression,
  gatesToR1CS,
  computeWitness,
} from "../lib/zk/circuit";

describe("Polynomial Operations + QAP", () => {
  const p = 23n;

  describe("evaluatePolynomial", () => {
    it("evaluates constant", () => {
      expect(evaluatePolynomial([5n], 3n, p)).toBe(5n);
    });
    it("evaluates linear: 2x + 1 at x=3", () => {
      expect(evaluatePolynomial([1n, 2n], 3n, p)).toBe(7n);
    });
    it("evaluates quadratic: x² + x + 1 at x=4", () => {
      // 16 + 4 + 1 = 21
      expect(evaluatePolynomial([1n, 1n, 1n], 4n, p)).toBe(21n);
    });
    it("wraps in field", () => {
      // 3x² at x=5: 3*25 = 75 mod 23 = 6
      expect(evaluatePolynomial([0n, 0n, 3n], 5n, p)).toBe(6n);
    });
  });

  describe("addPolynomials", () => {
    it("adds same-degree polynomials", () => {
      const result = addPolynomials([1n, 2n], [3n, 4n], p);
      expect(result).toEqual([4n, 6n]);
    });
    it("adds different-degree polynomials", () => {
      const result = addPolynomials([1n], [0n, 0n, 5n], p);
      expect(result).toEqual([1n, 0n, 5n]);
    });
  });

  describe("subtractPolynomials", () => {
    it("subtracts polynomials", () => {
      const result = subtractPolynomials([5n, 3n], [2n, 1n], p);
      expect(result).toEqual([3n, 2n]);
    });
    it("wraps negative coefficients", () => {
      const result = subtractPolynomials([1n], [3n], p);
      expect(result).toEqual([21n]); // -2 mod 23 = 21
    });
  });

  describe("multiplyPolynomials", () => {
    it("multiplies (x+1)(x+2) = x²+3x+2", () => {
      const result = multiplyPolynomials([1n, 1n], [2n, 1n], p);
      expect(result).toEqual([2n, 3n, 1n]);
    });
    it("multiplies by constant", () => {
      const result = multiplyPolynomials([3n], [1n, 2n], p);
      expect(result).toEqual([3n, 6n]);
    });
  });

  describe("dividePolynomials", () => {
    it("divides x²+3x+2 by x+1 = x+2 remainder 0", () => {
      const [q, r] = dividePolynomials([2n, 3n, 1n], [1n, 1n], p);
      expect(q).toEqual([2n, 1n]);
      expect(r.every((c) => c === 0n)).toBe(true);
    });
    it("handles division with remainder", () => {
      const [q, r] = dividePolynomials([1n, 0n, 1n], [1n, 1n], p);
      // x² + 1 / (x + 1) = (x - 1) remainder 2
      expect(q.length).toBeGreaterThan(0);
      // Verify: q * d + r = n
      const product = multiplyPolynomials(q, [1n, 1n], p);
      const sum = addPolynomials(product, r, p);
      expect(sum[0]).toBe(1n);
      expect(sum[2]).toBe(1n);
    });
  });

  describe("lagrangeInterpolation", () => {
    it("interpolates through single point", () => {
      const poly = lagrangeInterpolation([{ x: 0n, y: 5n }], p);
      expect(evaluatePolynomial(poly, 0n, p)).toBe(5n);
    });
    it("interpolates through two points", () => {
      const poly = lagrangeInterpolation(
        [
          { x: 1n, y: 2n },
          { x: 2n, y: 4n },
        ],
        p,
      );
      expect(evaluatePolynomial(poly, 1n, p)).toBe(2n);
      expect(evaluatePolynomial(poly, 2n, p)).toBe(4n);
    });
    it("interpolates through three points", () => {
      // y = x², points: (1,1), (2,4), (3,9)
      const poly = lagrangeInterpolation(
        [
          { x: 1n, y: 1n },
          { x: 2n, y: 4n },
          { x: 3n, y: 9n },
        ],
        p,
      );
      expect(evaluatePolynomial(poly, 1n, p)).toBe(1n);
      expect(evaluatePolynomial(poly, 2n, p)).toBe(4n);
      expect(evaluatePolynomial(poly, 3n, p)).toBe(9n);
    });
  });

  describe("r1csToQAP", () => {
    it("converts x*y R1CS to QAP", () => {
      const gates = parseExpression("x * y");
      const r1cs = gatesToR1CS(gates, p);
      const qap = r1csToQAP(r1cs, p);
      expect(qap.Ai.length).toBe(r1cs.wireNames.length);
      expect(qap.target.length).toBeGreaterThan(0);
      expect(qap.evaluationPoints).toHaveLength(1);
    });
  });

  describe("verifyQAP", () => {
    it("verifies x*y with valid witness", () => {
      const gates = parseExpression("x * y");
      const r1cs = gatesToR1CS(gates, p);
      const witness = computeWitness(gates, { x: 3n, y: 4n }, p);
      const qap = r1csToQAP(r1cs, p);
      const result = verifyQAP(qap, witness.wireVector, p);
      expect(result.verified).toBe(true);
    });

    it("verifies (x+y)*z with valid witness", () => {
      const gates = parseExpression("(x + y) * z");
      const r1cs = gatesToR1CS(gates, p);
      const witness = computeWitness(gates, { x: 2n, y: 3n, z: 4n }, p);
      const qap = r1csToQAP(r1cs, p);
      const result = verifyQAP(qap, witness.wireVector, p);
      expect(result.verified).toBe(true);
    });

    it("returns evaluation details", () => {
      const gates = parseExpression("x * y");
      const r1cs = gatesToR1CS(gates, p);
      const witness = computeWitness(gates, { x: 2n, y: 5n }, p);
      const qap = r1csToQAP(r1cs, p);
      const result = verifyQAP(qap, witness.wireVector, p, 7n);
      expect(result.lhs).toBe(result.rhs);
    });
  });

  describe("formatPolynomial", () => {
    it("formats constant", () => {
      expect(formatPolynomial([5n])).toBe("5");
    });
    it("formats linear", () => {
      expect(formatPolynomial([1n, 2n])).toBe("2x + 1");
    });
    it("formats quadratic", () => {
      expect(formatPolynomial([1n, 0n, 3n])).toBe("3x^2 + 1");
    });
    it("formats zero", () => {
      expect(formatPolynomial([0n])).toBe("0");
    });
    it("formats x^1 coefficient of 1", () => {
      expect(formatPolynomial([0n, 1n])).toBe("x");
    });
  });
});
