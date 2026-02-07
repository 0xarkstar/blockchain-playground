export interface PriceSnapshot {
  readonly price: number;
  readonly timestamp: number;
}

export interface DeviationResult {
  readonly deviated: boolean;
  readonly deviation: number;
}

export function calculateTWAP(snapshots: readonly PriceSnapshot[]): number {
  if (snapshots.length === 0) return 0;
  if (snapshots.length === 1) return snapshots[0].price;

  let weightedSum = 0;
  let totalTime = 0;

  for (let i = 1; i < snapshots.length; i++) {
    const timeDelta = snapshots[i].timestamp - snapshots[i - 1].timestamp;
    if (timeDelta <= 0) continue;

    weightedSum += snapshots[i - 1].price * timeDelta;
    totalTime += timeDelta;
  }

  if (totalTime <= 0) return snapshots[0].price;
  return weightedSum / totalTime;
}

export function detectPriceDeviation(
  currentPrice: number,
  twap: number,
  threshold: number,
): DeviationResult {
  if (twap <= 0) return { deviated: false, deviation: 0 };

  const deviation = Math.abs(currentPrice - twap) / twap;
  return {
    deviated: deviation > threshold,
    deviation,
  };
}

export function isHeartbeatStale(
  lastUpdate: number,
  heartbeatInterval: number,
  currentTime?: number,
): boolean {
  const now = currentTime ?? Date.now();
  return now - lastUpdate > heartbeatInterval;
}
