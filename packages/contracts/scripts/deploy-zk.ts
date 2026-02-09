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

  console.log("\nAll ZK contracts deployed!");
  console.log(
    "\nUpdate apps/web/lib/applied-zk/contracts.ts with the Groth16 verifier addresses above.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
