export interface NFTMetadata {
  readonly name: string;
  readonly description: string;
  readonly image: string;
  readonly externalUrl?: string;
  readonly attributes: readonly {
    readonly trait_type: string;
    readonly value: string;
  }[];
}

export interface ERC721State {
  readonly name: string;
  readonly symbol: string;
  readonly owners: Readonly<Record<number, string>>;
  readonly approvals: Readonly<Record<number, string>>;
  readonly operatorApprovals: Readonly<
    Record<string, Readonly<Record<string, boolean>>>
  >;
  readonly metadata: Readonly<Record<number, NFTMetadata>>;
  readonly nextTokenId: number;
  readonly soulbound: boolean;
}

export interface NFTResult {
  readonly success: boolean;
  readonly newState: ERC721State;
  readonly message: string;
  readonly tokenId?: number;
}

export function createERC721(
  name: string,
  symbol: string,
  soulbound: boolean = false,
): ERC721State {
  return {
    name,
    symbol,
    owners: {},
    approvals: {},
    operatorApprovals: {},
    metadata: {},
    nextTokenId: 1,
    soulbound,
  };
}

export function mintNFT(
  state: ERC721State,
  to: string,
  meta: NFTMetadata,
): NFTResult {
  if (!to) {
    return { success: false, newState: state, message: "Invalid recipient" };
  }
  const tokenId = state.nextTokenId;
  return {
    success: true,
    newState: {
      ...state,
      owners: { ...state.owners, [tokenId]: to },
      metadata: { ...state.metadata, [tokenId]: meta },
      nextTokenId: tokenId + 1,
    },
    message: `Minted token #${tokenId} to ${to}`,
    tokenId,
  };
}

export function transferNFT(
  state: ERC721State,
  from: string,
  to: string,
  tokenId: number,
): NFTResult {
  if (state.soulbound) {
    return {
      success: false,
      newState: state,
      message: "Soulbound tokens cannot be transferred",
    };
  }
  const owner = state.owners[tokenId];
  if (!owner) {
    return {
      success: false,
      newState: state,
      message: `Token #${tokenId} does not exist`,
    };
  }
  if (owner !== from) {
    return {
      success: false,
      newState: state,
      message: `${from} does not own token #${tokenId}`,
    };
  }
  if (!to) {
    return { success: false, newState: state, message: "Invalid recipient" };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [tokenId]: _, ...restApprovals } = state.approvals;
  return {
    success: true,
    newState: {
      ...state,
      owners: { ...state.owners, [tokenId]: to },
      approvals: restApprovals,
    },
    message: `Transferred token #${tokenId} from ${from} to ${to}`,
  };
}

export function approveNFT(
  state: ERC721State,
  owner: string,
  approved: string,
  tokenId: number,
): NFTResult {
  const tokenOwner = state.owners[tokenId];
  if (!tokenOwner) {
    return {
      success: false,
      newState: state,
      message: `Token #${tokenId} does not exist`,
    };
  }
  if (tokenOwner !== owner) {
    return {
      success: false,
      newState: state,
      message: `${owner} does not own token #${tokenId}`,
    };
  }
  return {
    success: true,
    newState: {
      ...state,
      approvals: { ...state.approvals, [tokenId]: approved },
    },
    message: `Approved ${approved} for token #${tokenId}`,
  };
}

export function ownerOf(state: ERC721State, tokenId: number): string | null {
  return state.owners[tokenId] ?? null;
}

export function balanceOfNFT(state: ERC721State, account: string): number {
  return Object.values(state.owners).filter((o) => o === account).length;
}

export function tokensOfOwner(state: ERC721State, account: string): number[] {
  return Object.entries(state.owners)
    .filter(([, owner]) => owner === account)
    .map(([id]) => Number(id))
    .sort((a, b) => a - b);
}

export function totalSupplyNFT(state: ERC721State): number {
  return Object.keys(state.owners).length;
}

export function buildMetadataJSON(meta: NFTMetadata): string {
  return JSON.stringify(meta, null, 2);
}

export function buildTokenURI(tokenId: number, baseURI: string): string {
  return `${baseURI}${tokenId}`;
}
