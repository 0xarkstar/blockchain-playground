/**
 * Simplified SNARK Pipeline — end-to-end demonstration.
 *
 * A real SNARK (Groth16, PLONK) uses elliptic-curve pairings.
 * This simulation shows the conceptual flow:
 *   Expression → Circuit → R1CS → QAP → Trusted Setup → Proof → Verify
 *
 * Every step is annotated with educational warnings about what a real
 * implementation does differently.
 */

import { modPow, modMul, randomFieldElement } from "./field";
import { parseExpression, gatesToR1CS, computeWitness, type Gate } from "./circuit";
import {
  r1csToQAP,
  verifyQAP,
  evaluatePolynomial,
  type QAP,
} from "./polynomial";

// ── Types ──────────────────────────────────────────────────────────────

export interface TrustedSetup {
  readonly tau: bigint; // toxic waste (must be destroyed in real SNARK!)
  readonly powers: readonly bigint[]; // g^(τ^i) simulated as τ^i
  readonly degree: number;
}

export interface SNARKProof {
  readonly piA: bigint;
  readonly piB: bigint;
  readonly piC: bigint;
}

export interface SNARKResult {
  readonly proof: SNARKProof;
  readonly verified: boolean;
  readonly steps: readonly PipelineStep[];
}

export interface PipelineStep {
  readonly name: string;
  readonly description: string;
  readonly data: Record<string, unknown>;
  readonly warning?: string;
}

export interface FullPipelineResult {
  readonly expression: string;
  readonly inputs: Readonly<Record<string, bigint>>;
  readonly gates: readonly Gate[];
  readonly witness: readonly bigint[];
  readonly qap: QAP;
  readonly setup: TrustedSetup;
  readonly proof: SNARKProof;
  readonly verified: boolean;
  readonly steps: readonly PipelineStep[];
  readonly output: bigint;
}

// ── Trusted Setup ──────────────────────────────────────────────────────

export function performTrustedSetup(degree: number, p: bigint): TrustedSetup {
  const tau = randomFieldElement(p);
  const powers: bigint[] = [];
  for (let i = 0; i <= degree; i++) {
    powers.push(modPow(tau, BigInt(i), p));
  }
  return { tau, powers, degree };
}

// ── Proof Generation ───────────────────────────────────────────────────

export function generateSNARKProof(
  qap: QAP,
  witness: readonly bigint[],
  setup: TrustedSetup,
  p: bigint
): SNARKResult {
  const steps: PipelineStep[] = [];

  // Step: evaluate QAP polynomials at τ
  let Atau = 0n;
  let Btau = 0n;
  let Ctau = 0n;

  for (let j = 0; j < witness.length; j++) {
    const aj = evaluatePolynomial(qap.Ai[j] ?? [0n], setup.tau, p);
    const bj = evaluatePolynomial(qap.Bi[j] ?? [0n], setup.tau, p);
    const cj = evaluatePolynomial(qap.Ci[j] ?? [0n], setup.tau, p);
    Atau = (Atau + modMul(witness[j], aj, p)) % p;
    Btau = (Btau + modMul(witness[j], bj, p)) % p;
    Ctau = (Ctau + modMul(witness[j], cj, p)) % p;
  }

  steps.push({
    name: "Evaluate at secret point",
    description: "Evaluate QAP polynomials A(τ), B(τ), C(τ) using encrypted powers of τ",
    data: { "A(τ)": Atau.toString(), "B(τ)": Btau.toString(), "C(τ)": Ctau.toString() },
    warning: "In a real SNARK, τ is destroyed after setup. Evaluations use elliptic-curve operations on encrypted powers.",
  });

  const proof: SNARKProof = { piA: Atau, piB: Btau, piC: Ctau };

  // Verify: A*B - C should be divisible by T(τ)
  const qapCheck = verifyQAP(qap, witness, p, setup.tau);

  steps.push({
    name: "Verify proof",
    description: "Check A(τ)*B(τ) - C(τ) = H(τ)*T(τ)",
    data: {
      "A*B - C": qapCheck.lhs.toString(),
      "H*T": qapCheck.rhs.toString(),
      verified: qapCheck.verified,
    },
    warning: "Real SNARKs use bilinear pairings: e(πA, πB) = e(πC, g) * e(H, T) on elliptic curves.",
  });

  return { proof, verified: qapCheck.verified, steps };
}

/** Verify a SNARK proof (simplified: check A*B ≡ C mod p at the setup point). */
export function verifySNARKProof(
  proof: SNARKProof,
  setup: TrustedSetup,
  qap: QAP,
  witness: readonly bigint[],
  p: bigint
): boolean {
  const qapCheck = verifyQAP(qap, witness, p, setup.tau);
  return qapCheck.verified;
}

// ── Full Pipeline ──────────────────────────────────────────────────────

/** Run the entire SNARK pipeline end-to-end with educational annotations. */
export function getFullPipeline(
  expression: string,
  inputs: Readonly<Record<string, bigint>>,
  p: bigint
): FullPipelineResult {
  const steps: PipelineStep[] = [];

  // 1. Parse
  const gates = parseExpression(expression);
  steps.push({
    name: "1. Parse Expression",
    description: `Parsed "${expression}" into ${gates.length} arithmetic gate(s)`,
    data: { gates: gates.map((g) => `${g.output} = ${g.left} ${g.op === "mul" ? "*" : "+"} ${g.right}`) },
  });

  // 2. Compute witness
  const witnessResult = computeWitness(gates, inputs, p);
  const output = gates.length > 0
    ? witnessResult.values[gates[gates.length - 1].output] ?? 0n
    : 0n;
  steps.push({
    name: "2. Compute Witness",
    description: "Evaluate all wires with the given inputs",
    data: { ...Object.fromEntries(Object.entries(witnessResult.values).map(([k, v]) => [k, v.toString()])) },
  });

  // 3. R1CS
  const r1cs = gatesToR1CS(gates, p);
  steps.push({
    name: "3. Build R1CS",
    description: `${r1cs.numConstraints} constraint(s), ${r1cs.wireNames.length} wire(s)`,
    data: { wires: r1cs.wireNames, constraints: r1cs.numConstraints },
  });

  // 4. QAP
  const qap = r1csToQAP(r1cs, p);
  steps.push({
    name: "4. R1CS → QAP",
    description: "Interpolate constraint matrices into polynomials",
    data: { evaluationPoints: qap.evaluationPoints.map(String) },
    warning: "QAP converts discrete constraint checks into a single polynomial divisibility check.",
  });

  // 5. Setup
  const maxDeg = Math.max(
    ...qap.Ai.map((poly) => poly.length),
    ...qap.Bi.map((poly) => poly.length),
    ...qap.Ci.map((poly) => poly.length),
    qap.target.length
  );
  const setup = performTrustedSetup(maxDeg + 2, p);
  steps.push({
    name: "5. Trusted Setup",
    description: "Generate secret τ and its powers (toxic waste ceremony)",
    data: { tau: setup.tau.toString(), degree: setup.degree },
    warning: "In real SNARKs, τ must be securely destroyed. Multi-party ceremonies (Powers of Tau) ensure no single party knows τ.",
  });

  // 6. Prove
  const snarkResult = generateSNARKProof(qap, witnessResult.wireVector, setup, p);
  steps.push(...snarkResult.steps);

  return {
    expression,
    inputs,
    gates,
    witness: witnessResult.wireVector,
    qap,
    setup,
    proof: snarkResult.proof,
    verified: snarkResult.verified,
    steps,
    output,
  };
}
