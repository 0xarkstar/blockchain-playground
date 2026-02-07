/**
 * Polynomial Operations + QAP (Quadratic Arithmetic Program).
 *
 * QAP transforms R1CS constraints into polynomial equations:
 *   A(x) * B(x) - C(x) = H(x) * T(x)
 *
 * where T(x) is the "target" polynomial that vanishes at each constraint point.
 * This is the key algebraic trick that enables succinct verification.
 */

import { modAdd, modSub, modMul, modInverse, modPow } from "./field";
import type { R1CS } from "./circuit";

// ── Types ──────────────────────────────────────────────────────────────

/** Polynomial as array of coefficients: [a0, a1, a2, ...] → a0 + a1*x + a2*x² + ... */
export type Polynomial = readonly bigint[];

export interface QAP {
  readonly Ai: readonly Polynomial[]; // one poly per wire, evaluating A column
  readonly Bi: readonly Polynomial[];
  readonly Ci: readonly Polynomial[];
  readonly target: Polynomial; // T(x) = ∏(x - i)
  readonly evaluationPoints: readonly bigint[];
}

export interface QAPVerification {
  readonly Ax: bigint;
  readonly Bx: bigint;
  readonly Cx: bigint;
  readonly Tx: bigint;
  readonly Hx: bigint;
  readonly lhs: bigint; // A(x)*B(x) - C(x)
  readonly rhs: bigint; // H(x)*T(x)
  readonly verified: boolean;
}

// ── Polynomial arithmetic ──────────────────────────────────────────────

export function evaluatePolynomial(
  poly: Polynomial,
  x: bigint,
  p: bigint
): bigint {
  let result = 0n;
  let xPow = 1n;
  for (const coeff of poly) {
    result = modAdd(result, modMul(coeff, xPow, p), p);
    xPow = modMul(xPow, x, p);
  }
  return result;
}

export function addPolynomials(
  a: Polynomial,
  b: Polynomial,
  p: bigint
): bigint[] {
  const maxLen = Math.max(a.length, b.length);
  const result: bigint[] = [];
  for (let i = 0; i < maxLen; i++) {
    result.push(modAdd(a[i] ?? 0n, b[i] ?? 0n, p));
  }
  return result;
}

export function multiplyPolynomials(
  a: Polynomial,
  b: Polynomial,
  p: bigint
): bigint[] {
  if (a.length === 0 || b.length === 0) return [0n];
  const result: bigint[] = new Array(a.length + b.length - 1).fill(0n);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = modAdd(result[i + j], modMul(a[i], b[j], p), p);
    }
  }
  return result;
}

export function subtractPolynomials(
  a: Polynomial,
  b: Polynomial,
  p: bigint
): bigint[] {
  const maxLen = Math.max(a.length, b.length);
  const result: bigint[] = [];
  for (let i = 0; i < maxLen; i++) {
    result.push(modSub(a[i] ?? 0n, b[i] ?? 0n, p));
  }
  return result;
}

/** Polynomial long division: returns [quotient, remainder]. */
export function dividePolynomials(
  num: Polynomial,
  den: Polynomial,
  p: bigint
): [bigint[], bigint[]] {
  const numerator = [...num];
  const denDeg = den.length - 1;
  const numDeg = numerator.length - 1;

  if (numDeg < denDeg) return [[0n], [...numerator]];

  const quotient: bigint[] = new Array(numDeg - denDeg + 1).fill(0n);
  const leadInv = modInverse(den[denDeg], p);

  for (let i = numDeg; i >= denDeg; i--) {
    const coeff = modMul(numerator[i], leadInv, p);
    quotient[i - denDeg] = coeff;
    for (let j = 0; j <= denDeg; j++) {
      numerator[i - denDeg + j] = modSub(
        numerator[i - denDeg + j],
        modMul(coeff, den[j], p),
        p
      );
    }
  }

  // Remainder is what's left in numerator[0..denDeg-1]
  const remainder = numerator.slice(0, denDeg);
  while (remainder.length === 0) remainder.push(0n);

  return [quotient, remainder];
}

/** Lagrange interpolation through a set of (x, y) points. */
export function lagrangeInterpolation(
  points: readonly { x: bigint; y: bigint }[],
  p: bigint
): bigint[] {
  const n = points.length;
  let result: bigint[] = [0n];

  for (let i = 0; i < n; i++) {
    // Build basis polynomial Li(x) = ∏_{j≠i} (x - xj) / (xi - xj)
    let basis: bigint[] = [1n];
    let denom = 1n;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      // Multiply by (x - xj): poly * [(-xj), 1]
      basis = multiplyPolynomials(basis, [modSub(0n, points[j].x, p), 1n], p);
      denom = modMul(denom, modSub(points[i].x, points[j].x, p), p);
    }
    // Scale by yi / denom
    const scale = modMul(points[i].y, modInverse(denom, p), p);
    const scaled = basis.map((c) => modMul(c, scale, p));
    result = addPolynomials(result, scaled, p);
  }

  return result;
}

