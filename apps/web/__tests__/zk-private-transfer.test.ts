import { describe, it, expect } from "vitest";
import {
  createPrivateState,
  mintShieldedCoin,
  privateTransfer,
  detectDoubleSpend,
  getPrivacyAnalysis,
} from "../lib/zk/private-transfer";

describe("Private Transfers", () => {
  describe("createPrivateState", () => {
    it("creates empty state", () => {
      const state = createPrivateState();
      expect(state.commitments).toHaveLength(0);
      expect(state.nullifiers).toHaveLength(0);
      expect(state.notes).toHaveLength(0);
    });
  });

  describe("mintShieldedCoin", () => {
    it("mints a shielded coin", () => {
      const state = createPrivateState();
      const result = mintShieldedCoin(state, 100n, "alice");
      expect(result.success).toBe(true);
      expect(result.note).not.toBeNull();
      expect(result.newState.commitments).toHaveLength(1);
      expect(result.newState.notes).toHaveLength(1);
    });

    it("note has correct value and owner", () => {
      const state = createPrivateState();
      const result = mintShieldedCoin(state, 50n, "bob");
      expect(result.note!.value).toBe(50n);
      expect(result.note!.owner).toBe("bob");
    });

    it("commitment is a hash", () => {
      const state = createPrivateState();
      const result = mintShieldedCoin(state, 100n, "alice");
      expect(result.note!.commitment).toMatch(/^0x/);
      expect(result.note!.nullifier).toMatch(/^0x/);
    });

    it("rejects zero value", () => {
      const state = createPrivateState();
      const result = mintShieldedCoin(state, 0n, "alice");
      expect(result.success).toBe(false);
    });

    it("rejects negative value", () => {
      const state = createPrivateState();
      const result = mintShieldedCoin(state, -5n, "alice");
      expect(result.success).toBe(false);
    });

    it("multiple mints accumulate", () => {
      let state = createPrivateState();
      state = mintShieldedCoin(state, 100n, "alice").newState;
      state = mintShieldedCoin(state, 200n, "bob").newState;
      expect(state.commitments).toHaveLength(2);
      expect(state.notes).toHaveLength(2);
    });
  });

  describe("privateTransfer", () => {
    it("transfers value between parties", () => {
      let state = createPrivateState();
      const mintResult = mintShieldedCoin(state, 100n, "alice", "alice_secret");
      state = mintResult.newState;
      const result = privateTransfer(
        state,
        mintResult.note!,
        "bob",
        60n,
        "bob_secret",
        "alice_secret"
      );
      expect(result.success).toBe(true);
      expect(result.newNotes).toHaveLength(2); // recipient + change
      expect(result.spentNullifier).not.toBeNull();
    });

    it("creates change note when amount < value", () => {
      let state = createPrivateState();
      const mint = mintShieldedCoin(state, 100n, "alice", "as");
      state = mint.newState;
      const result = privateTransfer(state, mint.note!, "bob", 60n, "bs", "as");
      expect(result.newNotes).toHaveLength(2);
      const recipientNote = result.newNotes[0];
      const changeNote = result.newNotes[1];
      expect(recipientNote.value).toBe(60n);
      expect(changeNote.value).toBe(40n);
    });

    it("no change note when amount = value", () => {
      let state = createPrivateState();
      const mint = mintShieldedCoin(state, 50n, "alice", "as");
      state = mint.newState;
      const result = privateTransfer(state, mint.note!, "bob", 50n, "bs", "as");
      expect(result.success).toBe(true);
      expect(result.newNotes).toHaveLength(1);
    });

    it("rejects insufficient value", () => {
      let state = createPrivateState();
      const mint = mintShieldedCoin(state, 50n, "alice", "as");
      state = mint.newState;
      const result = privateTransfer(state, mint.note!, "bob", 100n, "bs", "as");
      expect(result.success).toBe(false);
      expect(result.message).toContain("Insufficient");
    });

    it("rejects unknown commitment", () => {
      const state = createPrivateState();
      const fakeNote = {
        commitment: "0xfake",
        nullifier: "0xfake",
        value: 100n,
        owner: "alice",
        nonce: "abc",
      };
      const result = privateTransfer(state, fakeNote, "bob", 50n);
      expect(result.success).toBe(false);
      expect(result.message).toContain("not found");
    });

    it("rejects zero amount", () => {
      let state = createPrivateState();
      const mint = mintShieldedCoin(state, 50n, "alice", "as");
      state = mint.newState;
      const result = privateTransfer(state, mint.note!, "bob", 0n);
      expect(result.success).toBe(false);
    });

    it("adds nullifier to state after transfer", () => {
      let state = createPrivateState();
      const mint = mintShieldedCoin(state, 100n, "alice", "as");
      state = mint.newState;
      const result = privateTransfer(state, mint.note!, "bob", 50n, "bs", "as");
      expect(result.newState.nullifiers).toContain(mint.note!.nullifier);
    });
  });

  describe("detectDoubleSpend", () => {
    it("detects spent nullifier", () => {
      let state = createPrivateState();
      const mint = mintShieldedCoin(state, 100n, "alice", "as");
      state = mint.newState;
      const result = privateTransfer(state, mint.note!, "bob", 50n, "bs", "as");
      expect(detectDoubleSpend(mint.note!.nullifier, result.newState)).toBe(
        true
      );
    });

    it("returns false for unspent nullifier", () => {
      const state = createPrivateState();
      expect(detectDoubleSpend("0xunknown", state)).toBe(false);
    });
  });

  describe("double-spend prevention", () => {
    it("prevents spending same note twice", () => {
      let state = createPrivateState();
      const mint = mintShieldedCoin(state, 100n, "alice", "as");
      state = mint.newState;
      const first = privateTransfer(state, mint.note!, "bob", 50n, "bs", "as");
      expect(first.success).toBe(true);
      const second = privateTransfer(
        first.newState,
        mint.note!,
        "charlie",
        30n,
        "cs",
        "as"
      );
      expect(second.success).toBe(false);
      expect(second.message).toContain("Double spend");
    });
  });

  describe("getPrivacyAnalysis", () => {
    it("lists public and hidden info", () => {
      const analysis = getPrivacyAnalysis();
      expect(analysis.publicInfo.length).toBeGreaterThan(0);
      expect(analysis.hiddenInfo.length).toBeGreaterThan(0);
      expect(analysis.verifierKnows.length).toBeGreaterThan(0);
      expect(analysis.verifierDoesNotKnow.length).toBeGreaterThan(0);
    });
  });
});
