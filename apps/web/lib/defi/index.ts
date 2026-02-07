export {
  calculateSwapOutput,
  calculatePriceImpact,
  calculateSpotPrice,
  calculateLPTokens,
  calculateRemoveLiquidity,
  calculateImpermanentLoss,
  type SwapResult,
  type RemoveLiquidityResult,
} from "./amm";

export {
  calculateUtilizationRate,
  calculateBorrowRate,
  calculateSupplyRate,
  calculateHealthFactor,
  calculateMaxBorrow,
  calculateLiquidationPrice,
} from "./lending";

export {
  aprToApy,
  calculateCompoundedValue,
  calculateStakingRewards,
  calculatePoolShare,
} from "./yield";

export {
  simulateFlashLoan,
  calculateArbitrageProfit,
  type FlashLoanResult,
} from "./flash-loan";

export {
  calculateTWAP,
  detectPriceDeviation,
  isHeartbeatStale,
  type PriceSnapshot,
  type DeviationResult,
} from "./oracle";
