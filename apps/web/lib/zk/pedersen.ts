/**
 * Pedersen Commitment — information-theoretically hiding commitment.
 *
 * C = g^v * h^r  mod p
 *
 * Homomorphic: commit(v1, r1) * commit(v2, r2) = commit(v1+v2, r1+r2)
 *
 * Uses the Schnorr field (p=23, order-11 subgroup) with g=2, h=9.
 * h is chosen as another generator of the order-11 subgroup, independent
 * of g (i.e., no one knows log_g(h)).
 */

import { modPow, modMul, modAdd, type FieldParams } from "./field";

// ── Types ──────────────────────────────────────────────────────────────

export interface PedersenParams {
  readonly p: bigint;
  readonly g: bigint;
  readonly h: bigint;
  readonly q: bigint; // subgroup order
}

export interface PedersenCommitmentResult {
  readonly commitment: bigint;
  readonly value: bigint;
  readonly randomness: bigint;
  readonly gPart: bigint; // g^v mod p
  readonly hPart: bigint; // h^r mod p
}

export interface HomomorphicDemo {
  readonly c1: PedersenCommitmentResult;
  readonly c2: PedersenCommitmentResult;
  readonly product: bigint; // C1 * C2 mod p
  readonly combined: bigint; // commit(v1+v2, r1+r2)
  readonly matches: boolean;
}

// ── Construction ───────────────────────────────────────────────────────

/**
 * Build Pedersen parameters from a field.
 * h = g^2 mod p gives another generator of the same subgroup.
 * In a real system the relationship between g and h must be unknown;
 * here we choose h = 9 (which is 2^(unknown) in the subgroup) for
 * pedagogical purposes.
 */
export function createPedersenParams(field?: FieldParams): PedersenParams {
  const p = field?.p ?? 23n;
  const q = field?.q ?? 11n;
  return { p, g: 2n, h: 9n, q };
}

/** C = g^v * h^r  mod p */
export function pedersenCommit(
  params: PedersenParams,
  value: bigint,
  randomness: bigint,
): PedersenCommitmentResult {
  const gPart = modPow(params.g, value, params.p);
  const hPart = modPow(params.h, randomness, params.p);
  const commitment = modMul(gPart, hPart, params.p);
  return { commitment, value, randomness, gPart, hPart };
}

/** Recompute and compare. */
export function verifyPedersen(
  params: PedersenParams,
  value: bigint,
  randomness: bigint,
  commitment: bigint,
): boolean {
  const recomputed = pedersenCommit(params, value, randomness);
  return recomputed.commitment === commitment;
}

/** Show that C1 * C2 = commit(v1 + v2, r1 + r2). */
export function demonstrateHomomorphic(
  params: PedersenParams,
  v1: bigint,
  r1: bigint,
  v2: bigint,
  r2: bigint,
): HomomorphicDemo {
  const c1 = pedersenCommit(params, v1, r1);
  const c2 = pedersenCommit(params, v2, r2);
  const product = modMul(c1.commitment, c2.commitment, params.p);
  const combinedValue = modAdd(v1, v2, params.q);
  const combinedRand = modAdd(r1, r2, params.q);
  const combined = pedersenCommit(
    params,
    combinedValue,
    combinedRand,
  ).commitment;
  return { c1, c2, product, combined, matches: product === combined };
}
