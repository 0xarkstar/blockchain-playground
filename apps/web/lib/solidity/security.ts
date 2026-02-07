export interface CallFrame {
  readonly id: number;
  readonly depth: number;
  readonly caller: string;
  readonly target: string;
  readonly functionName: string;
  readonly ethValue: number;
  readonly status: "success" | "reverted" | "pending";
  readonly description: string;
}

export interface AttackSimulation {
  readonly frames: readonly CallFrame[];
  readonly initialBalances: { readonly victim: number; readonly attacker: number };
  readonly finalBalances: { readonly victim: number; readonly attacker: number };
  readonly attackerProfit: number;
  readonly attackSuccessful: boolean;
  readonly totalReentrancyDepth: number;
}

const MAX_DEPTH = 10;

export function simulateReentrancyAttack(
  victimBalance: number,
  attackerDeposit: number,
  maxDepth: number
): AttackSimulation {
  if (victimBalance < 0 || attackerDeposit <= 0 || maxDepth <= 0) {
    return {
      frames: [],
      initialBalances: { victim: victimBalance, attacker: 0 },
      finalBalances: { victim: victimBalance, attacker: 0 },
      attackerProfit: 0,
      attackSuccessful: false,
      totalReentrancyDepth: 0,
    };
  }

  const cappedDepth = Math.min(maxDepth, MAX_DEPTH);
  const frames: CallFrame[] = [];
  let frameId = 0;

  let victimBal = victimBalance + attackerDeposit;
  let attackerBal = 0;
  let attackerContractBal = 0;
  const withdrawAmount = attackerDeposit;

  // Attacker deposits
  frames.push({
    id: frameId++,
    depth: 0,
    caller: "Attacker",
    target: "Victim",
    functionName: "deposit",
    ethValue: attackerDeposit,
    status: "success",
    description: `Attacker deposits ${attackerDeposit} ETH into Victim contract`,
  });

  // Attacker calls withdraw
  frames.push({
    id: frameId++,
    depth: 0,
    caller: "Attacker",
    target: "Victim",
    functionName: "withdraw",
    ethValue: 0,
    status: "success",
    description: `Attacker calls withdraw() for ${withdrawAmount} ETH`,
  });

  let depth = 0;
  while (depth < cappedDepth && victimBal >= withdrawAmount) {
    // Victim sends ETH (before updating balance — the vulnerability)
    frames.push({
      id: frameId++,
      depth: depth + 1,
      caller: "Victim",
      target: "Attacker",
      functionName: "receive",
      ethValue: withdrawAmount,
      status: "success",
      description: `Victim sends ${withdrawAmount} ETH to Attacker (balance NOT yet updated)`,
    });

    victimBal -= withdrawAmount;
    attackerContractBal += withdrawAmount;

    if (depth + 1 < cappedDepth && victimBal >= withdrawAmount) {
      // Attacker re-enters
      frames.push({
        id: frameId++,
        depth: depth + 1,
        caller: "Attacker",
        target: "Victim",
        functionName: "withdraw",
        ethValue: 0,
        status: "success",
        description: `Attacker re-enters withdraw() (depth ${depth + 2})`,
      });
    }

    depth++;
  }

  // Final: attacker withdraws from their contract
  attackerBal = attackerContractBal;

  return {
    frames,
    initialBalances: { victim: victimBalance, attacker: attackerDeposit },
    finalBalances: { victim: victimBal, attacker: attackerBal },
    attackerProfit: attackerBal - attackerDeposit,
    attackSuccessful: attackerBal > attackerDeposit,
    totalReentrancyDepth: depth,
  };
}

export function simulateWithReentrancyGuard(
  victimBalance: number,
  attackerDeposit: number
): AttackSimulation {
  if (victimBalance < 0 || attackerDeposit <= 0) {
    return {
      frames: [],
      initialBalances: { victim: victimBalance, attacker: 0 },
      finalBalances: { victim: victimBalance, attacker: 0 },
      attackerProfit: 0,
      attackSuccessful: false,
      totalReentrancyDepth: 0,
    };
  }

  const frames: CallFrame[] = [];
  let frameId = 0;

  const victimBal = victimBalance;
  const withdrawAmount = attackerDeposit;

  frames.push({
    id: frameId++,
    depth: 0,
    caller: "Attacker",
    target: "Victim",
    functionName: "deposit",
    ethValue: attackerDeposit,
    status: "success",
    description: `Attacker deposits ${attackerDeposit} ETH into Victim contract`,
  });

  frames.push({
    id: frameId++,
    depth: 0,
    caller: "Attacker",
    target: "Victim",
    functionName: "withdraw",
    ethValue: 0,
    status: "success",
    description: `Attacker calls withdraw() — mutex locked`,
  });

  frames.push({
    id: frameId++,
    depth: 1,
    caller: "Victim",
    target: "Attacker",
    functionName: "receive",
    ethValue: withdrawAmount,
    status: "success",
    description: `Victim sends ${withdrawAmount} ETH to Attacker`,
  });

  frames.push({
    id: frameId++,
    depth: 1,
    caller: "Attacker",
    target: "Victim",
    functionName: "withdraw",
    ethValue: 0,
    status: "reverted",
    description: "ReentrancyGuard: reentrant call — REVERTED",
  });

  return {
    frames,
    initialBalances: { victim: victimBalance, attacker: attackerDeposit },
    finalBalances: { victim: victimBal, attacker: attackerDeposit },
    attackerProfit: 0,
    attackSuccessful: false,
    totalReentrancyDepth: 1,
  };
}

export function simulateChecksEffectsInteractions(
  victimBalance: number,
  attackerDeposit: number
): AttackSimulation {
  if (victimBalance < 0 || attackerDeposit <= 0) {
    return {
      frames: [],
      initialBalances: { victim: victimBalance, attacker: 0 },
      finalBalances: { victim: victimBalance, attacker: 0 },
      attackerProfit: 0,
      attackSuccessful: false,
      totalReentrancyDepth: 0,
    };
  }

  const frames: CallFrame[] = [];
  let frameId = 0;

  const victimBal = victimBalance;
  const withdrawAmount = attackerDeposit;

  frames.push({
    id: frameId++,
    depth: 0,
    caller: "Attacker",
    target: "Victim",
    functionName: "deposit",
    ethValue: attackerDeposit,
    status: "success",
    description: `Attacker deposits ${attackerDeposit} ETH into Victim contract`,
  });

  frames.push({
    id: frameId++,
    depth: 0,
    caller: "Attacker",
    target: "Victim",
    functionName: "withdraw",
    ethValue: 0,
    status: "success",
    description: "Attacker calls withdraw() — checks pass, balance set to 0 BEFORE send",
  });

  frames.push({
    id: frameId++,
    depth: 1,
    caller: "Victim",
    target: "Attacker",
    functionName: "receive",
    ethValue: withdrawAmount,
    status: "success",
    description: `Victim sends ${withdrawAmount} ETH to Attacker`,
  });

  frames.push({
    id: frameId++,
    depth: 1,
    caller: "Attacker",
    target: "Victim",
    functionName: "withdraw",
    ethValue: 0,
    status: "reverted",
    description: "Balance already 0 — withdraw reverts (check fails)",
  });

  return {
    frames,
    initialBalances: { victim: victimBalance, attacker: attackerDeposit },
    finalBalances: { victim: victimBal, attacker: attackerDeposit },
    attackerProfit: 0,
    attackSuccessful: false,
    totalReentrancyDepth: 1,
  };
}
