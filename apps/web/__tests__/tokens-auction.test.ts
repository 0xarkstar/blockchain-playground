import { describe, it, expect } from "vitest";
import {
  createDutchAuction,
  getCurrentPrice,
  getAuctionPriceInfo,
  settleDutchAuction,
  generatePriceCurve,
  type DutchAuctionConfig,
} from "../lib/tokens/auction";

const baseConfig: DutchAuctionConfig = {
  seller: "alice",
  tokenId: 1,
  startPrice: 100,
  endPrice: 10,
  startTime: 1000,
  duration: 100,
};

describe("createDutchAuction", () => {
  it("creates auction with correct initial state", () => {
    const state = createDutchAuction(baseConfig);
    expect(state.settled).toBe(false);
    expect(state.winner).toBeNull();
    expect(state.config.startPrice).toBe(100);
    expect(state.config.endPrice).toBe(10);
  });

  it("clamps negative prices", () => {
    const state = createDutchAuction({ ...baseConfig, startPrice: -5 });
    expect(state.config.startPrice).toBe(0);
  });

  it("clamps endPrice to not exceed startPrice", () => {
    const state = createDutchAuction({ ...baseConfig, endPrice: 200 });
    expect(state.config.endPrice).toBe(100);
  });

  it("enforces minimum duration of 1", () => {
    const state = createDutchAuction({ ...baseConfig, duration: 0 });
    expect(state.config.duration).toBe(1);
  });
});

describe("getCurrentPrice", () => {
  it("returns start price before auction", () => {
    expect(getCurrentPrice(baseConfig, 500)).toBe(100);
  });

  it("returns end price after auction", () => {
    expect(getCurrentPrice(baseConfig, 1200)).toBe(10);
  });

  it("decays linearly at midpoint", () => {
    expect(getCurrentPrice(baseConfig, 1050)).toBe(55);
  });

  it("decays at 25%", () => {
    expect(getCurrentPrice(baseConfig, 1025)).toBe(77.5);
  });
});

describe("getAuctionPriceInfo", () => {
  it("returns correct info at midpoint", () => {
    const info = getAuctionPriceInfo(baseConfig, 1050);
    expect(info.currentPrice).toBe(55);
    expect(info.percentDecayed).toBe(50);
    expect(info.timeElapsed).toBe(50);
    expect(info.timeRemaining).toBe(50);
    expect(info.isActive).toBe(true);
    expect(info.hasEnded).toBe(false);
  });

  it("shows ended state", () => {
    const info = getAuctionPriceInfo(baseConfig, 1200);
    expect(info.hasEnded).toBe(true);
    expect(info.isActive).toBe(false);
    expect(info.timeRemaining).toBe(0);
  });
});

describe("settleDutchAuction", () => {
  it("settles at current price", () => {
    const state = createDutchAuction(baseConfig);
    const result = settleDutchAuction(state, "bob", 1050);
    expect(result.success).toBe(true);
    expect(result.newState.settled).toBe(true);
    expect(result.newState.winner).toBe("bob");
    expect(result.newState.settledPrice).toBe(55);
  });

  it("rejects settlement on already settled auction", () => {
    let state = createDutchAuction(baseConfig);
    state = settleDutchAuction(state, "bob", 1050).newState;
    expect(settleDutchAuction(state, "charlie", 1060).success).toBe(false);
  });

  it("rejects seller buying own auction", () => {
    const state = createDutchAuction(baseConfig);
    expect(settleDutchAuction(state, "alice", 1050).success).toBe(false);
  });

  it("rejects settlement before start", () => {
    const state = createDutchAuction(baseConfig);
    expect(settleDutchAuction(state, "bob", 500).success).toBe(false);
  });

  it("rejects settlement after end", () => {
    const state = createDutchAuction(baseConfig);
    expect(settleDutchAuction(state, "bob", 1200).success).toBe(false);
  });
});

describe("generatePriceCurve", () => {
  it("generates correct number of points", () => {
    const curve = generatePriceCurve(baseConfig, 10);
    expect(curve).toHaveLength(11);
    expect(curve[0]!.price).toBe(100);
    expect(curve[10]!.price).toBe(10);
  });

  it("prices decrease monotonically", () => {
    const curve = generatePriceCurve(baseConfig, 20);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i]!.price).toBeLessThanOrEqual(curve[i - 1]!.price);
    }
  });
});
