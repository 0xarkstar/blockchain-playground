/**
 * Schnorr Sigma Protocol — interactive ZK proof of discrete-log knowledge.
 *
 * Prover proves "I know x such that y = g^x mod p" without revealing x.
 *
 * Protocol:
 *   1. Prover picks random r, sends R = g^r mod p
 *   2. Verifier sends random challenge e
 *   3. Prover responds s = (r + e*x) mod q
 *   4. Verifier checks g^s ≡ R * y^e  (mod p)
 */

import {
  modPow,
  modAdd,
  modMul,
  randomFieldElement,
  type FieldParams,
} from "./field";

// ── Types ──────────────────────────────────────────────────────────────

export interface SchnorrKeys {
  readonly secretKey: bigint;
  readonly publicKey: bigint;
}

export interface SchnorrCommitment {
  readonly randomness: bigint; // r (secret)
  readonly commitment: bigint; // R = g^r mod p
}

export interface SchnorrRound {
  readonly round: number;
  readonly commitment: bigint; // R
  readonly challenge: bigint; // e
  readonly response: bigint; // s
  readonly verified: boolean;
  readonly lhs: bigint; // g^s mod p
  readonly rhs: bigint; // R * y^e mod p
}

export interface SchnorrProtocolResult {
  readonly keys: SchnorrKeys;
  readonly params: FieldParams;
  readonly rounds: readonly SchnorrRound[];
  readonly allVerified: boolean;
}

// ── Protocol steps ─────────────────────────────────────────────────────

export function generateSchnorrKeys(params: FieldParams): SchnorrKeys {
  const secretKey = randomFieldElement(params.q);
  const publicKey = modPow(params.g, secretKey, params.p);
  return { secretKey, publicKey };
}

export function proverCommit(params: FieldParams): SchnorrCommitment {
  const randomness = randomFieldElement(params.q);
  const commitment = modPow(params.g, randomness, params.p);
  return { randomness, commitment };
}

/** s = (r + e * x) mod q */
export function proverRespond(
  r: bigint,
  e: bigint,
  x: bigint,
  q: bigint
): bigint {
  return modAdd(r, modMul(e, x, q), q);
}

/** Verify: g^s ≡ R * y^e  (mod p) */
export function verifySchnorr(
  params: FieldParams,
  R: bigint,
  e: bigint,
  s: bigint,
  y: bigint
): boolean {
  const lhs = modPow(params.g, s, params.p);
  const rhs = modMul(R, modPow(y, e, params.p), params.p);
  return lhs === rhs;
}

/** Run the full protocol for numRounds, returning step-by-step data. */
export function runProtocol(
  params: FieldParams,
  keys: SchnorrKeys,
  numRounds: number
): SchnorrProtocolResult {
  const rounds: SchnorrRound[] = [];
  for (let i = 0; i < numRounds; i++) {
    const { randomness, commitment } = proverCommit(params);
    const challenge = randomFieldElement(params.q);
    const response = proverRespond(
      randomness,
      challenge,
      keys.secretKey,
      params.q
    );
    const lhs = modPow(params.g, response, params.p);
    const rhs = modMul(
      commitment,
      modPow(keys.publicKey, challenge, params.p),
      params.p
    );
    rounds.push({
      round: i + 1,
      commitment,
      challenge,
      response,
      verified: lhs === rhs,
      lhs,
      rhs,
    });
  }
  return {
    keys,
    params,
    rounds,
    allVerified: rounds.every((r) => r.verified),
  };
}
