/**
 * Hash Commitment — commit / reveal scheme using SHA-256 or Keccak-256.
 *
 * commit(secret, nonce) → hash(secret || nonce)
 * reveal(secret, nonce) → recompute hash and compare
 */

import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { keccak256 as viemKeccak, toHex, toBytes } from "viem";

// ── Types ──────────────────────────────────────────────────────────────

export type HashScheme = "sha256" | "keccak256";

export interface Commitment {
  readonly commitHash: string;
  readonly scheme: HashScheme;
}

export interface CommitmentVerification {
  readonly valid: boolean;
  readonly recomputed: string;
  readonly original: string;
  readonly message: string;
}

// ── Hashing ────────────────────────────────────────────────────────────

export function hashToHex(data: string, scheme: HashScheme = "sha256"): string {
  if (scheme === "keccak256") {
    return viemKeccak(toHex(toBytes(data)));
  }
  return "0x" + bytesToHex(sha256(new TextEncoder().encode(data)));
}

// ── Commitment API ─────────────────────────────────────────────────────

export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(bytes);
}

export function createCommitment(
  secret: string,
  nonce: string,
  scheme: HashScheme = "sha256"
): Commitment {
  const payload = `${secret}:${nonce}`;
  return { commitHash: hashToHex(payload, scheme), scheme };
}

export function verifyCommitment(
  secret: string,
  nonce: string,
  expected: string,
  scheme: HashScheme = "sha256"
): CommitmentVerification {
  const recomputed = hashToHex(`${secret}:${nonce}`, scheme);
  const valid = recomputed === expected;
  return {
    valid,
    recomputed,
    original: expected,
    message: valid
      ? "Commitment verified — hash matches"
      : "Commitment INVALID — hash mismatch",
  };
}
