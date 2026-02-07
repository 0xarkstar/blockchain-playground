import { describe, it, expect } from "vitest";
import {
  calculateTWAP,
  detectPriceDeviation,
  isHeartbeatStale,
} from "../lib/defi/oracle";

describe("calculateTWAP", () => {
  it("returns 0 for empty snapshots", () => {
    expect(calculateTWAP([])).toBe(0);
  });

  it("returns the price for single snapshot", () => {
    expect(calculateTWAP([{ price: 100, timestamp: 1000 }])).toBe(100);
  });

  it("calculates time-weighted average", () => {
    const snapshots = [
      { price: 100, timestamp: 0 },
      { price: 200, timestamp: 100 },
      { price: 300, timestamp: 200 },
    ];
    // TWAP = (100*100 + 200*100) / 200 = 30000/200 = 150
    expect(calculateTWAP(snapshots)).toBeCloseTo(150);
  });

  it("weights by time duration", () => {
    const snapshots = [
      { price: 100, timestamp: 0 },
      { price: 200, timestamp: 10 }, // 100 held for 10s
      { price: 300, timestamp: 110 }, // 200 held for 100s
    ];
    // TWAP = (100*10 + 200*100) / 110 = 21000/110 ≈ 190.91
    expect(calculateTWAP(snapshots)).toBeCloseTo(190.909, 2);
  });

  it("ignores zero-duration gaps", () => {
    const snapshots = [
      { price: 100, timestamp: 0 },
      { price: 200, timestamp: 0 }, // same timestamp
      { price: 300, timestamp: 100 },
    ];
    // Only 200->300 counts: 200*100 / 100 = 200
    expect(calculateTWAP(snapshots)).toBeCloseTo(200);
  });
});

describe("detectPriceDeviation", () => {
  it("detects deviation above threshold", () => {
    const result = detectPriceDeviation(120, 100, 0.1);
    expect(result.deviated).toBe(true);
    expect(result.deviation).toBeCloseTo(0.2);
  });

  it("returns no deviation within threshold", () => {
    const result = detectPriceDeviation(105, 100, 0.1);
    expect(result.deviated).toBe(false);
    expect(result.deviation).toBeCloseTo(0.05);
  });

  it("handles zero TWAP gracefully", () => {
    const result = detectPriceDeviation(100, 0, 0.1);
    expect(result.deviated).toBe(false);
    expect(result.deviation).toBe(0);
  });
});

describe("isHeartbeatStale", () => {
  it("returns true when heartbeat is overdue", () => {
    expect(isHeartbeatStale(1000, 500, 2000)).toBe(true);
  });

  it("returns false when heartbeat is fresh", () => {
    expect(isHeartbeatStale(1000, 5000, 2000)).toBe(false);
  });

  it("returns false at exact boundary", () => {
    expect(isHeartbeatStale(1000, 1000, 2000)).toBe(false);
  });
});
