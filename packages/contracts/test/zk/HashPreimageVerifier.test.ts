import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("HashPreimageVerifier", function () {
  // Dummy proof values (the mock verifier ignores these)
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  async function deployWithTrueVerifier() {
    const [owner, other] = await ethers.getSigners();

    const MockVerifier1 = await ethers.getContractFactory("MockVerifier1");
    const verifier = await MockVerifier1.deploy(true);

    const HashPreimageVerifier = await ethers.getContractFactory(
      "HashPreimageVerifier",
    );
    const contract = await HashPreimageVerifier.deploy(
      await verifier.getAddress(),
    );

    return { contract, verifier, owner, other };
  }

  async function deployWithFalseVerifier() {
    const [owner, other] = await ethers.getSigners();

    const MockVerifier1 = await ethers.getContractFactory("MockVerifier1");
    const verifier = await MockVerifier1.deploy(false);

    const HashPreimageVerifier = await ethers.getContractFactory(
      "HashPreimageVerifier",
    );
    const contract = await HashPreimageVerifier.deploy(
      await verifier.getAddress(),
    );

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
  });

  describe("verifyPreimage", function () {
    it("should verify and mark hash as verified when proof is valid", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const hash = 12345n;
      const hashBytes = ethers.zeroPadValue(ethers.toBeHex(hash), 32);

      const result = await contract.verifyPreimage.staticCall(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        hash,
      );
      expect(result).to.be.true;

      // Execute the transaction
      await contract.verifyPreimage(DUMMY_PA, DUMMY_PB, DUMMY_PC, hash);

      expect(await contract.isHashVerified(hashBytes)).to.be.true;
    });

    it("should emit HashVerified event", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);
      const hash = 42n;
      const hashBytes = ethers.zeroPadValue(ethers.toBeHex(hash), 32);

      await expect(contract.verifyPreimage(DUMMY_PA, DUMMY_PB, DUMMY_PC, hash))
        .to.emit(contract, "HashVerified")
        .withArgs(hashBytes, owner.address, () => true);
    });

    it("should revert with HashAlreadyVerified when hash already verified", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const hash = 100n;

      await contract.verifyPreimage(DUMMY_PA, DUMMY_PB, DUMMY_PC, hash);

      await expect(
        contract.verifyPreimage(DUMMY_PA, DUMMY_PB, DUMMY_PC, hash),
      ).to.be.revertedWithCustomError(contract, "HashAlreadyVerified");
    });

    it("should revert with InvalidProof when verifier returns false", async function () {
      const { contract } = await loadFixture(deployWithFalseVerifier);
      const hash = 100n;

      await expect(
        contract.verifyPreimage(DUMMY_PA, DUMMY_PB, DUMMY_PC, hash),
      ).to.be.revertedWithCustomError(contract, "InvalidProof");
    });

    it("should allow different hashes to be verified independently", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await contract.verifyPreimage(DUMMY_PA, DUMMY_PB, DUMMY_PC, 1n);
      await contract.verifyPreimage(DUMMY_PA, DUMMY_PB, DUMMY_PC, 2n);

      const hash1Bytes = ethers.zeroPadValue(ethers.toBeHex(1n), 32);
      const hash2Bytes = ethers.zeroPadValue(ethers.toBeHex(2n), 32);

      expect(await contract.isHashVerified(hash1Bytes)).to.be.true;
      expect(await contract.isHashVerified(hash2Bytes)).to.be.true;
    });

    it("should allow any address to verify (not owner-restricted)", async function () {
      const { contract, other } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract
          .connect(other)
          .verifyPreimage(DUMMY_PA, DUMMY_PB, DUMMY_PC, 999n),
      ).to.not.be.reverted;
    });
  });

  describe("isHashVerified", function () {
    it("should return false for unverified hash", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const hashBytes = ethers.zeroPadValue(ethers.toBeHex(9999n), 32);
      expect(await contract.isHashVerified(hashBytes)).to.be.false;
    });
  });

  describe("getVerificationCount", function () {
    it("should return the informational string", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.getVerificationCount()).to.equal(
        "Use events to track count",
      );
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

      // New owner can transfer again
      await expect(contract.connect(other).transferOwnership(owner.address)).to
        .not.be.reverted;
    });

    it("should prevent old owner from calling onlyOwner functions after transfer", async function () {
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
