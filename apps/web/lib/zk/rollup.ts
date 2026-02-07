/**
 * ZK Rollup Simulator — batch transactions off-chain, post proof on-chain.
 *
 * Models the core mechanics:
 *   1. L2 state: account balances with a state root (hash of all balances)
 *   2. Batch processing: execute N transfers, produce new state root + proof
 *   3. Compression: compare L1 vs L2 gas costs
 *
 * Real rollups (zkSync, StarkNet) use SNARKs/STARKs for validity proofs.
 * This simulation uses hash commitments as a stand-in.
 */

import { hashToHex, type HashScheme } from "./commitment";

// ── Types ──────────────────────────────────────────────────────────────

export interface RollupAccount {
  readonly address: string;
  readonly balance: bigint;
  readonly nonce: number;
}

export interface RollupState {
  readonly accounts: readonly RollupAccount[];
  readonly stateRoot: string;
  readonly blockNumber: number;
}

export interface RollupTransaction {
  readonly from: string;
  readonly to: string;
  readonly amount: bigint;
}

export interface ProcessedTx {
  readonly tx: RollupTransaction;
  readonly success: boolean;
  readonly message: string;
}

export interface BatchResult {
  readonly batchNumber: number;
  readonly transactions: readonly ProcessedTx[];
  readonly preStateRoot: string;
  readonly postStateRoot: string;
  readonly proofHash: string;
  readonly newState: RollupState;
  readonly successCount: number;
  readonly failCount: number;
}

export interface CompressionAnalysis {
  readonly txCount: number;
  readonly l1GasPerTx: number;
  readonly l2GasPerTx: number;
  readonly l1TotalGas: number;
  readonly l2TotalGas: number;
  readonly l2ProofGas: number;
  readonly savings: number; // percentage
  readonly compressionRatio: number;
}

// ── State management ───────────────────────────────────────────────────

function computeStateRoot(
  accounts: readonly RollupAccount[],
  scheme: HashScheme = "sha256"
): string {
  const data = accounts
    .map((a) => `${a.address}:${a.balance}:${a.nonce}`)
    .join("|");
  return hashToHex(data, scheme);
}

/** Create initial rollup state from a list of accounts. */
export function createRollupState(
  accounts: readonly { address: string; balance: bigint }[]
): RollupState {
  const accts: RollupAccount[] = accounts.map((a) => ({
    address: a.address,
    balance: a.balance,
    nonce: 0,
  }));
  return {
    accounts: accts,
    stateRoot: computeStateRoot(accts),
    blockNumber: 0,
  };
}

/** Process a batch of transactions, returning new state + proof hash. */
export function processBatch(
  state: RollupState,
  transactions: readonly RollupTransaction[]
): BatchResult {
  const preStateRoot = state.stateRoot;
  let currentAccounts = [...state.accounts.map((a) => ({ ...a }))];
  const processed: ProcessedTx[] = [];

  for (const tx of transactions) {
    const fromIdx = currentAccounts.findIndex((a) => a.address === tx.from);
    const toIdx = currentAccounts.findIndex((a) => a.address === tx.to);

    if (fromIdx === -1) {
      processed.push({ tx, success: false, message: `Sender ${tx.from} not found` });
      continue;
    }
    if (toIdx === -1) {
      processed.push({ tx, success: false, message: `Recipient ${tx.to} not found` });
      continue;
    }
    if (tx.amount <= 0n) {
      processed.push({ tx, success: false, message: "Amount must be positive" });
      continue;
    }
    if (currentAccounts[fromIdx].balance < tx.amount) {
      processed.push({ tx, success: false, message: "Insufficient balance" });
      continue;
    }

    // Apply transfer (create new account objects)
    currentAccounts = currentAccounts.map((a, i) => {
      if (i === fromIdx) {
        return { ...a, balance: a.balance - tx.amount, nonce: a.nonce + 1 };
      }
      if (i === toIdx) {
        return { ...a, balance: a.balance + tx.amount };
      }
      return a;
    });

    processed.push({
      tx,
      success: true,
      message: `Transferred ${tx.amount} from ${tx.from} to ${tx.to}`,
    });
  }

  const postStateRoot = computeStateRoot(currentAccounts);

  // Proof hash: hash(preRoot || postRoot || txData)
  const txData = processed
    .filter((p) => p.success)
    .map((p) => `${p.tx.from}->${p.tx.to}:${p.tx.amount}`)
    .join(",");
  const proofHash = hashToHex(`${preStateRoot}|${postStateRoot}|${txData}`);

  const newState: RollupState = {
    accounts: currentAccounts,
    stateRoot: postStateRoot,
    blockNumber: state.blockNumber + 1,
  };

  return {
    batchNumber: state.blockNumber + 1,
    transactions: processed,
    preStateRoot,
    postStateRoot,
    proofHash,
    newState,
    successCount: processed.filter((p) => p.success).length,
    failCount: processed.filter((p) => !p.success).length,
  };
}

/** Compare L1 vs L2 gas costs for a given batch size. */
export function calculateCompression(txCount: number): CompressionAnalysis {
  // Approximate gas costs (Ethereum-like)
  const l1GasPerTx = 21000 + 16 * 68; // base + calldata for a simple transfer
  const l2GasPerTx = 500; // compressed calldata on L2
  const l2ProofGas = 500000; // fixed cost of verifying the ZK proof on L1

  const l1TotalGas = l1GasPerTx * txCount;
  const l2TotalGas = l2GasPerTx * txCount + l2ProofGas;

  const savings =
    l1TotalGas > 0
      ? Math.round(((l1TotalGas - l2TotalGas) / l1TotalGas) * 100)
      : 0;

  const compressionRatio =
    l2TotalGas > 0 ? Math.round((l1TotalGas / l2TotalGas) * 100) / 100 : 0;

  return {
    txCount,
    l1GasPerTx,
    l2GasPerTx,
    l1TotalGas,
    l2TotalGas,
    l2ProofGas,
    savings,
    compressionRatio,
  };
}
