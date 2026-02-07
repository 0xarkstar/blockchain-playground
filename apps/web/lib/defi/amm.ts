export interface SwapResult {
  readonly amountOut: number;
  readonly priceImpact: number;
  readonly fee: number;
  readonly effectivePrice: number;
}

export interface RemoveLiquidityResult {
  readonly amountA: number;
  readonly amountB: number;
}

export function calculateSwapOutput(
  reserveIn: number,
  reserveOut: number,
  amountIn: number,
  feeRate: number = 0.003
): SwapResult {
  if (reserveIn <= 0 || reserveOut <= 0 || amountIn <= 0) {
    return { amountOut: 0, priceImpact: 0, fee: 0, effectivePrice: 0 };
  }
  if (feeRate < 0 || feeRate >= 1) {
    return { amountOut: 0, priceImpact: 0, fee: 0, effectivePrice: 0 };
  }

  const fee = amountIn * feeRate;
  const amountInAfterFee = amountIn - fee;

  // x * y = k => amountOut = (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee)
  const amountOut =
    (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee);

  const spotPrice = reserveOut / reserveIn;
  const effectivePrice = amountIn > 0 ? amountOut / amountIn : 0;
  const priceImpact =
    spotPrice > 0 ? Math.abs(1 - effectivePrice / spotPrice) * 100 : 0;

  return { amountOut, priceImpact, fee, effectivePrice };
}

export function calculatePriceImpact(
  reserveIn: number,
  reserveOut: number,
  amountIn: number
): number {
  if (reserveIn <= 0 || reserveOut <= 0 || amountIn <= 0) return 0;

  const spotPrice = reserveOut / reserveIn;
  const amountOut = (reserveOut * amountIn) / (reserveIn + amountIn);
  const executionPrice = amountOut / amountIn;

  return Math.abs(1 - executionPrice / spotPrice) * 100;
}

export function calculateSpotPrice(
  reserveA: number,
  reserveB: number
): number {
  if (reserveA <= 0) return 0;
  return reserveB / reserveA;
}

export function calculateLPTokens(
  reserveA: number,
  reserveB: number,
  amountA: number,
  amountB: number,
  totalSupply: number
): number {
  if (totalSupply === 0) {
    // Initial liquidity: LP tokens = sqrt(amountA * amountB)
    return Math.sqrt(amountA * amountB);
  }
  if (reserveA <= 0 || reserveB <= 0) return 0;

  // Min of proportional contributions to prevent manipulation
  const tokensByA = (amountA / reserveA) * totalSupply;
  const tokensByB = (amountB / reserveB) * totalSupply;
  return Math.min(tokensByA, tokensByB);
}

export function calculateRemoveLiquidity(
  reserveA: number,
  reserveB: number,
  lpAmount: number,
  totalSupply: number
): RemoveLiquidityResult {
  if (totalSupply <= 0 || lpAmount <= 0) {
    return { amountA: 0, amountB: 0 };
  }

  const share = lpAmount / totalSupply;
  return {
    amountA: reserveA * share,
    amountB: reserveB * share,
  };
}

export function calculateImpermanentLoss(priceRatio: number): number {
  if (priceRatio <= 0) return 0;

  // IL = 2 * sqrt(r) / (1 + r) - 1
  const sqrtRatio = Math.sqrt(priceRatio);
  return (2 * sqrtRatio) / (1 + priceRatio) - 1;
}
