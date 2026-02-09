import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("PrivateClub", function () {
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  async function deployWithTrueVerifier() {
    const [owner, member, other] = await ethers.getSigners();

    const MockVerifier6 = await ethers.getContractFactory("MockVerifier6");
    const verifier = await MockVerifier6.deploy(true);

    const PrivateClub = await ethers.getContractFactory("PrivateClub");
    const contract = await PrivateClub.deploy(await verifier.getAddress());

    return { contract, verifier, owner, member, other };
  }

  async function deployWithFalseVerifier() {
    const [owner, member, other] = await ethers.getSigners();

    const MockVerifier6 = await ethers.getContractFactory("MockVerifier6");
    const verifier = await MockVerifier6.deploy(false);

    const PrivateClub = await ethers.getContractFactory("PrivateClub");
    const contract = await PrivateClub.deploy(await verifier.getAddress());

    return { contract, verifier, owner, member, other };
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

    it("should initialize memberCount to 0", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.getMemberCount()).to.equal(0);
    });

    it("should set default min tier to BASIC (1)", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.defaultMinTier()).to.equal(1);
    });

    it("should have correct tier constants", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.TIER_BASIC()).to.equal(1);
      expect(await contract.TIER_PREMIUM()).to.equal(2);
      expect(await contract.TIER_VIP()).to.equal(3);
    });
  });

  describe("addMember", function () {
    it("should add a member", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await contract.addMember(commitment);

      expect(await contract.getMemberCount()).to.equal(1);
    });

    it("should emit MemberAdded event", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await expect(contract.addMember(commitment))
        .to.emit(contract, "MemberAdded")
        .withArgs(commitment, 0);
    });

    it("should revert when called by non-owner", async function () {
      const { contract, other } = await loadFixture(deployWithTrueVerifier);
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await expect(
        contract.connect(other).addMember(commitment),
      ).to.be.revertedWithCustomError(contract, "NotOwner");
    });

    it("should update Merkle root", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const rootBefore = await contract.merkleRoot();
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await contract.addMember(commitment);

      expect(await contract.merkleRoot()).to.not.equal(rootBefore);
    });
  });

  describe("addMembersBatch", function () {
    it("should add multiple members", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      const commitments = [
        ethers.zeroPadValue(ethers.toBeHex(1n), 32),
        ethers.zeroPadValue(ethers.toBeHex(2n), 32),
        ethers.zeroPadValue(ethers.toBeHex(3n), 32),
      ];

      await contract.addMembersBatch(commitments);

      expect(await contract.getMemberCount()).to.equal(3);
    });

    it("should revert when called by non-owner", async function () {
      const { contract, other } = await loadFixture(deployWithTrueVerifier);
      const commitments = [ethers.zeroPadValue(ethers.toBeHex(1n), 32)];

      await expect(
        contract.connect(other).addMembersBatch(commitments),
      ).to.be.revertedWithCustomError(contract, "NotOwner");
    });
  });

  describe("setDefaultMinTier", function () {
    it("should update default min tier", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await contract.setDefaultMinTier(2);

      expect(await contract.defaultMinTier()).to.equal(2);
    });

    it("should emit TierUpdated event", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await expect(contract.setDefaultMinTier(3))
        .to.emit(contract, "TierUpdated")
        .withArgs(3);
    });

    it("should revert when called by non-owner", async function () {
      const { contract, other } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract.connect(other).setDefaultMinTier(2),
      ).to.be.revertedWithCustomError(contract, "NotOwner");
    });
  });

  describe("verifyMembership", function () {
    it("should verify membership with valid proof", async function () {
      const { contract, member } = await loadFixture(deployWithTrueVerifier);
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);
      await contract.addMember(commitment);

      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(99999n), 32);

      await contract
        .connect(member)
        .verifyMembership(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          nullifierHash,
          1,
          0,
          0,
          0,
        );

      expect(await contract.isNullifierUsed(1, nullifierHash)).to.be.true;
    });

    it("should emit MembershipVerified event", async function () {
      const { contract, member } = await loadFixture(deployWithTrueVerifier);
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);
      await contract.addMember(commitment);

      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(99999n), 32);

      await expect(
        contract
          .connect(member)
          .verifyMembership(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            nullifierHash,
            1,
            0,
            0,
            0,
          ),
      )
        .to.emit(contract, "MembershipVerified")
        .withArgs(nullifierHash, 1);
    });

    it("should revert with NullifierAlreadyUsed for same action+nullifier", async function () {
      const { contract, member } = await loadFixture(deployWithTrueVerifier);
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);
      await contract.addMember(commitment);

      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(99999n), 32);

      await contract
        .connect(member)
        .verifyMembership(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          nullifierHash,
          1,
          0,
          0,
          0,
        );

      await expect(
        contract
          .connect(member)
          .verifyMembership(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            nullifierHash,
            1,
            0,
            0,
            0,
          ),
      ).to.be.revertedWithCustomError(contract, "NullifierAlreadyUsed");
    });

    it("should allow same nullifier for different actions", async function () {
      const { contract, member } = await loadFixture(deployWithTrueVerifier);
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);
      await contract.addMember(commitment);

      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(99999n), 32);

      await contract
        .connect(member)
        .verifyMembership(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          nullifierHash,
          1,
          0,
          0,
          0,
        );

      // Same nullifier, different action
      await expect(
        contract
          .connect(member)
          .verifyMembership(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            nullifierHash,
            2,
            0,
            0,
            0,
          ),
      ).to.not.be.reverted;
    });

    it("should revert with InvalidProof when verifier returns false", async function () {
      const { contract, member } = await loadFixture(deployWithFalseVerifier);
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);
      await contract.addMember(commitment);

      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(99999n), 32);

      await expect(
        contract
          .connect(member)
          .verifyMembership(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            nullifierHash,
            1,
            0,
            0,
            0,
          ),
      ).to.be.revertedWithCustomError(contract, "InvalidProof");
    });
  });

  describe("createAction", function () {
    it("should create a new action", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await contract.createAction("vote");

      expect(await contract.nextActionId()).to.equal(1);
    });

    it("should revert when called by non-owner", async function () {
      const { contract, other } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract.connect(other).createAction("vote"),
      ).to.be.revertedWithCustomError(contract, "NotOwner");
    });
  });

  describe("View functions", function () {
    it("getAllCommitments should return all commitments", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      const c1 = ethers.zeroPadValue(ethers.toBeHex(1n), 32);
      const c2 = ethers.zeroPadValue(ethers.toBeHex(2n), 32);

      await contract.addMember(c1);
      await contract.addMember(c2);

      const allCommitments = await contract.getAllCommitments();
      expect(allCommitments).to.have.lengthOf(2);
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
      ).to.be.revertedWithCustomError(contract, "NotOwner");
    });
  });
});
