import { describe, it, expect } from "vitest";
import {
  createVestingSchedule,
  calculateVestedAmount,
  getVestingInfo,
  releaseTokens,
  generateVestingCurve,
} from "../lib/tokens/vesting";

describe("calculateVestedAmount", () => {
  it("returns 0 before start time", () => {
    const s = createVestingSchedule("alice", 1000, "linear", 100, 0, 100);
    expect(calculateVestedAmount(s, 50)).toBe(0);
  });

  it("returns full amount after total duration", () => {
    const s = createVestingSchedule("alice", 1000, "linear", 100, 0, 100);
    expect(calculateVestedAmount(s, 300)).toBe(1000);
  });

  it("calculates linear vesting correctly", () => {
    const s = createVestingSchedule("alice", 1000, "linear", 0, 0, 100);
    expect(calculateVestedAmount(s, 50)).toBe(500);
  });

  it("returns 0 during cliff period", () => {
    const s = createVestingSchedule("alice", 1000, "linear", 0, 30, 100);
    expect(calculateVestedAmount(s, 20)).toBe(0);
  });

  it("vests after cliff in linear mode", () => {
    const s = createVestingSchedule("alice", 1000, "linear", 0, 30, 100);
    expect(calculateVestedAmount(s, 50)).toBe(500);
  });

  it("cliff vesting is all-or-nothing", () => {
    const s = createVestingSchedule("alice", 1000, "cliff", 0, 50, 100);
    expect(calculateVestedAmount(s, 30)).toBe(0);
    expect(calculateVestedAmount(s, 50)).toBe(1000);
  });

  it("graded vesting linearly after cliff", () => {
    const s = createVestingSchedule("alice", 1000, "graded", 0, 20, 100);
    // At time 60: postCliff=40, remainingDuration=80, vested = 1000*40/80 = 500
    expect(calculateVestedAmount(s, 60)).toBe(500);
  });
});

describe("getVestingInfo", () => {
  it("shows correct info mid-vesting", () => {
    const s = createVestingSchedule("alice", 1000, "linear", 0, 0, 100);
    const info = getVestingInfo(s, 50);
    expect(info.vestedAmount).toBe(500);
    expect(info.releasableAmount).toBe(500);
    expect(info.remainingAmount).toBe(500);
    expect(info.vestedPercent).toBe(50);
    expect(info.isCliffReached).toBe(true);
    expect(info.isFullyVested).toBe(false);
  });

  it("shows fully vested state", () => {
    const s = createVestingSchedule("alice", 1000, "linear", 0, 0, 100);
    const info = getVestingInfo(s, 200);
    expect(info.isFullyVested).toBe(true);
    expect(info.vestedPercent).toBe(100);
  });
});

describe("releaseTokens", () => {
  it("releases vested amount", () => {
    const s = createVestingSchedule("alice", 1000, "linear", 0, 0, 100);
    const { newSchedule, released } = releaseTokens(s, 50);
    expect(released).toBe(500);
    expect(newSchedule.released).toBe(500);
  });

  it("tracks cumulative releases", () => {
    let s = createVestingSchedule("alice", 1000, "linear", 0, 0, 100);
    s = releaseTokens(s, 30).newSchedule;
    const { newSchedule, released } = releaseTokens(s, 60);
    expect(released).toBe(300); // 600 total - 300 already released
    expect(newSchedule.released).toBe(600);
  });
});

describe("generateVestingCurve", () => {
  it("generates correct number of points", () => {
    const s = createVestingSchedule("alice", 1000, "linear", 0, 0, 100);
    const curve = generateVestingCurve(s, 10);
    expect(curve.length).toBe(11); // 0..10 inclusive
    expect(curve[0]!.vestedPercent).toBe(0);
    expect(curve[10]!.vestedPercent).toBe(100);
  });
});
