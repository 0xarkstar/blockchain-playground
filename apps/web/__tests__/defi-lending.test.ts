import { describe, it, expect } from "vitest";
import {
  calculateUtilizationRate,
  calculateBorrowRate,
  calculateSupplyRate,
  calculateHealthFactor,
  calculateMaxBorrow,
  calculateLiquidationPrice,
} from "../lib/defi/lending";

describe("calculateUtilizationRate", () => {
  it("calculates correct utilization", () => {
    expect(calculateUtilizationRate(500, 1000)).toBe(0.5);
    expect(calculateUtilizationRate(0, 1000)).toBe(0);
    expect(calculateUtilizationRate(1000, 1000)).toBe(1);
  });

  it("returns 0 for zero supply", () => {
    expect(calculateUtilizationRate(100, 0)).toBe(0);
  });
});

describe("calculateBorrowRate", () => {
  it("returns base rate at zero utilization", () => {
    expect(calculateBorrowRate(0, 0.02, 0.1, 0.5, 0.8)).toBe(0.02);
  });

  it("uses slope1 below kink", () => {
    // At 40% utilization, kink=80%: baseRate + (0.4/0.8)*slope1
    const rate = calculateBorrowRate(0.4, 0.02, 0.1, 0.5, 0.8);
    expect(rate).toBeCloseTo(0.02 + 0.5 * 0.1);
  });

  it("uses slope2 above kink", () => {
    // At 90% utilization, kink=80%: baseRate + slope1 + ((0.9-0.8)/(1-0.8))*slope2
    const rate = calculateBorrowRate(0.9, 0.02, 0.1, 0.5, 0.8);
    const expected = 0.02 + 0.1 + (0.1 / 0.2) * 0.5;
    expect(rate).toBeCloseTo(expected);
  });

  it("handles kink >= 1 without division by zero", () => {
    const rate = calculateBorrowRate(0.5, 0.02, 0.1, 0.5, 1);
    expect(isFinite(rate)).toBe(true);
    expect(rate).toBeCloseTo(0.02 + 0.5 * 0.1);
  });

  it("handles kink <= 0 gracefully", () => {
    const rate = calculateBorrowRate(0.5, 0.02, 0.1, 0.5, 0);
    expect(isFinite(rate)).toBe(true);
    expect(rate).toBeCloseTo(0.02 + 0.5 * 0.1);
  });

  it("rate at kink equals base + slope1", () => {
    const rate = calculateBorrowRate(0.8, 0.02, 0.1, 0.5, 0.8);
    expect(rate).toBeCloseTo(0.02 + 0.1);
  });
});

describe("calculateSupplyRate", () => {
  it("calculates supply rate correctly", () => {
    // supplyRate = utilization * borrowRate * (1 - reserveFactor)
    const rate = calculateSupplyRate(0.5, 0.1, 0.1);
    expect(rate).toBeCloseTo(0.5 * 0.1 * 0.9);
  });

  it("returns 0 for zero utilization or borrow rate", () => {
    expect(calculateSupplyRate(0, 0.1, 0.1)).toBe(0);
    expect(calculateSupplyRate(0.5, 0, 0.1)).toBe(0);
  });
});

describe("calculateHealthFactor", () => {
  it("returns Infinity when nothing is borrowed", () => {
    expect(calculateHealthFactor(1000, 0, 0.8)).toBe(Infinity);
  });

  it("calculates health factor correctly", () => {
    // HF = (1000 * 0.8) / 500 = 1.6
    expect(calculateHealthFactor(1000, 500, 0.8)).toBeCloseTo(1.6);
  });

  it("returns < 1 when undercollateralized", () => {
    // HF = (500 * 0.8) / 500 = 0.8
    expect(calculateHealthFactor(500, 500, 0.8)).toBeLessThan(1);
  });
});

describe("calculateMaxBorrow", () => {
  it("calculates max borrow correctly", () => {
    expect(calculateMaxBorrow(1000, 0.75)).toBeCloseTo(750);
  });

  it("returns 0 for invalid inputs", () => {
    expect(calculateMaxBorrow(0, 0.75)).toBe(0);
    expect(calculateMaxBorrow(1000, 0)).toBe(0);
  });
});

describe("calculateLiquidationPrice", () => {
  it("calculates liquidation price correctly", () => {
    // liqPrice = borrowedValue / (collateralAmount * liquidationThreshold)
    // = 400 / (1 * 0.8) = 500
    expect(calculateLiquidationPrice(400, 1, 0.8)).toBeCloseTo(500);
  });

  it("returns 0 for invalid inputs", () => {
    expect(calculateLiquidationPrice(400, 0, 0.8)).toBe(0);
    expect(calculateLiquidationPrice(400, 1, 0)).toBe(0);
  });
});
