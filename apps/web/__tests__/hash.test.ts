import { describe, it, expect } from "vitest";
import {
  hash,
  toBinaryString,
  computeAvalancheEffect,
} from "../lib/blockchain/hash";

describe("hash", () => {
  it("produces consistent SHA-256 output", () => {
    const result = hash("hello", "sha256");
    expect(result).toMatch(/^0x[a-f0-9]{64}$/);
    expect(hash("hello", "sha256")).toBe(result);
  });

  it("produces consistent Keccak-256 output", () => {
    const result = hash("hello", "keccak256");
    expect(result).toMatch(/^0x[a-f0-9]{64}$/);
    // Different from SHA-256
    expect(result).not.toBe(hash("hello", "sha256"));
  });

  it("produces consistent BLAKE2b output", () => {
    const result = hash("hello", "blake2b");
    expect(result).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it("produces different hashes for different inputs", () => {
    expect(hash("hello", "sha256")).not.toBe(hash("hello!", "sha256"));
  });
});

describe("toBinaryString", () => {
  it("converts hex to binary", () => {
    expect(toBinaryString("0xff")).toBe("11111111");
    expect(toBinaryString("0x00")).toBe("00000000");
    expect(toBinaryString("0x0a")).toBe("00001010");
  });
});

describe("computeAvalancheEffect", () => {
  it("shows ~50% bit difference for small input changes", () => {
    const result = computeAvalancheEffect("hello", "hallo", "sha256");
    expect(result.diffPercent).toBeGreaterThan(30);
    expect(result.diffPercent).toBeLessThan(70);
    expect(result.hash1).not.toBe(result.hash2);
    expect(result.diffBits.length).toBeGreaterThan(0);
  });

  it("shows 0% difference for identical inputs", () => {
    const result = computeAvalancheEffect("hello", "hello", "sha256");
    expect(result.diffPercent).toBe(0);
    expect(result.diffBits.length).toBe(0);
  });
});
