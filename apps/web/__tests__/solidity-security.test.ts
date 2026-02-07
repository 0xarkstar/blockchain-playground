import { describe, it, expect } from "vitest";
import {
  simulateReentrancyAttack,
  simulateWithReentrancyGuard,
  simulateChecksEffectsInteractions,
} from "../lib/solidity/security";

describe("simulateReentrancyAttack", () => {
  it("returns empty result for invalid inputs", () => {
    expect(simulateReentrancyAttack(100, 0, 3).frames).toHaveLength(0);
    expect(simulateReentrancyAttack(100, -1, 3).frames).toHaveLength(0);
    expect(simulateReentrancyAttack(-1, 10, 3).frames).toHaveLength(0);
    expect(simulateReentrancyAttack(100, 10, 0).frames).toHaveLength(0);
  });

  it("attacker profits from reentrancy", () => {
    const result = simulateReentrancyAttack(100, 10, 5);
    expect(result.attackSuccessful).toBe(true);
    expect(result.attackerProfit).toBeGreaterThan(0);
    expect(result.finalBalances.attacker).toBeGreaterThan(result.initialBalances.attacker);
  });

  it("drains victim contract", () => {
    const result = simulateReentrancyAttack(50, 10, 10);
    expect(result.finalBalances.victim).toBeLessThan(50 + 10);
  });

  it("caps depth at 10", () => {
    const result = simulateReentrancyAttack(1000, 1, 100);
    expect(result.totalReentrancyDepth).toBeLessThanOrEqual(10);
  });

  it("generates call frames", () => {
    const result = simulateReentrancyAttack(100, 10, 3);
    expect(result.frames.length).toBeGreaterThan(0);
    expect(result.frames[0]!.functionName).toBe("deposit");
  });

  it("stops when victim balance is insufficient", () => {
    const result = simulateReentrancyAttack(5, 10, 10);
    // Victim has 15 total, withdraw 10 per iteration → only 1 successful
    expect(result.totalReentrancyDepth).toBeLessThanOrEqual(2);
  });
});

describe("simulateWithReentrancyGuard", () => {
  it("returns empty for invalid inputs", () => {
    expect(simulateWithReentrancyGuard(100, 0).frames).toHaveLength(0);
    expect(simulateWithReentrancyGuard(-1, 10).frames).toHaveLength(0);
  });

  it("blocks reentrancy attack", () => {
    const result = simulateWithReentrancyGuard(100, 10);
    expect(result.attackSuccessful).toBe(false);
    expect(result.attackerProfit).toBe(0);
  });

  it("produces reverted frame for re-entry attempt", () => {
    const result = simulateWithReentrancyGuard(100, 10);
    const revertedFrame = result.frames.find((f) => f.status === "reverted");
    expect(revertedFrame).toBeDefined();
    expect(revertedFrame!.description).toContain("ReentrancyGuard");
  });

  it("attacker only gets their deposit back", () => {
    const result = simulateWithReentrancyGuard(100, 10);
    expect(result.finalBalances.attacker).toBe(10);
  });
});

describe("simulateChecksEffectsInteractions", () => {
  it("returns empty for invalid inputs", () => {
    expect(simulateChecksEffectsInteractions(100, 0).frames).toHaveLength(0);
    expect(simulateChecksEffectsInteractions(-1, 10).frames).toHaveLength(0);
  });

  it("blocks reentrancy via CEI pattern", () => {
    const result = simulateChecksEffectsInteractions(100, 10);
    expect(result.attackSuccessful).toBe(false);
    expect(result.attackerProfit).toBe(0);
  });

  it("revert reason mentions balance", () => {
    const result = simulateChecksEffectsInteractions(100, 10);
    const revertedFrame = result.frames.find((f) => f.status === "reverted");
    expect(revertedFrame).toBeDefined();
    expect(revertedFrame!.description).toContain("Balance already 0");
  });
});
