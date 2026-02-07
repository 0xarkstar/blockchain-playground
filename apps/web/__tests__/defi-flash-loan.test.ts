import { describe, it, expect } from "vitest";
import {
  simulateFlashLoan,
  calculateArbitrageProfit,
} from "../lib/defi/flash-loan";

describe("simulateFlashLoan", () => {
  it("succeeds when profit exceeds fee", () => {
    const result = simulateFlashLoan(10000, 0.0009, 50);
    expect(result.success).toBe(true);
    expect(result.repayAmount).toBeCloseTo(10009);
    expect(result.profit).toBeCloseTo(41);
  });

  it("fails when fee exceeds profit", () => {
    const result = simulateFlashLoan(10000, 0.01, 50);
    expect(result.success).toBe(false);
    expect(result.profit).toBeLessThan(0);
  });

  it("returns failure for zero borrow", () => {
    const result = simulateFlashLoan(0, 0.01, 50);
    expect(result.success).toBe(false);
  });

  it("calculates repay amount as borrow + fee", () => {
    const result = simulateFlashLoan(1000, 0.001, 100);
    expect(result.repayAmount).toBeCloseTo(1001);
  });
});

describe("calculateArbitrageProfit", () => {
  it("calculates profit from price discrepancy", () => {
    // Buy at 100, sell at 110, 1000 USD
    const profit = calculateArbitrageProfit(100, 110, 1000, 5);
    // tokens = 1000/100 = 10, revenue = 10*110 = 1100, profit = 1100 - 1000 - 5 = 95
    expect(profit).toBeCloseTo(95);
  });

  it("returns negative when fees exceed spread", () => {
    const profit = calculateArbitrageProfit(100, 100.01, 1000, 10);
    expect(profit).toBeLessThan(0);
  });

  it("returns 0 for invalid inputs", () => {
    expect(calculateArbitrageProfit(0, 110, 1000, 5)).toBe(0);
    expect(calculateArbitrageProfit(100, 0, 1000, 5)).toBe(0);
    expect(calculateArbitrageProfit(100, 110, 0, 5)).toBe(0);
  });

  it("buys at lower price regardless of order", () => {
    const profitAB = calculateArbitrageProfit(100, 110, 1000, 0);
    const profitBA = calculateArbitrageProfit(110, 100, 1000, 0);
    expect(profitAB).toBeCloseTo(profitBA);
  });
});
