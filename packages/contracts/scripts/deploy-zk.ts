import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ZK contracts with:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
  );

  // 1. Deploy Hash Preimage Groth16 Verifier
  console.log("\n--- Hash Preimage ---");
  const HashPreimageGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/hash_preimageVerifier.sol:Groth16Verifier",
  );
  const hashGroth16 = await HashPreimageGroth16.deploy();
  await hashGroth16.waitForDeployment();
  const hashGroth16Addr = await hashGroth16.getAddress();
  console.log("Groth16Verifier (hash_preimage):", hashGroth16Addr);

  const HashPreimageVerifier =
    await ethers.getContractFactory("HashPreimageVerifier");
  const hashVerifier = await HashPreimageVerifier.deploy(hashGroth16Addr);
  await hashVerifier.waitForDeployment();
  console.log("HashPreimageVerifier:", await hashVerifier.getAddress());

  // 2. Deploy Age Verification Groth16 Verifier
  console.log("\n--- Age Verification ---");
  const AgeGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/age_verificationVerifier.sol:Groth16Verifier",
  );
  const ageGroth16 = await AgeGroth16.deploy();
  await ageGroth16.waitForDeployment();
  const ageGroth16Addr = await ageGroth16.getAddress();
  console.log("Groth16Verifier (age_verification):", ageGroth16Addr);

  const AgeVerifier = await ethers.getContractFactory("AgeVerifier");
  const ageVerifier = await AgeVerifier.deploy(ageGroth16Addr);
  await ageVerifier.waitForDeployment();
  console.log("AgeVerifier:", await ageVerifier.getAddress());

  // 3. Deploy Secret Voting Groth16 Verifier
  console.log("\n--- Secret Voting ---");
  const VoteGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/vote_demoVerifier.sol:Groth16Verifier",
  );
  const voteGroth16 = await VoteGroth16.deploy();
  await voteGroth16.waitForDeployment();
  const voteGroth16Addr = await voteGroth16.getAddress();
  console.log("Groth16Verifier (vote_demo):", voteGroth16Addr);

  const SecretVoting = await ethers.getContractFactory("SecretVoting");
  const secretVoting = await SecretVoting.deploy(voteGroth16Addr);
  await secretVoting.waitForDeployment();
  console.log("SecretVoting:", await secretVoting.getAddress());

  // 4. Deploy Merkle Airdrop Groth16 Verifier
  console.log("\n--- Private Airdrop ---");
  const AirdropGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/MerkleAirdropVerifier.sol:Groth16Verifier",
  );
  const airdropGroth16 = await AirdropGroth16.deploy();
  await airdropGroth16.waitForDeployment();
  const airdropGroth16Addr = await airdropGroth16.getAddress();
  console.log("Groth16Verifier (merkle_airdrop):", airdropGroth16Addr);

  const PrivateAirdrop = await ethers.getContractFactory("PrivateAirdrop");
  const privateAirdrop = await PrivateAirdrop.deploy(airdropGroth16Addr);
  await privateAirdrop.waitForDeployment();
  console.log("PrivateAirdrop:", await privateAirdrop.getAddress());

  // 5. Deploy Password Proof Groth16 Verifier
  console.log("\n--- Password Proof ---");
  const PasswordGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/password_proofVerifier.sol:Groth16Verifier",
  );
  const passwordGroth16 = await PasswordGroth16.deploy();
  await passwordGroth16.waitForDeployment();
  const passwordGroth16Addr = await passwordGroth16.getAddress();
  console.log("Groth16Verifier (password_proof):", passwordGroth16Addr);

  const PasswordVerifier =
    await ethers.getContractFactory("PasswordVerifier");
  const passwordVerifier = await PasswordVerifier.deploy(passwordGroth16Addr);
  await passwordVerifier.waitForDeployment();
  console.log("PasswordVerifier:", await passwordVerifier.getAddress());

  // 6. Deploy Sudoku Groth16 Verifier
  console.log("\n--- Sudoku ---");
  const SudokuGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/sudokuVerifier.sol:Groth16Verifier",
  );
  const sudokuGroth16 = await SudokuGroth16.deploy();
  await sudokuGroth16.waitForDeployment();
  const sudokuGroth16Addr = await sudokuGroth16.getAddress();
  console.log("Groth16Verifier (sudoku):", sudokuGroth16Addr);

  const SudokuVerifier =
    await ethers.getContractFactory("SudokuVerifier");
  const sudokuVerifier = await SudokuVerifier.deploy(sudokuGroth16Addr);
  await sudokuVerifier.waitForDeployment();
  console.log("SudokuVerifier:", await sudokuVerifier.getAddress());

  // 7. Deploy Credential Groth16 Verifier
  console.log("\n--- Credential ---");
  const CredentialGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/credential_proofVerifier.sol:Groth16Verifier",
  );
  const credentialGroth16 = await CredentialGroth16.deploy();
  await credentialGroth16.waitForDeployment();
  const credentialGroth16Addr = await credentialGroth16.getAddress();
  console.log("Groth16Verifier (credential_proof):", credentialGroth16Addr);

  const CredentialVerifier =
    await ethers.getContractFactory("CredentialVerifier");
  const credentialVerifier = await CredentialVerifier.deploy(credentialGroth16Addr);
  await credentialVerifier.waitForDeployment();
  console.log("CredentialVerifier:", await credentialVerifier.getAddress());

  // 8. Deploy Mastermind Groth16 Verifier
  console.log("\n--- Mastermind ---");
  const MastermindGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/mastermindVerifier.sol:Groth16Verifier",
  );
  const mastermindGroth16 = await MastermindGroth16.deploy();
  await mastermindGroth16.waitForDeployment();
  const mastermindGroth16Addr = await mastermindGroth16.getAddress();
  console.log("Groth16Verifier (mastermind):", mastermindGroth16Addr);

  const MastermindGame =
    await ethers.getContractFactory("MastermindGame");
  const mastermindGame = await MastermindGame.deploy(mastermindGroth16Addr);
  await mastermindGame.waitForDeployment();
  console.log("MastermindGame:", await mastermindGame.getAddress());

  // 9. Deploy Mixer Groth16 Verifier
  console.log("\n--- Mixer ---");
  const MixerGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/mixer_demoVerifier.sol:Groth16Verifier",
  );
  const mixerGroth16 = await MixerGroth16.deploy();
  await mixerGroth16.waitForDeployment();
  const mixerGroth16Addr = await mixerGroth16.getAddress();
  console.log("Groth16Verifier (mixer_demo):", mixerGroth16Addr);

  const SimpleMixer =
    await ethers.getContractFactory("SimpleMixer");
  const simpleMixer = await SimpleMixer.deploy(mixerGroth16Addr);
  await simpleMixer.waitForDeployment();
  console.log("SimpleMixer:", await simpleMixer.getAddress());

  // 10. Deploy Private Club Groth16 Verifier
  console.log("\n--- Private Club ---");
  const ClubGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/private_membershipVerifier.sol:Groth16Verifier",
  );
  const clubGroth16 = await ClubGroth16.deploy();
  await clubGroth16.waitForDeployment();
  const clubGroth16Addr = await clubGroth16.getAddress();
  console.log("Groth16Verifier (private_membership):", clubGroth16Addr);

  const PrivateClub =
    await ethers.getContractFactory("PrivateClub");
  const privateClub = await PrivateClub.deploy(clubGroth16Addr);
  await privateClub.waitForDeployment();
  console.log("PrivateClub:", await privateClub.getAddress());

  // 11. Deploy Sealed Auction Groth16 Verifier
  console.log("\n--- Sealed Auction ---");
  const SealedGroth16 = await ethers.getContractFactory(
    "src/zk/verifiers/sealed_bidVerifier.sol:Groth16Verifier",
  );
  const sealedGroth16 = await SealedGroth16.deploy();
  await sealedGroth16.waitForDeployment();
  const sealedGroth16Addr = await sealedGroth16.getAddress();
  console.log("Groth16Verifier (sealed_bid):", sealedGroth16Addr);

  const SealedBidAuction =
    await ethers.getContractFactory("SealedBidAuction");
  const sealedBidAuction = await SealedBidAuction.deploy(sealedGroth16Addr);
  await sealedBidAuction.waitForDeployment();
  console.log("SealedBidAuction:", await sealedBidAuction.getAddress());

  console.log("\nAll ZK contracts deployed!");
  console.log(
    "\nUpdate apps/web/lib/applied-zk/contracts.ts with the Groth16 verifier addresses above.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
