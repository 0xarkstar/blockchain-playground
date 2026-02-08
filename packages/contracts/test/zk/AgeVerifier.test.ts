import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("AgeVerifier", function () {
  // Dummy proof values (the mock verifier ignores these)
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  async function deployWithTrueVerifier() {
    const [owner, other] = await ethers.getSigners();

    const MockVerifier3 = await ethers.getContractFactory("MockVerifier3");
    const verifier = await MockVerifier3.deploy(true);

    const AgeVerifier = await ethers.getContractFactory("AgeVerifier");
    const contract = await AgeVerifier.deploy(await verifier.getAddress());

    return { contract, verifier, owner, other };
  }

  async function deployWithFalseVerifier() {
    const [owner, other] = await ethers.getSigners();

    const MockVerifier3 = await ethers.getContractFactory("MockVerifier3");
    const verifier = await MockVerifier3.deploy(false);

    const AgeVerifier = await ethers.getContractFactory("AgeVerifier");
    const contract = await AgeVerifier.deploy(await verifier.getAddress());

    return { contract, verifier, owner, other };
  }

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should set the deployer as owner", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("should store the verifier address as immutable", async function () {
      const { contract, verifier } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.verifier()).to.equal(await verifier.getAddress());
    });

    it("should start with zero totalVerifications", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.totalVerifications()).to.equal(0n);
    });
  });

  describe("verifyAge", function () {
    const MIN_AGE = 18n;
    const CURRENT_DATE = 20260208n;
    const IDENTITY_COMMITMENT = 12345n;

    it("should verify age and return true when proof is valid", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      const result = await contract.verifyAge.staticCall(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        MIN_AGE,
        CURRENT_DATE,
        IDENTITY_COMMITMENT,
      );
      expect(result).to.be.true;
    });

    it("should increment totalVerifications on success", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await contract.verifyAge(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        MIN_AGE,
        CURRENT_DATE,
        IDENTITY_COMMITMENT,
      );
      expect(await contract.totalVerifications()).to.equal(1n);
    });

    it("should mark the nullifier as used", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      const nullifier = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "uint256"],
          [IDENTITY_COMMITMENT, MIN_AGE],
        ),
      );

      await contract.verifyAge(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        MIN_AGE,
        CURRENT_DATE,
        IDENTITY_COMMITMENT,
      );

      expect(await contract.isNullifierUsed(nullifier)).to.be.true;
    });

    it("should emit AgeVerified event", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract.verifyAge(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          MIN_AGE,
          CURRENT_DATE,
          IDENTITY_COMMITMENT,
        ),
      )
        .to.emit(contract, "AgeVerified")
        .withArgs(owner.address, MIN_AGE, CURRENT_DATE, () => true);
    });

    it("should revert with InvalidProof when verifier returns false", async function () {
      const { contract } = await loadFixture(deployWithFalseVerifier);

      await expect(
        contract.verifyAge(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          MIN_AGE,
          CURRENT_DATE,
          IDENTITY_COMMITMENT,
        ),
      ).to.be.revertedWithCustomError(contract, "InvalidProof");
    });

    it("should allow re-verification with different minAge (different nullifier)", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      // First verification with minAge=18
      await contract.verifyAge(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        18n,
        CURRENT_DATE,
        IDENTITY_COMMITMENT,
      );

      // Second verification with minAge=21 (different nullifier)
      await expect(
        contract.verifyAge(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          21n,
          CURRENT_DATE,
          IDENTITY_COMMITMENT,
        ),
      ).to.not.be.reverted;

      expect(await contract.totalVerifications()).to.equal(2n);
    });

    it("should allow any address to verify (not owner-restricted)", async function () {
      const { contract, other } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract
          .connect(other)
          .verifyAge(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            MIN_AGE,
            CURRENT_DATE,
            IDENTITY_COMMITMENT,
          ),
      ).to.not.be.reverted;
    });

    it("should allow same nullifier to be used again (contract does not revert on reuse)", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      // The contract marks the nullifier but does NOT check for reuse
      // Verify this behavior: calling with same params should succeed
      await contract.verifyAge(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        MIN_AGE,
        CURRENT_DATE,
        IDENTITY_COMMITMENT,
      );

      // Same params again -- contract does not have a "already used" check
      await expect(
        contract.verifyAge(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          MIN_AGE,
          CURRENT_DATE,
          IDENTITY_COMMITMENT,
        ),
      ).to.not.be.reverted;

      expect(await contract.totalVerifications()).to.equal(2n);
    });
  });

  describe("isNullifierUsed", function () {
    it("should return false for unused nullifier", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const randomNullifier = ethers.keccak256(ethers.toUtf8Bytes("random"));
      expect(await contract.isNullifierUsed(randomNullifier)).to.be.false;
    });
  });

  describe("transferOwnership", function () {
    it("should transfer ownership when called by owner", async function () {
      const { contract, owner, other } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract.connect(owner).transferOwnership(other.address);
      expect(await contract.owner()).to.equal(other.address);
    });

    it("should revert with OnlyOwner when called by non-owner", async function () {
      const { contract, other } = await loadFixture(deployWithTrueVerifier);
      await expect(
        contract.connect(other).transferOwnership(other.address),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });

    it("should allow new owner to call onlyOwner functions", async function () {
      const { contract, owner, other } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract.connect(owner).transferOwnership(other.address);
      await expect(contract.connect(other).transferOwnership(owner.address)).to
        .not.be.reverted;
    });

    it("should prevent old owner from calling onlyOwner functions", async function () {
      const { contract, owner, other } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract.connect(owner).transferOwnership(other.address);
      await expect(
        contract.connect(owner).transferOwnership(owner.address),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });
  });
});
