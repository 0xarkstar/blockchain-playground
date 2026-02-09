import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ZK Verifier Contracts", function () {
  describe("HashPreimageVerifier", function () {
    async function deployHashPreimage() {
      const [owner] = await ethers.getSigners();

      const Groth16 = await ethers.getContractFactory(
        "src/zk/verifiers/hash_preimageVerifier.sol:Groth16Verifier",
      );
      const groth16 = await Groth16.deploy();

      const HashPreimageVerifier =
        await ethers.getContractFactory("HashPreimageVerifier");
      const verifier = await HashPreimageVerifier.deploy(
        await groth16.getAddress(),
      );

      return { groth16, verifier, owner };
    }

    it("should deploy with verifier address", async function () {
      const { groth16, verifier, owner } =
        await loadFixture(deployHashPreimage);

      expect(await verifier.verifier()).to.equal(await groth16.getAddress());
      expect(await verifier.owner()).to.equal(owner.address);
    });

    it("should reject invalid proof", async function () {
      const { verifier } = await loadFixture(deployHashPreimage);

      const pA: [bigint, bigint] = [0n, 0n];
      const pB: [[bigint, bigint], [bigint, bigint]] = [
        [0n, 0n],
        [0n, 0n],
      ];
      const pC: [bigint, bigint] = [0n, 0n];
      const hash = 123n;

      await expect(verifier.verifyPreimage(pA, pB, pC, hash)).to.be.reverted;
    });
  });

  describe("AgeVerifier", function () {
    async function deployAgeVerifier() {
      const [owner] = await ethers.getSigners();

      const Groth16 = await ethers.getContractFactory(
        "src/zk/verifiers/age_verificationVerifier.sol:Groth16Verifier",
      );
      const groth16 = await Groth16.deploy();

      const AgeVerifier = await ethers.getContractFactory("AgeVerifier");
      const verifier = await AgeVerifier.deploy(await groth16.getAddress());

      return { groth16, verifier, owner };
    }

    it("should deploy with verifier address", async function () {
      const { groth16, verifier } = await loadFixture(deployAgeVerifier);

      expect(await verifier.verifier()).to.equal(await groth16.getAddress());
    });

    it("should reject invalid proof", async function () {
      const { verifier } = await loadFixture(deployAgeVerifier);

      const pA: [bigint, bigint] = [0n, 0n];
      const pB: [[bigint, bigint], [bigint, bigint]] = [
        [0n, 0n],
        [0n, 0n],
      ];
      const pC: [bigint, bigint] = [0n, 0n];

      await expect(verifier.verifyAge(pA, pB, pC, 18n, 20260209n, 42n)).to.be
        .reverted;
    });
  });

  describe("SecretVoting", function () {
    async function deploySecretVoting() {
      const [owner] = await ethers.getSigners();

      const Groth16 = await ethers.getContractFactory(
        "src/zk/verifiers/vote_demoVerifier.sol:Groth16Verifier",
      );
      const groth16 = await Groth16.deploy();

      const SecretVoting = await ethers.getContractFactory("SecretVoting");
      const voting = await SecretVoting.deploy(await groth16.getAddress());

      return { groth16, voting, owner };
    }

    it("should deploy and initialize correctly", async function () {
      const { groth16, voting } = await loadFixture(deploySecretVoting);

      expect(await voting.verifier()).to.equal(await groth16.getAddress());
      expect(await voting.votingActive()).to.equal(false);
      expect(await voting.voterCount()).to.equal(0n);
    });

    it("should allow owner to register voters", async function () {
      const { voting } = await loadFixture(deploySecretVoting);

      const commitment = ethers.keccak256(ethers.toUtf8Bytes("test-voter"));
      await voting.registerVoter(commitment);

      expect(await voting.voterCount()).to.equal(1n);
    });
  });

  describe("PrivateAirdrop", function () {
    async function deployPrivateAirdrop() {
      const [owner] = await ethers.getSigners();

      const Groth16 = await ethers.getContractFactory(
        "src/zk/verifiers/MerkleAirdropVerifier.sol:Groth16Verifier",
      );
      const groth16 = await Groth16.deploy();

      const PrivateAirdrop = await ethers.getContractFactory("PrivateAirdrop");
      const airdrop = await PrivateAirdrop.deploy(await groth16.getAddress());

      return { groth16, airdrop, owner };
    }

    it("should deploy and initialize correctly", async function () {
      const { groth16, airdrop } = await loadFixture(deployPrivateAirdrop);

      expect(await airdrop.verifier()).to.equal(await groth16.getAddress());
      expect(await airdrop.active()).to.equal(false);
    });

    it("should allow owner to initialize ETH airdrop", async function () {
      const { airdrop } = await loadFixture(deployPrivateAirdrop);

      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test-root"));
      await airdrop.initializeETHAirdrop(
        merkleRoot,
        ethers.parseEther("0.01"),
        {
          value: ethers.parseEther("1"),
        },
      );

      expect(await airdrop.active()).to.equal(true);
      expect(await airdrop.merkleRoot()).to.equal(merkleRoot);
    });
  });

  describe("Groth16 Verifiers (raw)", function () {
    it("should deploy all 4 verifier contracts", async function () {
      const factories = [
        "src/zk/verifiers/hash_preimageVerifier.sol:Groth16Verifier",
        "src/zk/verifiers/age_verificationVerifier.sol:Groth16Verifier",
        "src/zk/verifiers/vote_demoVerifier.sol:Groth16Verifier",
        "src/zk/verifiers/MerkleAirdropVerifier.sol:Groth16Verifier",
      ];

      for (const factoryName of factories) {
        const Factory = await ethers.getContractFactory(factoryName);
        const contract = await Factory.deploy();
        const addr = await contract.getAddress();
        expect(addr).to.not.equal(ethers.ZeroAddress);
      }
    });
  });
});
