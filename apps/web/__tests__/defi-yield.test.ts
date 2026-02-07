import { describe, it, expect } from "vitest";
import {
  aprToApy,
  calculateCompoundedValue,
  calculateStakingRewards,
  calculatePoolShare,
} from "../lib/defi/yield";

describe("aprToApy", () => {
  it("returns higher value than APR for multiple compounds", () => {
    const apy = aprToApy(0.1, 12);
    expect(apy).toBeGreaterThan(0.1);
  });

  it("daily compounding gives higher APY than monthly", () => {
    const monthly = aprToApy(0.1, 12);
    const daily = aprToApy(0.1, 365);
    expect(daily).toBeGreaterThan(monthly);
  });

  it("returns APR for zero or negative compounds", () => {
    expect(aprToApy(0.1, 0)).toBe(0.1);
  });

  it("single compound equals APR", () => {
    expect(aprToApy(0.1, 1)).toBeCloseTo(0.1);
  });

  it("computes known value: 10% APR daily = ~10.52% APY", () => {
    const apy = aprToApy(0.1, 365);
    expect(apy).toBeCloseTo(0.10516, 4);
  });
});

describe("calculateCompoundedValue", () => {
  it("computes simple interest for zero compounds", () => {
    const value = calculateCompoundedValue(1000, 0.1, 0, 1);
    expect(value).toBeCloseTo(1100);
  });

  it("computes compound interest", () => {
    // 1000 * (1 + 0.1/12)^(12*1) ≈ 1104.71
    const value = calculateCompoundedValue(1000, 0.1, 12, 1);
    expect(value).toBeCloseTo(1104.71, 1);
  });

  it("returns principal for zero years", () => {
    expect(calculateCompoundedValue(1000, 0.1, 12, 0)).toBe(1000);
  });

  it("returns principal for zero or negative principal", () => {
    expect(calculateCompoundedValue(0, 0.1, 12, 1)).toBe(0);
  });
});

describe("calculateStakingRewards", () => {
  it("calculates basic rewards", () => {
    // 1000 staked at 10% rate for 1 period
    expect(calculateStakingRewards(1000, 0.1, 1)).toBeCloseTo(100);
  });

  it("scales with duration", () => {
    expect(calculateStakingRewards(1000, 0.1, 2)).toBeCloseTo(200);
  });

  it("returns 0 for invalid inputs", () => {
    expect(calculateStakingRewards(0, 0.1, 1)).toBe(0);
    expect(calculateStakingRewards(1000, 0, 1)).toBe(0);
    expect(calculateStakingRewards(1000, 0.1, 0)).toBe(0);
  });
});

describe("calculatePoolShare", () => {
  it("calculates correct share", () => {
    expect(calculatePoolShare(100, 1000)).toBeCloseTo(0.1);
  });

  it("returns 0 for zero total stake", () => {
    expect(calculatePoolShare(100, 0)).toBe(0);
  });

  it("returns 1 for sole staker", () => {
    expect(calculatePoolShare(500, 500)).toBeCloseTo(1);
  });
});
