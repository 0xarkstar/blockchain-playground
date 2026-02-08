/**
 * Arithmetic Circuits + R1CS — the front-end of a SNARK pipeline.
 *
 * An arithmetic circuit expresses a computation as a DAG of addition and
 * multiplication gates over a finite field.  R1CS (Rank-1 Constraint System)
 * is a matrix representation: for each gate, A·w * B·w = C·w.
 *
 * This module parses simple expressions, flattens them into gates,
 * computes witnesses, and builds/verifies R1CS.
 */

import { modAdd, modMul } from "./field";

// ── Types ──────────────────────────────────────────────────────────────

export interface Gate {
  readonly op: "add" | "mul";
  readonly left: string; // wire name or constant
  readonly right: string;
  readonly output: string;
}

export interface R1CS {
  readonly A: readonly (readonly bigint[])[];
  readonly B: readonly (readonly bigint[])[];
  readonly C: readonly (readonly bigint[])[];
  readonly wireNames: readonly string[];
  readonly numConstraints: number;
}

export interface WitnessResult {
  readonly values: Readonly<Record<string, bigint>>;
  readonly wireVector: readonly bigint[];
  readonly wireNames: readonly string[];
  readonly satisfied: boolean;
}

export interface ConstraintCheck {
  readonly index: number;
  readonly lhs: bigint; // (A·w) * (B·w)
  readonly rhs: bigint; // C·w
  readonly satisfied: boolean;
}

export interface PresetExpression {
  readonly name: string;
  readonly expression: string;
  readonly variables: readonly string[];
  readonly suggestedInputs: Readonly<Record<string, bigint>>;
  readonly description: string;
}

// ── Parser (minimal grammar: +, *, parens, vars, ints) ─────────────────

interface Token {
  type: "num" | "var" | "op" | "lparen" | "rparen";
  value: string;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    if (expr[i] === " ") {
      i++;
      continue;
    }
    if (expr[i] === "(") {
      tokens.push({ type: "lparen", value: "(" });
      i++;
    } else if (expr[i] === ")") {
      tokens.push({ type: "rparen", value: ")" });
      i++;
    } else if (expr[i] === "+" || expr[i] === "*") {
      tokens.push({ type: "op", value: expr[i] });
      i++;
    } else if (/\d/.test(expr[i])) {
      let num = "";
      while (i < expr.length && /\d/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: "num", value: num });
    } else if (/[a-zA-Z_]/.test(expr[i])) {
      let name = "";
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        name += expr[i];
        i++;
      }
      tokens.push({ type: "var", value: name });
    } else {
      i++;
    }
  }
  return tokens;
}

/** Recursive-descent parser: expr → term (('+') term)* */
function parseExpr(
  tokens: Token[],
  pos: { i: number },
  gates: Gate[],
  counter: { n: number },
): string {
  let left = parseTerm(tokens, pos, gates, counter);
  while (pos.i < tokens.length && tokens[pos.i].value === "+") {
    pos.i++; // skip +
    const right = parseTerm(tokens, pos, gates, counter);
    const out = `_t${counter.n++}`;
    gates.push({ op: "add", left, right, output: out });
    left = out;
  }
  return left;
}

/** term → factor (('*') factor)* */
function parseTerm(
  tokens: Token[],
  pos: { i: number },
  gates: Gate[],
  counter: { n: number },
): string {
  let left = parseFactor(tokens, pos, gates, counter);
  while (pos.i < tokens.length && tokens[pos.i].value === "*") {
    pos.i++; // skip *
    const right = parseFactor(tokens, pos, gates, counter);
    const out = `_t${counter.n++}`;
    gates.push({ op: "mul", left, right, output: out });
    left = out;
  }
  return left;
}

/** factor → '(' expr ')' | num | var */
function parseFactor(
  tokens: Token[],
  pos: { i: number },
  gates: Gate[],
  counter: { n: number },
): string {
  const tok = tokens[pos.i];
  if (tok.type === "lparen") {
    pos.i++; // skip (
    const result = parseExpr(tokens, pos, gates, counter);
    pos.i++; // skip )
    return result;
  }
  pos.i++;
  return tok.value;
}

// ── Public API ─────────────────────────────────────────────────────────

/** Parse an expression string into a flat list of arithmetic gates. */
export function parseExpression(expr: string): Gate[] {
  const tokens = tokenize(expr);
  if (tokens.length === 0) return [];
  const gates: Gate[] = [];
  const pos = { i: 0 };
  const counter = { n: 0 };
  parseExpr(tokens, pos, gates, counter);
  return gates;
}

