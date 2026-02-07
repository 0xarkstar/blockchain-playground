import { describe, it, expect } from "vitest";
import {
  createCommitment,
  verifyCommitment,
  generateNonce,
  hashToHex,
} from "../lib/zk/commitment";

describe("Hash Commitment", () => {
  describe("hashToHex", () => {
    it("produces consistent SHA-256 hash", () => {
      const h1 = hashToHex("hello", "sha256");
      const h2 = hashToHex("hello", "sha256");
      expect(h1).toBe(h2);
      expect(h1).toMatch(/^0x[0-9a-f]{64}$/);
    });
    it("produces consistent Keccak-256 hash", () => {
      const h1 = hashToHex("hello", "keccak256");
      const h2 = hashToHex("hello", "keccak256");
      expect(h1).toBe(h2);
      expect(h1).toMatch(/^0x[0-9a-f]{64}$/);
    });
    it("SHA-256 and Keccak produce different hashes", () => {
      expect(hashToHex("test", "sha256")).not.toBe(
        hashToHex("test", "keccak256")
      );
    });
    it("different inputs produce different hashes", () => {
      expect(hashToHex("a")).not.toBe(hashToHex("b"));
    });
  });

  describe("generateNonce", () => {
    it("returns a hex string", () => {
      const nonce = generateNonce();
      expect(nonce).toMatch(/^[0-9a-f]{32}$/);
    });
    it("generates different nonces", () => {
      const n1 = generateNonce();
      const n2 = generateNonce();
      expect(n1).not.toBe(n2);
    });
  });

  describe("createCommitment", () => {
    it("creates commitment with default SHA-256", () => {
      const c = createCommitment("secret", "nonce123");
      expect(c.commitHash).toMatch(/^0x/);
      expect(c.scheme).toBe("sha256");
    });
    it("creates commitment with Keccak", () => {
      const c = createCommitment("secret", "nonce123", "keccak256");
      expect(c.scheme).toBe("keccak256");
    });
    it("same inputs produce same commitment", () => {
      const c1 = createCommitment("s", "n");
      const c2 = createCommitment("s", "n");
      expect(c1.commitHash).toBe(c2.commitHash);
    });
  });

  describe("verifyCommitment", () => {
    it("verifies valid commitment", () => {
      const c = createCommitment("my_secret", "my_nonce");
      const v = verifyCommitment("my_secret", "my_nonce", c.commitHash);
      expect(v.valid).toBe(true);
      expect(v.message).toContain("verified");
    });
    it("rejects wrong secret", () => {
      const c = createCommitment("real", "nonce");
      const v = verifyCommitment("fake", "nonce", c.commitHash);
      expect(v.valid).toBe(false);
      expect(v.message).toContain("INVALID");
    });
    it("rejects wrong nonce", () => {
      const c = createCommitment("secret", "real_nonce");
      const v = verifyCommitment("secret", "wrong_nonce", c.commitHash);
      expect(v.valid).toBe(false);
    });
  });
});
