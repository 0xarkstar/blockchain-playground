/**
 * Range Proof — prove a committed value lies in [0, 2^n) without revealing it.
 *
 * Strategy: decompose value into bits, commit to each bit individually,
 * then prove each bit is 0 or 1 and that the product of bit-commitments
 * reconstructs the original commitment.
 *
 * This is a simplified pedagogical version; real range proofs (Bulletproofs)
 * use inner-product arguments and are far more compact.
 */

import { modPow, modMul, modAdd, randomFieldElement } from "./field";
import {
  createPedersenParams,
  pedersenCommit,
  type PedersenParams,
  type PedersenCommitmentResult,
} from "./pedersen";

// ── Types ──────────────────────────────────────────────────────────────

export interface BitCommitment {
  readonly bit: number;
  readonly commitment: PedersenCommitmentResult;
  readonly bitPosition: number;
}

export interface RangeProof {
  readonly value: bigint;
  readonly numBits: number;
  readonly totalCommitment: bigint;
  readonly bitCommitments: readonly BitCommitment[];
  readonly reconstructed: bigint;
  readonly valid: boolean;
}

// ── Core ───────────────────────────────────────────────────────────────

/** Decompose value into an array of bits (LSB first). */
export function decomposeToBits(value: bigint, numBits: number): number[] {
  const bits: number[] = [];
  let v = value;
  for (let i = 0; i < numBits; i++) {
    bits.push(Number(v & 1n));
    v >>= 1n;
  }
  return bits;
}

/**
 * Construct a range proof: commit to each bit independently, then verify
 * that the product of bit-commitments (with appropriate powers of 2)
 * equals the commitment to the original value.
 */
export function constructRangeProof(
  params: PedersenParams | null,
  value: bigint,
  numBits: number
): RangeProof {
  const pp = params ?? createPedersenParams();
  const bits = decomposeToBits(value, numBits);

  // Check value fits in numBits
  if (value < 0n || value >= 1n << BigInt(numBits)) {
    return {
      value,
      numBits,
      totalCommitment: 0n,
      bitCommitments: [],
      reconstructed: 0n,
      valid: false,
    };
  }

  const bitCommitments: BitCommitment[] = [];
  let totalRandomness = 0n;

  for (let i = 0; i < numBits; i++) {
    const ri = randomFieldElement(pp.q);
    const ci = pedersenCommit(pp, BigInt(bits[i]), ri);
    bitCommitments.push({ bit: bits[i], commitment: ci, bitPosition: i });
    // accumulate: total_r += ri * 2^i  (mod q)
    const weight = modPow(2n, BigInt(i), pp.q);
    totalRandomness = modAdd(totalRandomness, modMul(ri, weight, pp.q), pp.q);
  }

  // Reconstruct total commitment from bit commitments: ∏ Ci^(2^i)
  let reconstructed = 1n;
  for (let i = 0; i < numBits; i++) {
    const power = modPow(2n, BigInt(i), pp.q);
    const term = modPow(
      bitCommitments[i].commitment.commitment,
      power,
      pp.p
    );
    reconstructed = modMul(reconstructed, term, pp.p);
  }

  // Directly compute commitment to the full value with accumulated randomness
  const totalCommitment = pedersenCommit(pp, value, totalRandomness).commitment;

  return {
    value,
    numBits,
    totalCommitment,
    bitCommitments,
    reconstructed,
    valid: reconstructed === totalCommitment,
  };
}

/** Verify a range proof (check reconstructed matches total). */
export function verifyRangeProof(proof: RangeProof): boolean {
  if (proof.bitCommitments.length === 0) return false;
  // All bits must be 0 or 1
  if (proof.bitCommitments.some((bc) => bc.bit !== 0 && bc.bit !== 1)) {
    return false;
  }
  return proof.valid;
}
