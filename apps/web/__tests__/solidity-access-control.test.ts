import { describe, it, expect } from "vitest";
import {
  createInitialState,
  hasRole,
  grantRole,
  revokeRole,
  renounceRole,
  transferOwnership,
  checkFunctionAccess,
  DEFAULT_ADMIN_ROLE,
  MINTER_ROLE,
} from "../lib/solidity/access-control";

const OWNER = "0xowner";
const ALICE = "0xalice";
const BOB = "0xbob";

describe("createInitialState", () => {
  it("sets owner and grants DEFAULT_ADMIN_ROLE", () => {
    const state = createInitialState(OWNER);
    expect(state.owner).toBe(OWNER);
    expect(hasRole(state, DEFAULT_ADMIN_ROLE, OWNER)).toBe(true);
  });
});

describe("hasRole", () => {
  it("returns false for non-existent role", () => {
    const state = createInitialState(OWNER);
    expect(hasRole(state, MINTER_ROLE, ALICE)).toBe(false);
  });

  it("returns false for wrong account", () => {
    const state = createInitialState(OWNER);
    expect(hasRole(state, DEFAULT_ADMIN_ROLE, ALICE)).toBe(false);
  });
});

describe("grantRole", () => {
  it("grants role when caller is admin", () => {
    const state = createInitialState(OWNER);
    const result = grantRole(state, MINTER_ROLE, ALICE, OWNER);
    expect(result.success).toBe(true);
    expect(hasRole(result.state, MINTER_ROLE, ALICE)).toBe(true);
  });

  it("fails when caller is not admin", () => {
    const state = createInitialState(OWNER);
    const result = grantRole(state, MINTER_ROLE, ALICE, BOB);
    expect(result.success).toBe(false);
    expect(result.revertReason).toContain("admin");
  });

  it("succeeds but is noop if account already has role", () => {
    const state = createInitialState(OWNER);
    const r1 = grantRole(state, MINTER_ROLE, ALICE, OWNER);
    const r2 = grantRole(r1.state, MINTER_ROLE, ALICE, OWNER);
    expect(r2.success).toBe(true);
    expect(r2.message).toContain("already has");
  });

  it("does not mutate original state", () => {
    const state = createInitialState(OWNER);
    const result = grantRole(state, MINTER_ROLE, ALICE, OWNER);
    expect(hasRole(state, MINTER_ROLE, ALICE)).toBe(false);
    expect(hasRole(result.state, MINTER_ROLE, ALICE)).toBe(true);
  });
});

describe("revokeRole", () => {
  it("revokes role when caller is admin", () => {
    const state = createInitialState(OWNER);
    const granted = grantRole(state, MINTER_ROLE, ALICE, OWNER);
    const result = revokeRole(granted.state, MINTER_ROLE, ALICE, OWNER);
    expect(result.success).toBe(true);
    expect(hasRole(result.state, MINTER_ROLE, ALICE)).toBe(false);
  });

  it("fails when caller is not admin", () => {
    const state = createInitialState(OWNER);
    const granted = grantRole(state, MINTER_ROLE, ALICE, OWNER);
    const result = revokeRole(granted.state, MINTER_ROLE, ALICE, BOB);
    expect(result.success).toBe(false);
  });

  it("is noop if account does not have role", () => {
    const state = createInitialState(OWNER);
    const result = revokeRole(state, MINTER_ROLE, ALICE, OWNER);
    expect(result.success).toBe(true);
    expect(result.message).toContain("does not have");
  });
});

describe("renounceRole", () => {
  it("allows account to renounce its own role", () => {
    const state = createInitialState(OWNER);
    const granted = grantRole(state, MINTER_ROLE, ALICE, OWNER);
    const result = renounceRole(granted.state, MINTER_ROLE, ALICE);
    expect(result.success).toBe(true);
    expect(hasRole(result.state, MINTER_ROLE, ALICE)).toBe(false);
  });

  it("fails if account does not have role", () => {
    const state = createInitialState(OWNER);
    const result = renounceRole(state, MINTER_ROLE, ALICE);
    expect(result.success).toBe(false);
  });
});

describe("transferOwnership", () => {
  it("transfers ownership when called by owner", () => {
    const state = createInitialState(OWNER);
    const result = transferOwnership(state, ALICE, OWNER);
    expect(result.success).toBe(true);
    expect(result.state.owner).toBe(ALICE);
    expect(hasRole(result.state, DEFAULT_ADMIN_ROLE, ALICE)).toBe(true);
  });

  it("fails when called by non-owner", () => {
    const state = createInitialState(OWNER);
    const result = transferOwnership(state, ALICE, BOB);
    expect(result.success).toBe(false);
    expect(result.revertReason).toContain("not the owner");
  });
});

describe("checkFunctionAccess", () => {
  it("allows owner for onlyOwner functions", () => {
    const state = createInitialState(OWNER);
    const check = checkFunctionAccess(state, OWNER, "onlyOwner");
    expect(check.allowed).toBe(true);
  });

  it("denies non-owner for onlyOwner functions", () => {
    const state = createInitialState(OWNER);
    const check = checkFunctionAccess(state, ALICE, "onlyOwner");
    expect(check.allowed).toBe(false);
  });

  it("allows account with correct role", () => {
    const state = createInitialState(OWNER);
    const granted = grantRole(state, MINTER_ROLE, ALICE, OWNER);
    const check = checkFunctionAccess(granted.state, ALICE, MINTER_ROLE);
    expect(check.allowed).toBe(true);
  });

  it("denies account without required role", () => {
    const state = createInitialState(OWNER);
    const check = checkFunctionAccess(state, ALICE, MINTER_ROLE);
    expect(check.allowed).toBe(false);
  });
});
