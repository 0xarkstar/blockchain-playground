import { sha256 } from "@noble/hashes/sha256";
import { keccak_256 } from "@noble/hashes/sha3";
import { blake2b } from "@noble/hashes/blake2b";
import { bytesToHex } from "@blockchain-playground/utils";

export type HashAlgorithm = "sha256" | "keccak256" | "blake2b";

const hashFunctions: Record<HashAlgorithm, (data: Uint8Array) => Uint8Array> = {
  sha256: (data) => sha256(data),
  keccak256: (data) => keccak_256(data),
  blake2b: (data) => blake2b(data, { dkLen: 32 }),
};

export function hash(data: string | Uint8Array, algorithm: HashAlgorithm): string {
  const input = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const result = hashFunctions[algorithm](input);
  return bytesToHex(result);
}

export function hashBytes(data: string | Uint8Array, algorithm: HashAlgorithm): Uint8Array {
  const input = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return hashFunctions[algorithm](input);
}

export function toBinaryString(hex: string): string {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return clean
    .split("")
    .map((c) => parseInt(c, 16).toString(2).padStart(4, "0"))
    .join("");
}

export function computeAvalancheEffect(
  input1: string,
  input2: string,
  algorithm: HashAlgorithm
): { hash1: string; hash2: string; binary1: string; binary2: string; diffBits: number[]; diffPercent: number } {
  const hash1 = hash(input1, algorithm);
  const hash2 = hash(input2, algorithm);
  const binary1 = toBinaryString(hash1);
  const binary2 = toBinaryString(hash2);

  const diffBits: number[] = [];
  for (let i = 0; i < binary1.length; i++) {
    if (binary1[i] !== binary2[i]) {
      diffBits.push(i);
    }
  }

  const diffPercent = (diffBits.length / binary1.length) * 100;

  return { hash1, hash2, binary1, binary2, diffBits, diffPercent };
}
