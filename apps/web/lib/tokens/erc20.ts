export interface ERC20State {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly totalSupply: bigint;
  readonly balances: Readonly<Record<string, bigint>>;
  readonly allowances: Readonly<Record<string, Readonly<Record<string, bigint>>>>;
}

export interface TransferResult {
  readonly success: boolean;
  readonly newState: ERC20State;
  readonly message: string;
}

export function createERC20(
  name: string,
  symbol: string,
  decimals: number = 18
): ERC20State {
  return { name, symbol, decimals, totalSupply: BigInt(0), balances: {}, allowances: {} };
}

export function mint(
  state: ERC20State,
  to: string,
  amount: bigint
): TransferResult {
  if (amount <= BigInt(0)) {
    return { success: false, newState: state, message: "Amount must be positive" };
  }
  const toBalance = state.balances[to] ?? BigInt(0);
  return {
    success: true,
    newState: {
      ...state,
      totalSupply: state.totalSupply + amount,
      balances: { ...state.balances, [to]: toBalance + amount },
    },
    message: `Minted ${amount} to ${to}`,
  };
}

export function burn(
  state: ERC20State,
  from: string,
  amount: bigint
): TransferResult {
  if (amount <= BigInt(0)) {
    return { success: false, newState: state, message: "Amount must be positive" };
  }
  const fromBalance = state.balances[from] ?? BigInt(0);
  if (fromBalance < amount) {
    return { success: false, newState: state, message: "Insufficient balance" };
  }
  return {
    success: true,
    newState: {
      ...state,
      totalSupply: state.totalSupply - amount,
      balances: { ...state.balances, [from]: fromBalance - amount },
    },
    message: `Burned ${amount} from ${from}`,
  };
}

export function transfer(
  state: ERC20State,
  from: string,
  to: string,
  amount: bigint
): TransferResult {
  if (amount <= BigInt(0)) {
    return { success: false, newState: state, message: "Amount must be positive" };
  }
  if (from === to) {
    return { success: false, newState: state, message: "Cannot transfer to self" };
  }
  const fromBalance = state.balances[from] ?? BigInt(0);
  if (fromBalance < amount) {
    return { success: false, newState: state, message: "Insufficient balance" };
  }
  const toBalance = state.balances[to] ?? BigInt(0);
  return {
    success: true,
    newState: {
      ...state,
      balances: {
        ...state.balances,
        [from]: fromBalance - amount,
        [to]: toBalance + amount,
      },
    },
    message: `Transferred ${amount} from ${from} to ${to}`,
  };
}

export function approve(
  state: ERC20State,
  owner: string,
  spender: string,
  amount: bigint
): TransferResult {
  if (amount < BigInt(0)) {
    return { success: false, newState: state, message: "Amount cannot be negative" };
  }
  const ownerAllowances = state.allowances[owner] ?? {};
  return {
    success: true,
    newState: {
      ...state,
      allowances: {
        ...state.allowances,
        [owner]: { ...ownerAllowances, [spender]: amount },
      },
    },
    message: `${owner} approved ${spender} for ${amount}`,
  };
}

export function transferFrom(
  state: ERC20State,
  spender: string,
  from: string,
  to: string,
  amount: bigint
): TransferResult {
  if (amount <= BigInt(0)) {
    return { success: false, newState: state, message: "Amount must be positive" };
  }
  const allowance = state.allowances[from]?.[spender] ?? BigInt(0);
  if (allowance < amount) {
    return { success: false, newState: state, message: `Insufficient allowance: ${allowance} < ${amount}` };
  }
  const fromBalance = state.balances[from] ?? BigInt(0);
  if (fromBalance < amount) {
    return { success: false, newState: state, message: "Insufficient balance" };
  }
  const toBalance = state.balances[to] ?? BigInt(0);
  const ownerAllowances = state.allowances[from] ?? {};
  return {
    success: true,
    newState: {
      ...state,
      balances: {
        ...state.balances,
        [from]: fromBalance - amount,
        [to]: toBalance + amount,
      },
      allowances: {
        ...state.allowances,
        [from]: { ...ownerAllowances, [spender]: allowance - amount },
      },
    },
    message: `${spender} transferred ${amount} from ${from} to ${to}`,
  };
}

export function balanceOf(state: ERC20State, account: string): bigint {
  return state.balances[account] ?? BigInt(0);
}

export function allowance(state: ERC20State, owner: string, spender: string): bigint {
  return state.allowances[owner]?.[spender] ?? BigInt(0);
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  const str = amount.toString();
  if (decimals === 0) return str;
  if (str.length <= decimals) {
    const padded = str.padStart(decimals, "0").replace(/0+$/, "");
    return padded ? "0." + padded : "0";
  }
  const intPart = str.slice(0, str.length - decimals);
  const decPart = str.slice(str.length - decimals).replace(/0+$/, "");
  return decPart ? `${intPart}.${decPart}` : intPart;
}
