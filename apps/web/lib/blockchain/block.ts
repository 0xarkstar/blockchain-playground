import { hash, type HashAlgorithm } from "./hash";
import { MerkleTree } from "./merkle";

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  data?: string;
  timestamp: number;
}

export interface BlockHeader {
  version: number;
  previousHash: string;
  merkleRoot: string;
  timestamp: number;
  difficulty: number;
  nonce: number;
}

export interface Block {
  header: BlockHeader;
  hash: string;
  transactions: Transaction[];
  index: number;
}

export function computeBlockHash(header: BlockHeader): string {
  const data = [
    header.version.toString(),
    header.previousHash,
    header.merkleRoot,
    header.timestamp.toString(),
    header.difficulty.toString(),
    header.nonce.toString(),
  ].join("");
  return hash(data, "sha256");
}

export function buildMerkleRoot(transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return hash("empty", "sha256");
  }
  const txHashes = transactions.map((tx) =>
    JSON.stringify({ from: tx.from, to: tx.to, amount: tx.amount, data: tx.data })
  );
  const tree = new MerkleTree(txHashes, "sha256");
  return tree.root.hash;
}

export function createGenesisBlock(): Block {
  const header: BlockHeader = {
    version: 1,
    previousHash: "0x" + "0".repeat(64),
    merkleRoot: hash("genesis", "sha256"),
    timestamp: Date.now(),
    difficulty: 1,
    nonce: 0,
  };

  return {
    header,
    hash: computeBlockHash(header),
    transactions: [],
    index: 0,
  };
}

export function createBlock(
  previousBlock: Block,
  transactions: Transaction[],
  difficulty: number
): Block {
  const merkleRoot = buildMerkleRoot(transactions);
  const header: BlockHeader = {
    version: 1,
    previousHash: previousBlock.hash,
    merkleRoot,
    timestamp: Date.now(),
    difficulty,
    nonce: 0,
  };

  return {
    header,
    hash: computeBlockHash(header),
    transactions,
    index: previousBlock.index + 1,
  };
}

export function meetsTarget(blockHash: string, difficulty: number): boolean {
  const clean = blockHash.startsWith("0x") ? blockHash.slice(2) : blockHash;
  const prefix = "0".repeat(difficulty);
  return clean.startsWith(prefix);
}

export interface MiningResult {
  block: Block;
  nonce: number;
  hashesComputed: number;
  timeMs: number;
}

export function mineBlock(block: Block, maxIterations = 1_000_000): MiningResult {
  const start = performance.now();
  let hashesComputed = 0;

  const updatedHeader = { ...block.header };

  for (let nonce = 0; nonce < maxIterations; nonce++) {
    updatedHeader.nonce = nonce;
    const blockHash = computeBlockHash(updatedHeader);
    hashesComputed++;

    if (meetsTarget(blockHash, block.header.difficulty)) {
      return {
        block: { ...block, header: updatedHeader, hash: blockHash },
        nonce,
        hashesComputed,
        timeMs: performance.now() - start,
      };
    }
  }

  const finalHash = computeBlockHash(updatedHeader);
  return {
    block: { ...block, header: updatedHeader, hash: finalHash },
    nonce: updatedHeader.nonce,
    hashesComputed,
    timeMs: performance.now() - start,
  };
}

export function createTransaction(
  from: string,
  to: string,
  amount: number,
  data?: string
): Transaction {
  return {
    id: hash(`${from}${to}${amount}${Date.now()}${Math.random()}`, "sha256").slice(0, 18),
    from,
    to,
    amount,
    data,
    timestamp: Date.now(),
  };
}
