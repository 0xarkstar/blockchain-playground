export type VestingType = "linear" | "cliff" | "graded";

export interface VestingSchedule {
  readonly beneficiary: string;
  readonly totalAmount: number;
  readonly vestingType: VestingType;
  readonly startTime: number;
  readonly cliffDuration: number;
  readonly totalDuration: number;
  readonly released: number;
}

export interface VestingPoint {
  readonly time: number;
  readonly vestedAmount: number;
  readonly vestedPercent: number;
  readonly releasable: number;
}

export interface VestingInfo {
  readonly vestedAmount: number;
  readonly releasableAmount: number;
  readonly remainingAmount: number;
  readonly vestedPercent: number;
  readonly isCliffReached: boolean;
  readonly isFullyVested: boolean;
}

export function createVestingSchedule(
  beneficiary: string,
  totalAmount: number,
  vestingType: VestingType,
  startTime: number,
  cliffDuration: number,
  totalDuration: number,
): VestingSchedule {
  return {
    beneficiary,
    totalAmount: Math.max(0, totalAmount),
    vestingType,
    startTime,
    cliffDuration: Math.max(0, cliffDuration),
    totalDuration: Math.max(1, totalDuration),
    released: 0,
  };
}

export function calculateVestedAmount(
  schedule: VestingSchedule,
  currentTime: number,
): number {
  const elapsed = currentTime - schedule.startTime;

  if (elapsed < 0) return 0;
  if (elapsed >= schedule.totalDuration) return schedule.totalAmount;

  if (elapsed < schedule.cliffDuration) return 0;

  switch (schedule.vestingType) {
    case "linear":
      return (schedule.totalAmount * elapsed) / schedule.totalDuration;

    case "cliff":
      return elapsed >= schedule.cliffDuration ? schedule.totalAmount : 0;

    case "graded": {
      const postCliff = elapsed - schedule.cliffDuration;
      const remainingDuration = schedule.totalDuration - schedule.cliffDuration;
      if (remainingDuration <= 0) return schedule.totalAmount;
      return (schedule.totalAmount * postCliff) / remainingDuration;
    }

    default:
      return 0;
  }
}

export function getVestingInfo(
  schedule: VestingSchedule,
  currentTime: number,
): VestingInfo {
  const vestedAmount = calculateVestedAmount(schedule, currentTime);
  const releasableAmount = Math.max(0, vestedAmount - schedule.released);
  const remainingAmount = schedule.totalAmount - vestedAmount;
  const vestedPercent =
    schedule.totalAmount > 0 ? (vestedAmount / schedule.totalAmount) * 100 : 0;

  return {
    vestedAmount,
    releasableAmount,
    remainingAmount,
    vestedPercent,
    isCliffReached: currentTime - schedule.startTime >= schedule.cliffDuration,
    isFullyVested: vestedAmount >= schedule.totalAmount,
  };
}

export function releaseTokens(
  schedule: VestingSchedule,
  currentTime: number,
): { readonly newSchedule: VestingSchedule; readonly released: number } {
  const vestedAmount = calculateVestedAmount(schedule, currentTime);
  const releasable = Math.max(0, vestedAmount - schedule.released);
  return {
    newSchedule: { ...schedule, released: schedule.released + releasable },
    released: releasable,
  };
}

export function generateVestingCurve(
  schedule: VestingSchedule,
  points: number = 20,
): readonly VestingPoint[] {
  const result: VestingPoint[] = [];
  const step = schedule.totalDuration / points;

  for (let i = 0; i <= points; i++) {
    const time = schedule.startTime + step * i;
    const vestedAmount = calculateVestedAmount(schedule, time);
    const vestedPercent =
      schedule.totalAmount > 0
        ? (vestedAmount / schedule.totalAmount) * 100
        : 0;
    result.push({
      time,
      vestedAmount,
      vestedPercent,
      releasable: Math.max(0, vestedAmount - schedule.released),
    });
  }

  return result;
}