/** Convert gates to R1CS matrices. */
export function gatesToR1CS(gates: readonly Gate[], p: bigint): R1CS {
  // Collect wire names: "one" first, then inputs/constants, then intermediates
  const wireSet = new Set<string>(["one"]);
  for (const g of gates) {
    wireSet.add(g.left);
    wireSet.add(g.right);
    wireSet.add(g.output);
  }
  const wireNames = Array.from(wireSet);
  const idx = (name: string) => wireNames.indexOf(name);
  const numWires = wireNames.length;

  const A: bigint[][] = [];
  const B: bigint[][] = [];
  const C: bigint[][] = [];

  for (const g of gates) {
    const a = new Array<bigint>(numWires).fill(0n);
    const b = new Array<bigint>(numWires).fill(0n);
    const c = new Array<bigint>(numWires).fill(0n);

    if (g.op === "mul") {
      // Constraint: left * right = output
      if (/^\d+$/.test(g.left)) {
        a[idx("one")] = BigInt(g.left);
      } else {
        a[idx(g.left)] = 1n;
      }
      if (/^\d+$/.test(g.right)) {
        b[idx("one")] = BigInt(g.right);
      } else {
        b[idx(g.right)] = 1n;
      }
      c[idx(g.output)] = 1n;
    } else {
      // add: (left + right) * 1 = output
      if (/^\d+$/.test(g.left)) {
        a[idx("one")] = modAdd(a[idx("one")], BigInt(g.left), p);
      } else {
        a[idx(g.left)] = 1n;
      }
      if (/^\d+$/.test(g.right)) {
        a[idx("one")] = modAdd(a[idx("one")], BigInt(g.right), p);
      } else {
        a[idx(g.right)] = modAdd(a[idx(g.right)], 1n, p);
      }
      b[idx("one")] = 1n;
      c[idx(g.output)] = 1n;
    }

    A.push(a);
    B.push(b);
    C.push(c);
  }

  return { A, B, C, wireNames, numConstraints: gates.length };
}

/** Compute witness vector from gates and input values. */
export function computeWitness(
  gates: readonly Gate[],
  inputs: Readonly<Record<string, bigint>>,
  p: bigint,
): WitnessResult {
  const values: Record<string, bigint> = { one: 1n, ...inputs };

  // Assign constant values
  for (const g of gates) {
    if (/^\d+$/.test(g.left) && !(g.left in values)) {
      values[g.left] = BigInt(g.left) % p;
    }
    if (/^\d+$/.test(g.right) && !(g.right in values)) {
      values[g.right] = BigInt(g.right) % p;
    }
  }

  // Evaluate gates in order
  for (const g of gates) {
    const l = values[g.left] ?? 0n;
    const r = values[g.right] ?? 0n;
    values[g.output] = g.op === "mul" ? modMul(l, r, p) : modAdd(l, r, p);
  }

  // Build wire vector matching R1CS ordering
  const wireSet = new Set<string>(["one"]);
  for (const g of gates) {
    wireSet.add(g.left);
    wireSet.add(g.right);
    wireSet.add(g.output);
  }
  const wireNames = Array.from(wireSet);
  const wireVector = wireNames.map((n) => values[n] ?? 0n);

  // Verify satisfaction
  const r1cs = gatesToR1CS(gates, p);
  const checks = verifySatisfaction(r1cs, wireVector, p);
  const satisfied = checks.every((c) => c.satisfied);

  return { values, wireVector, wireNames, satisfied };
}

/** Check each R1CS constraint: (A·w) * (B·w) = C·w  (mod p). */
export function verifySatisfaction(
  r1cs: R1CS,
  witness: readonly bigint[],
  p: bigint,
): ConstraintCheck[] {
  const checks: ConstraintCheck[] = [];
  for (let i = 0; i < r1cs.numConstraints; i++) {
    let aw = 0n;
    let bw = 0n;
    let cw = 0n;
    for (let j = 0; j < witness.length; j++) {
      aw = modAdd(aw, modMul(r1cs.A[i][j], witness[j], p), p);
      bw = modAdd(bw, modMul(r1cs.B[i][j], witness[j], p), p);
      cw = modAdd(cw, modMul(r1cs.C[i][j], witness[j], p), p);
    }
    const lhs = modMul(aw, bw, p);
    checks.push({ index: i, lhs, rhs: cw, satisfied: lhs === cw });
  }
  return checks;
}

/** Curated preset expressions for the demo UI. */
export function getPresetExpressions(): readonly PresetExpression[] {
  return [
    {
      name: "Simple multiply",
      expression: "x * y",
      variables: ["x", "y"],
      suggestedInputs: { x: 3n, y: 4n },
      description: "Single multiplication gate: x * y = 12",
    },
    {
      name: "Add and multiply",
      expression: "(x + y) * z",
      variables: ["x", "y", "z"],
      suggestedInputs: { x: 2n, y: 3n, z: 4n },
      description: "Addition then multiplication: (2+3)*4 = 20",
    },
    {
      name: "Quadratic",
      expression: "x * x + x",
      variables: ["x"],
      suggestedInputs: { x: 5n },
      description: "x squared plus x: 5*5 + 5 = 7 (mod 23)",
    },
    {
      name: "Two multiplications",
      expression: "x * y + y * z",
      variables: ["x", "y", "z"],
      suggestedInputs: { x: 2n, y: 3n, z: 4n },
      description: "Sum of products: 2*3 + 3*4 = 18",
    },
  ] as const;
}
