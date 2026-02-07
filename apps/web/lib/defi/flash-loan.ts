export interface FlashLoanResult {
  readonly success: boolean;
  readonly repayAmount: number;
  readonly profit: number;
}

export function simulateFlashLoan(
  borrowAmount: number,
  feeRate: number,
  arbitrageProfit: number
): FlashLoanResult {
  if (borrowAmount <= 0) {
    return { success: false, repayAmount: 0, profit: 0 };
  }

  const fee = borrowAmount * feeRate;
  const repayAmount = borrowAmount + fee;
  const profit = arbitrageProfit - fee;
  const success = profit > 0;

  return { success, repayAmount, profit };
}

export function calculateArbitrageProfit(
  priceA: number,
  priceB: number,
  amount: number,
  fees: number
): number {
  if (priceA <= 0 || priceB <= 0 || amount <= 0) return 0;

  // Buy at lower price, sell at higher price
  const lowPrice = Math.min(priceA, priceB);
  const highPrice = Math.max(priceA, priceB);

  const tokensAcquired = amount / lowPrice;
  const revenue = tokensAcquired * highPrice;
  return revenue - amount - fees;
}
