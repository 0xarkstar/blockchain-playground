// Deployed contract addresses on Base Sepolia
// Update these after deploying with: npx hardhat run scripts/deploy-zk.ts --network baseSepolia

import type { Address } from "viem";

export interface ZkContractAddresses {
  readonly hashPreimageVerifier: Address | null;
  readonly ageVerifier: Address | null;
  readonly secretVotingVerifier: Address | null;
  readonly merkleAirdropVerifier: Address | null;
  readonly passwordVerifier: Address | null;
  readonly sudokuVerifier: Address | null;
  readonly credentialVerifier: Address | null;
  readonly mastermindVerifier: Address | null;
  readonly mixerVerifier: Address | null;
  readonly privateClubVerifier: Address | null;
  readonly sealedAuctionVerifier: Address | null;
}

// Set to null until contracts are deployed
// After deployment, update with actual addresses
export const ZK_CONTRACTS: ZkContractAddresses = {
  hashPreimageVerifier: null,
  ageVerifier: null,
  secretVotingVerifier: null,
  merkleAirdropVerifier: null,
  passwordVerifier: null,
  sudokuVerifier: null,
  credentialVerifier: null,
  mastermindVerifier: null,
  mixerVerifier: null,
  privateClubVerifier: null,
  sealedAuctionVerifier: null,
};
