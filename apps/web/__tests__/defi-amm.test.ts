import { describe, it, expect } from "vitest";
import {
  calculateSwapOutput,
  calculatePriceImpact,
  calculateSpotPrice,
  calculateLPTokens,
  calculateRemoveLiquidity,
  calculateImpermanentLoss,
} from "../lib/defi/amm";

describe("calculateSwapOutput", () => {
  it("calculates correct output for a basic swap", () => {
    const result = calculateSwapOutput(1000, 1000, 100, 0.003);
    expect(result.amountOut).toBeGreaterThan(0);
    expect(result.amountOut).toBeLessThan(100); // price impact
    expect(result.fee).toBeCloseTo(0.3);
    expect(result.priceImpact).toBeGreaterThan(0);
  });

  it("returns zero for invalid inputs", () => {
    expect(calculateSwapOutput(0, 1000, 100).amountOut).toBe(0);
    expect(calculateSwapOutput(1000, 0, 100).amountOut).toBe(0);
    expect(calculateSwapOutput(1000, 1000, 0).amountOut).toBe(0);
    expect(calculateSwapOutput(1000, 1000, 100, -0.1).amountOut).toBe(0);
    expect(calculateSwapOutput(1000, 1000, 100, 1).amountOut).toBe(0);
  });

  it("larger swaps have higher price impact", () => {
    const small = calculateSwapOutput(10000, 10000, 10, 0.003);
    const large = calculateSwapOutput(10000, 10000, 5000, 0.003);
    expect(large.priceImpact).toBeGreaterThan(small.priceImpact);
  });

  it("higher fee reduces output", () => {
    const lowFee = calculateSwapOutput(1000, 1000, 100, 0.001);
    const highFee = calculateSwapOutput(1000, 1000, 100, 0.01);
    expect(lowFee.amountOut).toBeGreaterThan(highFee.amountOut);
  });

  it("preserves constant product invariant", () => {
    const reserveIn = 1000;
    const reserveOut = 2000;
    const amountIn = 100;
    const result = calculateSwapOutput(reserveIn, reserveOut, amountIn, 0);
    const kBefore = reserveIn * reserveOut;
    const kAfter = (reserveIn + amountIn) * (reserveOut - result.amountOut);
    expect(kAfter).toBeCloseTo(kBefore, 5);
  });
});

describe("calculatePriceImpact", () => {
  it("returns 0 for invalid inputs", () => {
    expect(calculatePriceImpact(0, 1000, 100)).toBe(0);
    expect(calculatePriceImpact(1000, 0, 100)).toBe(0);
    expect(calculatePriceImpact(1000, 1000, 0)).toBe(0);
  });

  it("increases with trade size", () => {
    const small = calculatePriceImpact(10000, 10000, 10);
    const large = calculatePriceImpact(10000, 10000, 5000);
    expect(large).toBeGreaterThan(small);
  });
});

describe("calculateSpotPrice", () => {
  it("returns ratio of reserves", () => {
    expect(calculateSpotPrice(1000, 2000)).toBe(2);
    expect(calculateSpotPrice(500, 1000)).toBe(2);
  });

  it("returns 0 for zero reserveA", () => {
    expect(calculateSpotPrice(0, 1000)).toBe(0);
  });
});

describe("calculateLPTokens", () => {
  it("uses geometric mean for initial liquidity", () => {
    const tokens = calculateLPTokens(0, 0, 1000, 4000, 0);
    expect(tokens).toBeCloseTo(2000); // sqrt(1000 * 4000)
  });

  it("returns min of proportional contributions", () => {
    const tokens = calculateLPTokens(1000, 2000, 100, 200, 1000);
    expect(tokens).toBeCloseTo(100); // both proportional: 10%
  });

  it("takes minimum when contributions are unbalanced", () => {
    const tokens = calculateLPTokens(1000, 2000, 100, 100, 1000);
    // By A: (100/1000)*1000 = 100, By B: (100/2000)*1000 = 50
    expect(tokens).toBeCloseTo(50);
  });

  it("returns 0 for zero reserves with non-zero supply", () => {
    expect(calculateLPTokens(0, 2000, 100, 200, 1000)).toBe(0);
  });
});

describe("calculateRemoveLiquidity", () => {
  it("returns proportional amounts", () => {
    const result = calculateRemoveLiquidity(1000, 2000, 100, 1000);
    expect(result.amountA).toBeCloseTo(100);
    expect(result.amountB).toBeCloseTo(200);
  });

  it("returns zero for invalid inputs", () => {
    expect(calculateRemoveLiquidity(1000, 2000, 0, 1000).amountA).toBe(0);
    expect(calculateRemoveLiquidity(1000, 2000, 100, 0).amountA).toBe(0);
  });
});

describe("calculateImpermanentLoss", () => {
  it("returns 0 for price ratio of 1 (no change)", () => {
    expect(calculateImpermanentLoss(1)).toBeCloseTo(0);
  });

  it("returns negative value (loss) for price changes", () => {
    // 2x price → IL ≈ -5.72%
    const il = calculateImpermanentLoss(2);
    expect(il).toBeLessThan(0);
    expect(il).toBeCloseTo(-0.05719, 4);
  });

  it("IL is symmetric-ish for inverse ratios", () => {
    const il2x = calculateImpermanentLoss(2);
    const il05x = calculateImpermanentLoss(0.5);
    expect(il2x).toBeCloseTo(il05x, 4);
  });

  it("returns 0 for invalid ratio", () => {
    expect(calculateImpermanentLoss(0)).toBe(0);
    expect(calculateImpermanentLoss(-1)).toBe(0);
  });
});
