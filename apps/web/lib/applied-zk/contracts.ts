// Deployed contract addresses on Base Sepolia
// Update these after deploying with: npx hardhat run scripts/deploy-zk.ts --network baseSepolia

import type { Address } from "viem";

export interface ZkContractAddresses {
  readonly hashPreimageVerifier: Address | null;
  readonly ageVerifier: Address | null;
  readonly secretVotingVerifier: Address | null;
  readonly merkleAirdropVerifier: Address | null;
}

// Set to null until contracts are deployed
// After deployment, update with actual addresses
export const ZK_CONTRACTS: ZkContractAddresses = {
  hashPreimageVerifier: null,
  ageVerifier: null,
  secretVotingVerifier: null,
  merkleAirdropVerifier: null,
};
