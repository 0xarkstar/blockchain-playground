import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("CredentialVerifier", function () {
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  async function deployWithTrueVerifier() {
    const [owner, other] = await ethers.getSigners();

    const MockVerifier5_uint256 = await ethers.getContractFactory(
      "MockVerifier5_uint256",
    );
    const verifier = await MockVerifier5_uint256.deploy(true);

    const CredentialVerifier =
      await ethers.getContractFactory("CredentialVerifier");
    const contract = await CredentialVerifier.deploy(
      await verifier.getAddress(),
    );

    return { contract, verifier, owner, other };
  }

  async function deployWithFalseVerifier() {
    const [owner, other] = await ethers.getSigners();

    const MockVerifier5_uint256 = await ethers.getContractFactory(
      "MockVerifier5_uint256",
    );
    const verifier = await MockVerifier5_uint256.deploy(false);

    const CredentialVerifier =
      await ethers.getContractFactory("CredentialVerifier");
    const contract = await CredentialVerifier.deploy(
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

    it("should store the verifier address", async function () {
      const { contract, verifier } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.verifier()).to.equal(await verifier.getAddress());
    });

    it("should initialize totalVerifications to 0", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.totalVerifications()).to.equal(0);
    });
  });

  describe("verifyCredential", function () {
    it("should verify and record credential when proof is valid", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);
      const credentialType = 1n; // e.g., age
      const threshold = 18n;
      const issuerPubkey = 12345n;
      const nullifier = 99999n;
      const merkleRoot = 54321n;

      await contract.verifyCredential(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        credentialType,
        threshold,
        issuerPubkey,
        nullifier,
        merkleRoot,
      );

      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(nullifier), 32);
      expect(await contract.isNullifierUsed(nullifierHash)).to.be.true;
      expect(await contract.totalVerifications()).to.equal(1);
    });

    it("should emit CredentialVerified event", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);
      const nullifier = 11111n;
      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(nullifier), 32);

      await expect(
        contract.verifyCredential(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          1n,
          18n,
          12345n,
          nullifier,
          54321n,
        ),
      )
        .to.emit(contract, "CredentialVerified")
        .withArgs(owner.address, nullifierHash, 1n, () => true);
    });

    it("should revert with NullifierAlreadyUsed for same nullifier", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const nullifier = 77777n;

      await contract.verifyCredential(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        1n,
        18n,
        12345n,
        nullifier,
        54321n,
      );

      await expect(
        contract.verifyCredential(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          1n,
          18n,
          12345n,
          nullifier,
          54321n,
        ),
      ).to.be.revertedWithCustomError(contract, "NullifierAlreadyUsed");
    });

    it("should revert with InvalidProof when verifier returns false", async function () {
      const { contract } = await loadFixture(deployWithFalseVerifier);

      await expect(
        contract.verifyCredential(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          1n,
          18n,
          12345n,
          99999n,
          54321n,
        ),
      ).to.be.revertedWithCustomError(contract, "InvalidProof");
    });

    it("should allow different nullifiers independently", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await contract.verifyCredential(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        1n,
        18n,
        12345n,
        1n,
        54321n,
      );
      await contract.verifyCredential(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        1n,
        18n,
        12345n,
        2n,
        54321n,
      );

      expect(await contract.totalVerifications()).to.equal(2);
    });
  });

  describe("getVerificationRecord", function () {
    it("should return stored verification record", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);
      const nullifier = 55555n;

      await contract.verifyCredential(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        1n,
        18n,
        12345n,
        nullifier,
        54321n,
      );

      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(nullifier), 32);
      const record = await contract.getVerificationRecord(nullifierHash);
      expect(record.prover).to.equal(owner.address);
      expect(record.isValid).to.be.true;
    });
  });

  describe("transferOwnership", function () {
    it("should transfer ownership", async function () {
      const { contract, owner, other } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract.connect(owner).transferOwnership(other.address);
      expect(await contract.owner()).to.equal(other.address);
    });

    it("should revert when called by non-owner", async function () {
      const { contract, other } = await loadFixture(deployWithTrueVerifier);
      await expect(
        contract.connect(other).transferOwnership(other.address),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });
  });
});
