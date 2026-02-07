export interface DutchAuctionConfig {
  readonly seller: string;
  readonly tokenId: number;
  readonly startPrice: number;
  readonly endPrice: number;
  readonly startTime: number;
  readonly duration: number;
}

export interface DutchAuctionState {
  readonly config: DutchAuctionConfig;
  readonly settled: boolean;
  readonly winner: string | null;
  readonly settledPrice: number | null;
  readonly settledTime: number | null;
}

export interface AuctionPriceInfo {
  readonly currentPrice: number;
  readonly percentDecayed: number;
  readonly timeElapsed: number;
  readonly timeRemaining: number;
  readonly isActive: boolean;
  readonly hasEnded: boolean;
}

export interface AuctionResult {
  readonly success: boolean;
  readonly newState: DutchAuctionState;
  readonly message: string;
}

export function createDutchAuction(config: DutchAuctionConfig): DutchAuctionState {
  return {
    config: {
      ...config,
      startPrice: Math.max(0, config.startPrice),
      endPrice: Math.max(0, Math.min(config.startPrice, config.endPrice)),
      duration: Math.max(1, config.duration),
    },
    settled: false,
    winner: null,
    settledPrice: null,
    settledTime: null,
  };
}

export function getCurrentPrice(
  config: DutchAuctionConfig,
  currentTime: number
): number {
  const elapsed = currentTime - config.startTime;
  if (elapsed <= 0) return config.startPrice;
  if (elapsed >= config.duration) return config.endPrice;

  const decay = (config.startPrice - config.endPrice) * (elapsed / config.duration);
  return config.startPrice - decay;
}

export function getAuctionPriceInfo(
  config: DutchAuctionConfig,
  currentTime: number
): AuctionPriceInfo {
  const currentPrice = getCurrentPrice(config, currentTime);
  const elapsed = Math.max(0, currentTime - config.startTime);
  const remaining = Math.max(0, config.duration - elapsed);
  const priceDrop = config.startPrice - config.endPrice;
  const percentDecayed = priceDrop > 0
    ? ((config.startPrice - currentPrice) / priceDrop) * 100
    : 0;

  return {
    currentPrice,
    percentDecayed,
    timeElapsed: elapsed,
    timeRemaining: remaining,
    isActive: elapsed >= 0 && elapsed < config.duration,
    hasEnded: elapsed >= config.duration,
  };
}

export function settleDutchAuction(
  state: DutchAuctionState,
  buyer: string,
  currentTime: number
): AuctionResult {
  if (state.settled) {
    return { success: false, newState: state, message: "Auction already settled" };
  }
  if (buyer === state.config.seller) {
    return { success: false, newState: state, message: "Seller cannot buy own auction" };
  }
  const elapsed = currentTime - state.config.startTime;
  if (elapsed < 0) {
    return { success: false, newState: state, message: "Auction has not started" };
  }
  if (elapsed > state.config.duration) {
    return { success: false, newState: state, message: "Auction has ended" };
  }

  const price = getCurrentPrice(state.config, currentTime);

  return {
    success: true,
    newState: {
      ...state,
      settled: true,
      winner: buyer,
      settledPrice: price,
      settledTime: currentTime,
    },
    message: `${buyer} won auction at ${price.toFixed(4)} ETH`,
  };
}

export function generatePriceCurve(
  config: DutchAuctionConfig,
  points: number = 20
): readonly { readonly time: number; readonly price: number }[] {
  const result: { time: number; price: number }[] = [];
  const step = config.duration / points;

  for (let i = 0; i <= points; i++) {
    const time = config.startTime + step * i;
    result.push({ time, price: getCurrentPrice(config, time) });
  }

  return result;
}
