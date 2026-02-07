import { describe, it, expect } from "vitest";
import {
  createMemberGroup,
  proveZKMembership,
  verifyZKMembership,
  compareProofs,
} from "../lib/zk/set-membership";

describe("ZK Set Membership", () => {
  const members = ["alice", "bob", "charlie", "dave"];

  describe("createMemberGroup", () => {
    it("creates group with commitments", () => {
      const group = createMemberGroup(members);
      expect(group.members).toHaveLength(4);
      expect(group.root).toMatch(/^0x/);
    });

    it("each member has unique commitment", () => {
      const group = createMemberGroup(members);
      const commitments = group.members.map((m) => m.commitment);
      expect(new Set(commitments).size).toBe(4);
    });

    it("produces consistent root", () => {
      const secrets = ["s0", "s1", "s2", "s3"];
      const g1 = createMemberGroup(members, secrets);
      const g2 = createMemberGroup(members, secrets);
      expect(g1.root).toBe(g2.root);
    });

    it("builds merkle tree", () => {
      const group = createMemberGroup(members);
      expect(group.tree.length).toBeGreaterThan(0);
    });
  });

  describe("proveZKMembership", () => {
    it("proves membership for valid member", () => {
      const secrets = ["s0", "s1", "s2", "s3"];
      const group = createMemberGroup(members, secrets);
      const proof = proveZKMembership(group, 0, "s0");
      expect(proof.verified).toBe(true);
      expect(proof.root).toBe(group.root);
    });

    it("proves for different indices", () => {
      const secrets = ["s0", "s1", "s2", "s3"];
      const group = createMemberGroup(members, secrets);
      for (let i = 0; i < members.length; i++) {
        const proof = proveZKMembership(group, i, `s${i}`);
        expect(proof.verified).toBe(true);
      }
    });

    it("includes merkle path", () => {
      const group = createMemberGroup(members);
      const proof = proveZKMembership(group, 1, "secret_1");
      expect(proof.merklePath.length).toBeGreaterThan(0);
      for (const node of proof.merklePath) {
        expect(["left", "right"]).toContain(node.position);
        expect(node.hash).toMatch(/^0x/);
      }
    });
  });

  describe("verifyZKMembership", () => {
    it("verifies valid proof against root", () => {
      const group = createMemberGroup(members);
      const proof = proveZKMembership(group, 2, "secret_2");
      expect(verifyZKMembership(group.root, proof)).toBe(true);
    });

    it("rejects proof against wrong root", () => {
      const group = createMemberGroup(members);
      const proof = proveZKMembership(group, 0, "secret_0");
      expect(verifyZKMembership("0xfakeroot", proof)).toBe(false);
    });
  });

  describe("compareProofs", () => {
    it("describes transparent vs ZK info leakage", () => {
      const comparison = compareProofs();
      expect(comparison.transparent.revealed).toContain("identity");
      expect(comparison.zk.info).toContain("not who");
    });
  });
});
