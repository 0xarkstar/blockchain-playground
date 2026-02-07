import { describe, it, expect } from "vitest";
import {
  getProxyInfo,
  createProxyState,
  simulateUpgrade,
  visualizeDelegatecall,
  getEIP1967Slots,
} from "../lib/solidity/proxy";

const ADMIN = "0xadmin";
const USER = "0xuser";
const IMPL_V1 = "0ximplv1";
const IMPL_V2 = "0ximplv2";

describe("getProxyInfo", () => {
  it("returns info for transparent proxy", () => {
    const info = getProxyInfo("transparent");
    expect(info.name).toContain("Transparent");
    expect(info.pros.length).toBeGreaterThan(0);
    expect(info.cons.length).toBeGreaterThan(0);
  });

  it("returns info for UUPS proxy", () => {
    const info = getProxyInfo("uups");
    expect(info.name).toContain("UUPS");
  });

  it("returns info for diamond proxy", () => {
    const info = getProxyInfo("diamond");
    expect(info.name).toContain("Diamond");
  });

  it("includes EIP-1967 implementation slot", () => {
    const info = getProxyInfo("transparent");
    expect(info.eipSlots.implementation).toMatch(/^0x[0-9a-f]{64}$/);
  });
});

describe("createProxyState", () => {
  it("creates state with zero implementation", () => {
    const state = createProxyState("transparent", ADMIN);
    expect(state.type).toBe("transparent");
    expect(state.admin).toBe(ADMIN);
    expect(state.implementation).toBe(
      "0x0000000000000000000000000000000000000000",
    );
    expect(state.previousImplementations).toHaveLength(0);
  });
});

describe("simulateUpgrade", () => {
  it("upgrades transparent proxy when called by admin", () => {
    const state = createProxyState("transparent", ADMIN);
    const result = simulateUpgrade(state, IMPL_V1, ADMIN);
    expect(result.success).toBe(true);
    expect(result.state.implementation).toBe(IMPL_V1);
  });

  it("fails transparent proxy upgrade from non-admin", () => {
    const state = createProxyState("transparent", ADMIN);
    const result = simulateUpgrade(state, IMPL_V1, USER);
    expect(result.success).toBe(false);
    expect(result.revertReason).toContain("admin");
  });

  it("tracks previous implementations", () => {
    const state = createProxyState("transparent", ADMIN);
    const r1 = simulateUpgrade(state, IMPL_V1, ADMIN);
    const r2 = simulateUpgrade(r1.state, IMPL_V2, ADMIN);
    expect(r2.state.previousImplementations).toContain(IMPL_V1);
    expect(r2.state.implementation).toBe(IMPL_V2);
  });

  it("upgrades UUPS proxy when called by admin", () => {
    const state = createProxyState("uups", ADMIN);
    const result = simulateUpgrade(state, IMPL_V1, ADMIN);
    expect(result.success).toBe(true);
  });

  it("fails UUPS upgrade from non-admin", () => {
    const state = createProxyState("uups", ADMIN);
    const result = simulateUpgrade(state, IMPL_V1, USER);
    expect(result.success).toBe(false);
  });

  it("upgrades diamond proxy when called by admin", () => {
    const state = createProxyState("diamond", ADMIN);
    const result = simulateUpgrade(state, IMPL_V1, ADMIN);
    expect(result.success).toBe(true);
  });

  it("does not mutate original state", () => {
    const state = createProxyState("transparent", ADMIN);
    const result = simulateUpgrade(state, IMPL_V1, ADMIN);
    expect(state.implementation).toBe(
      "0x0000000000000000000000000000000000000000",
    );
    expect(result.state.implementation).toBe(IMPL_V1);
  });
});

describe("visualizeDelegatecall", () => {
  it("returns 4 steps", () => {
    const viz = visualizeDelegatecall("0xuser", "0xproxy", "0ximpl");
    expect(viz.steps).toHaveLength(4);
  });

  it("preserves msg.sender as original caller", () => {
    const viz = visualizeDelegatecall("0xuser", "0xproxy", "0ximpl");
    expect(viz.msgSender).toBe("0xuser");
  });

  it("storage belongs to proxy", () => {
    const viz = visualizeDelegatecall("0xuser", "0xproxy", "0ximpl");
    expect(viz.storageOwner).toBe("0xproxy");
  });

  it("code comes from implementation", () => {
    const viz = visualizeDelegatecall("0xuser", "0xproxy", "0ximpl");
    expect(viz.codeSource).toBe("0ximpl");
  });
});

describe("getEIP1967Slots", () => {
  it("returns implementation, admin, and beacon slots", () => {
    const slots = getEIP1967Slots();
    expect(slots.implementation).toMatch(/^0x[0-9a-f]{64}$/);
    expect(slots.admin).toMatch(/^0x[0-9a-f]{64}$/);
    expect(slots.beacon).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("all slots are different", () => {
    const slots = getEIP1967Slots();
    expect(slots.implementation).not.toBe(slots.admin);
    expect(slots.implementation).not.toBe(slots.beacon);
    expect(slots.admin).not.toBe(slots.beacon);
  });
});
