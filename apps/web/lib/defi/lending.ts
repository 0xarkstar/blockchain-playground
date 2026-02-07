export function calculateUtilizationRate(
  totalBorrowed: number,
  totalSupply: number
): number {
  if (totalSupply <= 0) return 0;
  return totalBorrowed / totalSupply;
}

export function calculateBorrowRate(
  utilization: number,
  baseRate: number,
  slope1: number,
  slope2: number,
  kink: number
): number {
  if (utilization <= 0) return baseRate;
  if (kink <= 0 || kink >= 1) {
    return baseRate + utilization * slope1;
  }

  if (utilization <= kink) {
    return baseRate + (utilization / kink) * slope1;
  }

  // Above kink: steeper slope kicks in
  const normalRate = baseRate + slope1;
  const excessUtilization = utilization - kink;
  const excessSlope = (excessUtilization / (1 - kink)) * slope2;
  return normalRate + excessSlope;
}

export function calculateSupplyRate(
  utilization: number,
  borrowRate: number,
  reserveFactor: number
): number {
  if (utilization <= 0 || borrowRate <= 0) return 0;
  return utilization * borrowRate * (1 - reserveFactor);
}

export function calculateHealthFactor(
  collateralValue: number,
  borrowedValue: number,
  liquidationThreshold: number
): number {
  if (borrowedValue <= 0) return Infinity;
  return (collateralValue * liquidationThreshold) / borrowedValue;
}

export function calculateMaxBorrow(
  collateralValue: number,
  collateralFactor: number
): number {
  if (collateralValue <= 0 || collateralFactor <= 0) return 0;
  return collateralValue * collateralFactor;
}

export function calculateLiquidationPrice(
  borrowedValue: number,
  collateralAmount: number,
  liquidationThreshold: number
): number {
  if (collateralAmount <= 0 || liquidationThreshold <= 0) return 0;
  return borrowedValue / (collateralAmount * liquidationThreshold);
}
