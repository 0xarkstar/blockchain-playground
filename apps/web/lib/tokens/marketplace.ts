export interface Listing {
  readonly id: number;
  readonly seller: string;
  readonly tokenId: number;
  readonly price: number;
  readonly royaltyPercent: number;
  readonly platformFeePercent: number;
  readonly active: boolean;
  readonly createdAt: number;
}

export interface MarketplaceState {
  readonly listings: readonly Listing[];
  readonly nextListingId: number;
  readonly sales: readonly Sale[];
  readonly platformFeePercent: number;
}

export interface Sale {
  readonly listingId: number;
  readonly buyer: string;
  readonly price: number;
  readonly sellerProceeds: number;
  readonly royaltyAmount: number;
  readonly platformFee: number;
  readonly timestamp: number;
}

export interface MarketplaceResult {
  readonly success: boolean;
  readonly newState: MarketplaceState;
  readonly message: string;
}

export interface PriceBreakdown {
  readonly price: number;
  readonly royaltyAmount: number;
  readonly royaltyPercent: number;
  readonly platformFee: number;
  readonly platformFeePercent: number;
  readonly sellerProceeds: number;
}

export function createMarketplace(platformFeePercent: number = 2.5): MarketplaceState {
  return {
    listings: [],
    nextListingId: 1,
    sales: [],
    platformFeePercent: Math.max(0, Math.min(50, platformFeePercent)),
  };
}

export function listNFT(
  state: MarketplaceState,
  seller: string,
  tokenId: number,
  price: number,
  royaltyPercent: number = 0
): MarketplaceResult {
  if (price <= 0) {
    return { success: false, newState: state, message: "Price must be positive" };
  }
  if (royaltyPercent < 0 || royaltyPercent > 50) {
    return { success: false, newState: state, message: "Royalty must be 0-50%" };
  }
  const listing: Listing = {
    id: state.nextListingId,
    seller,
    tokenId,
    price,
    royaltyPercent,
    platformFeePercent: state.platformFeePercent,
    active: true,
    createdAt: Date.now(),
  };
  return {
    success: true,
    newState: {
      ...state,
      listings: [...state.listings, listing],
      nextListingId: state.nextListingId + 1,
    },
    message: `Listed NFT #${tokenId} for ${price} ETH`,
  };
}

export function cancelListing(
  state: MarketplaceState,
  listingId: number,
  caller: string
): MarketplaceResult {
  const listing = state.listings.find((l) => l.id === listingId);
  if (!listing) {
    return { success: false, newState: state, message: "Listing not found" };
  }
  if (!listing.active) {
    return { success: false, newState: state, message: "Listing already inactive" };
  }
  if (listing.seller !== caller) {
    return { success: false, newState: state, message: "Only seller can cancel" };
  }
  return {
    success: true,
    newState: {
      ...state,
      listings: state.listings.map((l) =>
        l.id === listingId ? { ...l, active: false } : l
      ),
    },
    message: `Cancelled listing #${listingId}`,
  };
}

export function buyNFT(
  state: MarketplaceState,
  listingId: number,
  buyer: string
): MarketplaceResult {
  const listing = state.listings.find((l) => l.id === listingId);
  if (!listing) {
    return { success: false, newState: state, message: "Listing not found" };
  }
  if (!listing.active) {
    return { success: false, newState: state, message: "Listing not active" };
  }
  if (listing.seller === buyer) {
    return { success: false, newState: state, message: "Cannot buy own listing" };
  }

  const breakdown = calculatePriceBreakdown(
    listing.price,
    listing.royaltyPercent,
    listing.platformFeePercent
  );

  const sale: Sale = {
    listingId,
    buyer,
    price: listing.price,
    sellerProceeds: breakdown.sellerProceeds,
    royaltyAmount: breakdown.royaltyAmount,
    platformFee: breakdown.platformFee,
    timestamp: Date.now(),
  };

  return {
    success: true,
    newState: {
      ...state,
      listings: state.listings.map((l) =>
        l.id === listingId ? { ...l, active: false } : l
      ),
      sales: [...state.sales, sale],
    },
    message: `${buyer} bought NFT #${listing.tokenId} for ${listing.price} ETH`,
  };
}

export function calculatePriceBreakdown(
  price: number,
  royaltyPercent: number,
  platformFeePercent: number
): PriceBreakdown {
  if (price <= 0) {
    return { price: 0, royaltyAmount: 0, royaltyPercent: 0, platformFee: 0, platformFeePercent: 0, sellerProceeds: 0 };
  }
  const royaltyAmount = price * (royaltyPercent / 100);
  const platformFee = price * (platformFeePercent / 100);
  const sellerProceeds = price - royaltyAmount - platformFee;

  return {
    price,
    royaltyAmount,
    royaltyPercent,
    platformFee,
    platformFeePercent,
    sellerProceeds: Math.max(0, sellerProceeds),
  };
}

export function getActiveListings(state: MarketplaceState): readonly Listing[] {
  return state.listings.filter((l) => l.active);
}
