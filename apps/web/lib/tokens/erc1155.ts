export interface ERC1155State {
  readonly balances: Readonly<Record<string, Readonly<Record<number, bigint>>>>;
  readonly operatorApprovals: Readonly<
    Record<string, Readonly<Record<string, boolean>>>
  >;
  readonly uris: Readonly<Record<number, string>>;
  readonly tokenTypes: Readonly<Record<number, "fungible" | "non-fungible">>;
  readonly totalSupply: Readonly<Record<number, bigint>>;
}

export interface ERC1155Result {
  readonly success: boolean;
  readonly newState: ERC1155State;
  readonly message: string;
}

export function createERC1155(): ERC1155State {
  return {
    balances: {},
    operatorApprovals: {},
    uris: {},
    tokenTypes: {},
    totalSupply: {},
  };
}

export function mintERC1155(
  state: ERC1155State,
  to: string,
  tokenId: number,
  amount: bigint,
  tokenType: "fungible" | "non-fungible" = "fungible",
  uri: string = "",
): ERC1155Result {
  if (amount <= BigInt(0)) {
    return {
      success: false,
      newState: state,
      message: "Amount must be positive",
    };
  }
  if (tokenType === "non-fungible" && amount !== BigInt(1)) {
    return {
      success: false,
      newState: state,
      message: "Non-fungible tokens must have amount of 1",
    };
  }
  const existingSupply = state.totalSupply[tokenId] ?? BigInt(0);
  if (tokenType === "non-fungible" && existingSupply > BigInt(0)) {
    return {
      success: false,
      newState: state,
      message: `Non-fungible token #${tokenId} already minted`,
    };
  }

  const accountBalances = state.balances[to] ?? {};
  const currentBalance = accountBalances[tokenId] ?? BigInt(0);

  return {
    success: true,
    newState: {
      ...state,
      balances: {
        ...state.balances,
        [to]: { ...accountBalances, [tokenId]: currentBalance + amount },
      },
      totalSupply: { ...state.totalSupply, [tokenId]: existingSupply + amount },
      tokenTypes: { ...state.tokenTypes, [tokenId]: tokenType },
      uris: uri ? { ...state.uris, [tokenId]: uri } : state.uris,
    },
    message: `Minted ${amount} of token #${tokenId} to ${to}`,
  };
}

export function transferERC1155(
  state: ERC1155State,
  from: string,
  to: string,
  tokenId: number,
  amount: bigint,
): ERC1155Result {
  if (amount <= BigInt(0)) {
    return {
      success: false,
      newState: state,
      message: "Amount must be positive",
    };
  }
  if (from === to) {
    return {
      success: false,
      newState: state,
      message: "Cannot transfer to self",
    };
  }

  const fromBalances = state.balances[from] ?? {};
  const fromBalance = fromBalances[tokenId] ?? BigInt(0);
  if (fromBalance < amount) {
    return { success: false, newState: state, message: "Insufficient balance" };
  }

  const toBalances = state.balances[to] ?? {};
  const toBalance = toBalances[tokenId] ?? BigInt(0);

  return {
    success: true,
    newState: {
      ...state,
      balances: {
        ...state.balances,
        [from]: { ...fromBalances, [tokenId]: fromBalance - amount },
        [to]: { ...toBalances, [tokenId]: toBalance + amount },
      },
    },
    message: `Transferred ${amount} of token #${tokenId} from ${from} to ${to}`,
  };
}

export function batchTransferERC1155(
  state: ERC1155State,
  from: string,
  to: string,
  tokenIds: readonly number[],
  amounts: readonly bigint[],
): ERC1155Result {
  if (tokenIds.length !== amounts.length) {
    return {
      success: false,
      newState: state,
      message: "Token IDs and amounts length mismatch",
    };
  }
  let current = state;
  for (let i = 0; i < tokenIds.length; i++) {
    const result = transferERC1155(
      current,
      from,
      to,
      tokenIds[i]!,
      amounts[i]!,
    );
    if (!result.success) {
      return {
        success: false,
        newState: state,
        message: `Batch failed at index ${i}: ${result.message}`,
      };
    }
    current = result.newState;
  }
  return {
    success: true,
    newState: current,
    message: `Batch transferred ${tokenIds.length} token types from ${from} to ${to}`,
  };
}

export function balanceOfERC1155(
  state: ERC1155State,
  account: string,
  tokenId: number,
): bigint {
  return state.balances[account]?.[tokenId] ?? BigInt(0);
}

export function balanceOfBatchERC1155(
  state: ERC1155State,
  accounts: readonly string[],
  tokenIds: readonly number[],
): readonly bigint[] {
  return accounts.map(
    (account, i) => state.balances[account]?.[tokenIds[i]!] ?? BigInt(0),
  );
}
