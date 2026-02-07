export function aprToApy(apr: number, compoundsPerYear: number): number {
  if (compoundsPerYear <= 0) return apr;
  return Math.pow(1 + apr / compoundsPerYear, compoundsPerYear) - 1;
}

export function calculateCompoundedValue(
  principal: number,
  apr: number,
  compoundsPerYear: number,
  years: number,
): number {
  if (principal <= 0 || years <= 0) return principal;
  if (compoundsPerYear <= 0) {
    // Simple interest
    return principal * (1 + apr * years);
  }
  return (
    principal * Math.pow(1 + apr / compoundsPerYear, compoundsPerYear * years)
  );
}

export function calculateStakingRewards(
  staked: number,
  rewardRate: number,
  duration: number,
): number {
  if (staked <= 0 || rewardRate <= 0 || duration <= 0) return 0;
  return staked * rewardRate * duration;
}

export function calculatePoolShare(
  userStake: number,
  totalStake: number,
): number {
  if (totalStake <= 0) return 0;
  return userStake / totalStake;
}
