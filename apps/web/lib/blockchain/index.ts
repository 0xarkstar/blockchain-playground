export {
  hash,
  hashBytes,
  toBinaryString,
  computeAvalancheEffect,
} from "./hash";
export type { HashAlgorithm } from "./hash";

export {
  generateKeyPair,
  publicKeyToAddress,
  signMessage,
  verifySignature,
} from "./signature";
export type { KeyPair } from "./signature";

export { MerkleTree } from "./merkle";
export type { MerkleNode, MerkleProof } from "./merkle";

export {
  computeBlockHash,
  buildMerkleRoot,
  createGenesisBlock,
  createBlock,
  mineBlock,
  meetsTarget,
  createTransaction,
} from "./block";
export type { Transaction, BlockHeader, Block, MiningResult } from "./block";
