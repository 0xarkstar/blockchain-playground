import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("PasswordVerifier", function () {
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  async function deployWithTrueVerifier() {
    const [owner, other] = await ethers.getSigners();

    const MockVerifier2 = await ethers.getContractFactory("MockVerifier2");
    const verifier = await MockVerifier2.deploy(true);

    const PasswordVerifier =
      await ethers.getContractFactory("PasswordVerifier");
    const contract = await PasswordVerifier.deploy(
      await verifier.getAddress(),
    );

    return { contract, verifier, owner, other };
  }

  async function deployWithFalseVerifier() {
    const [owner, other] = await ethers.getSigners();

    const MockVerifier2 = await ethers.getContractFactory("MockVerifier2");
    const verifier = await MockVerifier2.deploy(false);

    const PasswordVerifier =
      await ethers.getContractFactory("PasswordVerifier");
    const contract = await PasswordVerifier.deploy(
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

    it("should initialize totalVerifications to 0", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.totalVerifications()).to.equal(0);
    });
  });

  describe("verifyPassword", function () {
    it("should verify and mark password as verified when proof is valid", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const hash = 12345n;
      const salt = 67890n;

      const result = await contract.verifyPassword.staticCall(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        hash,
        salt,
      );
      expect(result).to.be.true;

      await contract.verifyPassword(DUMMY_PA, DUMMY_PB, DUMMY_PC, hash, salt);

      const passwordKey = ethers.solidityPackedKeccak256(
        ["uint256", "uint256"],
        [hash, salt],
      );
      expect(await contract.isPasswordVerified(passwordKey)).to.be.true;
    });

    it("should emit PasswordVerified event", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);
      const hash = 42n;
      const salt = 100n;

      const passwordKey = ethers.solidityPackedKeccak256(
        ["uint256", "uint256"],
        [hash, salt],
      );

      await expect(
        contract.verifyPassword(DUMMY_PA, DUMMY_PB, DUMMY_PC, hash, salt),
      )
        .to.emit(contract, "PasswordVerified")
        .withArgs(owner.address, passwordKey, () => true);
    });

    it("should increment totalVerifications", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      await contract.verifyPassword(DUMMY_PA, DUMMY_PB, DUMMY_PC, 1n, 2n);
      expect(await contract.totalVerifications()).to.equal(1);

      await contract.verifyPassword(DUMMY_PA, DUMMY_PB, DUMMY_PC, 3n, 4n);
      expect(await contract.totalVerifications()).to.equal(2);
    });

    it("should revert with PasswordAlreadyVerified when already verified", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const hash = 100n;
      const salt = 200n;

      await contract.verifyPassword(DUMMY_PA, DUMMY_PB, DUMMY_PC, hash, salt);

      await expect(
        contract.verifyPassword(DUMMY_PA, DUMMY_PB, DUMMY_PC, hash, salt),
      ).to.be.revertedWithCustomError(contract, "PasswordAlreadyVerified");
    });

    it("should revert with InvalidProof when verifier returns false", async function () {
      const { contract } = await loadFixture(deployWithFalseVerifier);

      await expect(
        contract.verifyPassword(DUMMY_PA, DUMMY_PB, DUMMY_PC, 100n, 200n),
      ).to.be.revertedWithCustomError(contract, "InvalidProof");
    });

    it("should allow different password+salt combos independently", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await contract.verifyPassword(DUMMY_PA, DUMMY_PB, DUMMY_PC, 1n, 10n);
      await contract.verifyPassword(DUMMY_PA, DUMMY_PB, DUMMY_PC, 2n, 20n);

      const key1 = ethers.solidityPackedKeccak256(
        ["uint256", "uint256"],
        [1n, 10n],
      );
      const key2 = ethers.solidityPackedKeccak256(
        ["uint256", "uint256"],
        [2n, 20n],
      );

      expect(await contract.isPasswordVerified(key1)).to.be.true;
      expect(await contract.isPasswordVerified(key2)).to.be.true;
    });

    it("should allow any address to verify", async function () {
      const { contract, other } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract
          .connect(other)
          .verifyPassword(DUMMY_PA, DUMMY_PB, DUMMY_PC, 999n, 1n),
      ).to.not.be.reverted;
    });
  });

  describe("isPasswordVerified", function () {
    it("should return false for unverified password", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const key = ethers.solidityPackedKeccak256(
        ["uint256", "uint256"],
        [9999n, 1n],
      );
      expect(await contract.isPasswordVerified(key)).to.be.false;
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
  });
});
