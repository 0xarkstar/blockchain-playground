import { describe, it, expect } from "vitest";
import {
  createMarketplace, listNFT, cancelListing, buyNFT,
  calculatePriceBreakdown, getActiveListings,
} from "../lib/tokens/marketplace";

describe("createMarketplace", () => {
  it("creates with default fee", () => {
    const state = createMarketplace();
    expect(state.platformFeePercent).toBe(2.5);
    expect(state.listings).toEqual([]);
    expect(state.nextListingId).toBe(1);
  });

  it("clamps fee to valid range", () => {
    expect(createMarketplace(-5).platformFeePercent).toBe(0);
    expect(createMarketplace(99).platformFeePercent).toBe(50);
  });
});

describe("listNFT", () => {
  it("creates a listing with correct fields", () => {
    const state = createMarketplace();
    const result = listNFT(state, "alice", 1, 10, 5);
    expect(result.success).toBe(true);
    expect(result.newState.listings).toHaveLength(1);
    expect(result.newState.listings[0]!.seller).toBe("alice");
    expect(result.newState.listings[0]!.tokenId).toBe(1);
    expect(result.newState.listings[0]!.price).toBe(10);
    expect(result.newState.listings[0]!.royaltyPercent).toBe(5);
    expect(result.newState.listings[0]!.active).toBe(true);
    expect(result.newState.nextListingId).toBe(2);
  });

  it("rejects zero price", () => {
    const state = createMarketplace();
    expect(listNFT(state, "alice", 1, 0).success).toBe(false);
  });

  it("rejects negative price", () => {
    const state = createMarketplace();
    expect(listNFT(state, "alice", 1, -1).success).toBe(false);
  });

  it("rejects royalty above 50%", () => {
    const state = createMarketplace();
    expect(listNFT(state, "alice", 1, 10, 60).success).toBe(false);
  });

  it("rejects negative royalty", () => {
    const state = createMarketplace();
    expect(listNFT(state, "alice", 1, 10, -1).success).toBe(false);
  });
});

describe("cancelListing", () => {
  it("cancels own listing", () => {
    let state = createMarketplace();
    state = listNFT(state, "alice", 1, 10).newState;
    const result = cancelListing(state, 1, "alice");
    expect(result.success).toBe(true);
    expect(result.newState.listings[0]!.active).toBe(false);
  });

  it("rejects cancel by non-seller", () => {
    let state = createMarketplace();
    state = listNFT(state, "alice", 1, 10).newState;
    expect(cancelListing(state, 1, "bob").success).toBe(false);
  });

  it("rejects cancelling non-existent listing", () => {
    const state = createMarketplace();
    expect(cancelListing(state, 99, "alice").success).toBe(false);
  });

  it("rejects cancelling already inactive listing", () => {
    let state = createMarketplace();
    state = listNFT(state, "alice", 1, 10).newState;
    state = cancelListing(state, 1, "alice").newState;
    expect(cancelListing(state, 1, "alice").success).toBe(false);
  });
});

describe("buyNFT", () => {
  it("buys an active listing", () => {
    let state = createMarketplace();
    state = listNFT(state, "alice", 1, 10, 5).newState;
    const result = buyNFT(state, 1, "bob");
    expect(result.success).toBe(true);
    expect(result.newState.listings[0]!.active).toBe(false);
    expect(result.newState.sales).toHaveLength(1);
    expect(result.newState.sales[0]!.buyer).toBe("bob");
  });

  it("rejects buying own listing", () => {
    let state = createMarketplace();
    state = listNFT(state, "alice", 1, 10).newState;
    expect(buyNFT(state, 1, "alice").success).toBe(false);
  });

  it("rejects buying non-existent listing", () => {
    const state = createMarketplace();
    expect(buyNFT(state, 99, "bob").success).toBe(false);
  });

  it("rejects buying inactive listing", () => {
    let state = createMarketplace();
    state = listNFT(state, "alice", 1, 10).newState;
    state = cancelListing(state, 1, "alice").newState;
    expect(buyNFT(state, 1, "bob").success).toBe(false);
  });
});

describe("calculatePriceBreakdown", () => {
  it("calculates correct breakdown", () => {
    const bd = calculatePriceBreakdown(100, 10, 2.5);
    expect(bd.royaltyAmount).toBe(10);
    expect(bd.platformFee).toBe(2.5);
    expect(bd.sellerProceeds).toBe(87.5);
  });

  it("handles zero royalty", () => {
    const bd = calculatePriceBreakdown(100, 0, 2.5);
    expect(bd.royaltyAmount).toBe(0);
    expect(bd.sellerProceeds).toBe(97.5);
  });

  it("returns zeros for non-positive price", () => {
    const bd = calculatePriceBreakdown(0, 10, 2.5);
    expect(bd.sellerProceeds).toBe(0);
    expect(bd.royaltyAmount).toBe(0);
  });
});

describe("getActiveListings", () => {
  it("filters active listings", () => {
    let state = createMarketplace();
    state = listNFT(state, "alice", 1, 10).newState;
    state = listNFT(state, "bob", 2, 20).newState;
    state = cancelListing(state, 1, "alice").newState;
    expect(getActiveListings(state)).toHaveLength(1);
    expect(getActiveListings(state)[0]!.seller).toBe("bob");
  });
});