// ── QAP construction ───────────────────────────────────────────────────

/**
 * Convert R1CS to QAP by interpolating each column of A, B, C
 * through evaluation points 1, 2, ..., numConstraints.
 */
export function r1csToQAP(r1cs: R1CS, p: bigint): QAP {
  const numConstraints = r1cs.numConstraints;
  const numWires = r1cs.wireNames.length;
  const evalPoints = Array.from({ length: numConstraints }, (_, i) =>
    BigInt(i + 1)
  );

  // For each wire j, interpolate a polynomial through (i+1, A[i][j])
  const Ai: bigint[][] = [];
  const Bi: bigint[][] = [];
  const Ci: bigint[][] = [];

  for (let j = 0; j < numWires; j++) {
    const aPoints = evalPoints.map((x, i) => ({ x, y: r1cs.A[i][j] }));
    const bPoints = evalPoints.map((x, i) => ({ x, y: r1cs.B[i][j] }));
    const cPoints = evalPoints.map((x, i) => ({ x, y: r1cs.C[i][j] }));
    Ai.push(lagrangeInterpolation(aPoints, p));
    Bi.push(lagrangeInterpolation(bPoints, p));
    Ci.push(lagrangeInterpolation(cPoints, p));
  }

  // Target polynomial T(x) = ∏(x - evalPoint)
  let target: bigint[] = [1n];
  for (const pt of evalPoints) {
    target = multiplyPolynomials(target, [modSub(0n, pt, p), 1n], p);
  }

  return { Ai, Bi, Ci, target, evaluationPoints: evalPoints };
}

/**
 * Verify a QAP: check that A(x)*B(x) - C(x) is divisible by T(x).
 * Returns the check at a random evaluation point.
 */
export function verifyQAP(
  qap: QAP,
  witness: readonly bigint[],
  p: bigint,
  evalAt?: bigint
): QAPVerification {
  // A(x) = Σ wi * Ai(x), similarly for B, C
  let Apoly: bigint[] = [0n];
  let Bpoly: bigint[] = [0n];
  let Cpoly: bigint[] = [0n];

  for (let j = 0; j < witness.length; j++) {
    const scaledA = (qap.Ai[j] ?? [0n]).map((c) => modMul(c, witness[j], p));
    const scaledB = (qap.Bi[j] ?? [0n]).map((c) => modMul(c, witness[j], p));
    const scaledC = (qap.Ci[j] ?? [0n]).map((c) => modMul(c, witness[j], p));
    Apoly = addPolynomials(Apoly, scaledA, p);
    Bpoly = addPolynomials(Bpoly, scaledB, p);
    Cpoly = addPolynomials(Cpoly, scaledC, p);
  }

  // P(x) = A(x)*B(x) - C(x)
  const AB = multiplyPolynomials(Apoly, Bpoly, p);
  const P = subtractPolynomials(AB, Cpoly, p);

  // H(x) = P(x) / T(x) — remainder should be zero
  const [H, remainder] = dividePolynomials(P, qap.target, p);
  const isZeroRemainder = remainder.every((c) => c === 0n);

  // Evaluate at a specific point for display
  const x = evalAt ?? 7n;
  const Ax = evaluatePolynomial(Apoly, x, p);
  const Bx = evaluatePolynomial(Bpoly, x, p);
  const Cx = evaluatePolynomial(Cpoly, x, p);
  const Tx = evaluatePolynomial(qap.target, x, p);
  const Hx = evaluatePolynomial(H, x, p);

  const lhs = modSub(modMul(Ax, Bx, p), Cx, p);
  const rhs = modMul(Hx, Tx, p);

  return {
    Ax,
    Bx,
    Cx,
    Tx,
    Hx,
    lhs,
    rhs,
    verified: isZeroRemainder && lhs === rhs,
  };
}

/** Format a polynomial for human-readable display. */
export function formatPolynomial(poly: Polynomial): string {
  if (poly.length === 0 || poly.every((c) => c === 0n)) return "0";

  const terms: string[] = [];
  for (let i = poly.length - 1; i >= 0; i--) {
    const c = poly[i];
    if (c === 0n) continue;
    if (i === 0) {
      terms.push(`${c}`);
    } else if (i === 1) {
      terms.push(c === 1n ? "x" : `${c}x`);
    } else {
      terms.push(c === 1n ? `x^${i}` : `${c}x^${i}`);
    }
  }
  return terms.join(" + ") || "0";
}
