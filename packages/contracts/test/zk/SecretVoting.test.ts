import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("SecretVoting", function () {
  // Dummy proof values (the mock verifier ignores these)
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  const MERKLE_ROOT = ethers.keccak256(ethers.toUtf8Bytes("merkle_root"));
  const EXTERNAL_NULLIFIER = 42n;

  async function deployWithTrueVerifier() {
    const [owner, voter1, voter2, nonOwner] = await ethers.getSigners();

    const MockVerifier4 = await ethers.getContractFactory("MockVerifier4");
    const verifier = await MockVerifier4.deploy(true);

    const SecretVoting = await ethers.getContractFactory("SecretVoting");
    const contract = await SecretVoting.deploy(await verifier.getAddress());

    return { contract, verifier, owner, voter1, voter2, nonOwner };
  }

  async function deployWithFalseVerifier() {
    const [owner, voter1] = await ethers.getSigners();

    const MockVerifier4 = await ethers.getContractFactory("MockVerifier4");
    const verifier = await MockVerifier4.deploy(false);

    const SecretVoting = await ethers.getContractFactory("SecretVoting");
    const contract = await SecretVoting.deploy(await verifier.getAddress());

    return { contract, verifier, owner, voter1 };
  }

  async function deployWithVotingActive() {
    const { contract, verifier, owner, voter1, voter2, nonOwner } =
      await loadFixture(deployWithTrueVerifier);

    // Register voters
    const commitment1 = ethers.keccak256(ethers.toUtf8Bytes("voter1"));
    const commitment2 = ethers.keccak256(ethers.toUtf8Bytes("voter2"));
    await contract.registerVoter(commitment1);
    await contract.registerVoter(commitment2);

    // Start voting
    await contract.startVoting(MERKLE_ROOT, EXTERNAL_NULLIFIER);

    return {
      contract,
      verifier,
      owner,
      voter1,
      voter2,
      nonOwner,
      commitment1,
      commitment2,
    };
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

    it("should start with voting inactive", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.votingActive()).to.be.false;
    });

    it("should start with zero voter count", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.voterCount()).to.equal(0n);
    });

    it("should have TREE_DEPTH of 10", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.TREE_DEPTH()).to.equal(10n);
    });

    it("should have MAX_VOTERS of 1024", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.MAX_VOTERS()).to.equal(1024n);
    });
  });

  describe("registerVoter", function () {
    it("should register a voter and emit VoterRegistered event", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("voter1"));

      await expect(contract.registerVoter(commitment))
        .to.emit(contract, "VoterRegistered")
        .withArgs(commitment, 0n);

      expect(await contract.voterCount()).to.equal(1n);
    });

    it("should increment leaf index for each voter", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      const c1 = ethers.keccak256(ethers.toUtf8Bytes("v1"));
      const c2 = ethers.keccak256(ethers.toUtf8Bytes("v2"));

      await expect(contract.registerVoter(c1))
        .to.emit(contract, "VoterRegistered")
        .withArgs(c1, 0n);

      await expect(contract.registerVoter(c2))
        .to.emit(contract, "VoterRegistered")
        .withArgs(c2, 1n);

      expect(await contract.voterCount()).to.equal(2n);
    });

    it("should store commitments retrievable via getCommitments", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      const c1 = ethers.keccak256(ethers.toUtf8Bytes("v1"));
      const c2 = ethers.keccak256(ethers.toUtf8Bytes("v2"));

      await contract.registerVoter(c1);
      await contract.registerVoter(c2);

      const commitments = await contract.getCommitments();
      expect(commitments).to.have.length(2);
      expect(commitments[0]).to.equal(c1);
      expect(commitments[1]).to.equal(c2);
    });

    it("should revert with OnlyOwner when called by non-owner", async function () {
      const { contract, nonOwner } = await loadFixture(deployWithTrueVerifier);
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("voter"));

      await expect(
        contract.connect(nonOwner).registerVoter(commitment),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });

    it("should revert with VotingStillActive when voting is active", async function () {
      const { contract } = await loadFixture(deployWithVotingActive);
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("newvoter"));

      await expect(
        contract.registerVoter(commitment),
      ).to.be.revertedWithCustomError(contract, "VotingStillActive");
    });
  });

  describe("registerVotersBatch", function () {
    it("should register multiple voters at once", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const commitments = [
        ethers.keccak256(ethers.toUtf8Bytes("a")),
        ethers.keccak256(ethers.toUtf8Bytes("b")),
        ethers.keccak256(ethers.toUtf8Bytes("c")),
      ];

      await contract.registerVotersBatch(commitments);
      expect(await contract.voterCount()).to.equal(3n);

      const stored = await contract.getCommitments();
      expect(stored).to.have.length(3);
    });

    it("should emit VoterRegistered for each commitment", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const c1 = ethers.keccak256(ethers.toUtf8Bytes("a"));
      const c2 = ethers.keccak256(ethers.toUtf8Bytes("b"));

      const tx = contract.registerVotersBatch([c1, c2]);
      await expect(tx).to.emit(contract, "VoterRegistered").withArgs(c1, 0n);
      await expect(tx).to.emit(contract, "VoterRegistered").withArgs(c2, 1n);
    });

    it("should revert with OnlyOwner when called by non-owner", async function () {
      const { contract, nonOwner } = await loadFixture(deployWithTrueVerifier);
      await expect(
        contract.connect(nonOwner).registerVotersBatch([]),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });

    it("should revert with VotingStillActive when voting is active", async function () {
      const { contract } = await loadFixture(deployWithVotingActive);
      await expect(
        contract.registerVotersBatch([]),
      ).to.be.revertedWithCustomError(contract, "VotingStillActive");
    });
  });

  describe("startVoting", function () {
    it("should start voting and set state correctly", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await contract.startVoting(MERKLE_ROOT, EXTERNAL_NULLIFIER);

      expect(await contract.votingActive()).to.be.true;
      expect(await contract.merkleRoot()).to.equal(MERKLE_ROOT);
      expect(await contract.externalNullifier()).to.equal(EXTERNAL_NULLIFIER);
      expect(await contract.yesVotes()).to.equal(0n);
      expect(await contract.noVotes()).to.equal(0n);
    });

    it("should emit VotingStarted event", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await expect(contract.startVoting(MERKLE_ROOT, EXTERNAL_NULLIFIER))
        .to.emit(contract, "VotingStarted")
        .withArgs(EXTERNAL_NULLIFIER, MERKLE_ROOT);
    });

    it("should revert with OnlyOwner when called by non-owner", async function () {
      const { contract, nonOwner } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract.connect(nonOwner).startVoting(MERKLE_ROOT, EXTERNAL_NULLIFIER),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });

    it("should revert with VotingStillActive when voting is already active", async function () {
      const { contract } = await loadFixture(deployWithVotingActive);

      await expect(
        contract.startVoting(MERKLE_ROOT, EXTERNAL_NULLIFIER),
      ).to.be.revertedWithCustomError(contract, "VotingStillActive");
    });
  });

  describe("endVoting", function () {
    it("should end voting and set state to inactive", async function () {
      const { contract } = await loadFixture(deployWithVotingActive);

      await contract.endVoting();
      expect(await contract.votingActive()).to.be.false;
    });

    it("should emit VotingEnded event with current results", async function () {
      const { contract, voter1 } = await loadFixture(deployWithVotingActive);

      // Cast one yes vote first
      await contract
        .connect(voter1)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 100n, 1n);

      await expect(contract.endVoting())
        .to.emit(contract, "VotingEnded")
        .withArgs(1n, 0n);
    });

    it("should revert with OnlyOwner when called by non-owner", async function () {
      const { contract, nonOwner } = await loadFixture(deployWithVotingActive);

      await expect(
        contract.connect(nonOwner).endVoting(),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });

    it("should revert with VotingNotActive when voting is not active", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await expect(contract.endVoting()).to.be.revertedWithCustomError(
        contract,
        "VotingNotActive",
      );
    });
  });

  describe("castVote", function () {
    it("should cast a yes vote (vote=1)", async function () {
      const { contract, voter1 } = await loadFixture(deployWithVotingActive);

      await contract
        .connect(voter1)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 100n, 1n);

      expect(await contract.yesVotes()).to.equal(1n);
      expect(await contract.noVotes()).to.equal(0n);
    });

    it("should cast a no vote (vote=0)", async function () {
      const { contract, voter1 } = await loadFixture(deployWithVotingActive);

      await contract
        .connect(voter1)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 200n, 0n);

      expect(await contract.yesVotes()).to.equal(0n);
      expect(await contract.noVotes()).to.equal(1n);
    });

    it("should emit VoteCast event", async function () {
      const { contract, voter1 } = await loadFixture(deployWithVotingActive);

      await expect(
        contract
          .connect(voter1)
          .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 300n, 1n),
      )
        .to.emit(contract, "VoteCast")
        .withArgs(300n, 1n);
    });

    it("should mark nullifier as used", async function () {
      const { contract, voter1 } = await loadFixture(deployWithVotingActive);

      await contract
        .connect(voter1)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 400n, 1n);

      expect(await contract.isNullifierUsed(400n)).to.be.true;
    });

    it("should revert with AlreadyVoted for duplicate nullifier", async function () {
      const { contract, voter1, voter2 } = await loadFixture(
        deployWithVotingActive,
      );

      await contract
        .connect(voter1)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 500n, 1n);

      await expect(
        contract
          .connect(voter2)
          .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 500n, 0n),
      ).to.be.revertedWithCustomError(contract, "AlreadyVoted");
    });

    it("should revert with InvalidVoteValue for vote > 1", async function () {
      const { contract, voter1 } = await loadFixture(deployWithVotingActive);

      await expect(
        contract
          .connect(voter1)
          .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 600n, 2n),
      ).to.be.revertedWithCustomError(contract, "InvalidVoteValue");
    });

    it("should revert with VotingNotActive when voting is not active", async function () {
      const { contract, voter1 } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract
          .connect(voter1)
          .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 700n, 1n),
      ).to.be.revertedWithCustomError(contract, "VotingNotActive");
    });

    it("should revert with InvalidProof when verifier returns false", async function () {
      const { contract, owner, voter1 } = await loadFixture(
        deployWithFalseVerifier,
      );

      const commitment = ethers.keccak256(ethers.toUtf8Bytes("voter"));
      await contract.connect(owner).registerVoter(commitment);
      await contract
        .connect(owner)
        .startVoting(MERKLE_ROOT, EXTERNAL_NULLIFIER);

      await expect(
        contract
          .connect(voter1)
          .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 800n, 1n),
      ).to.be.revertedWithCustomError(contract, "InvalidProof");
    });

    it("should allow multiple different votes with unique nullifiers", async function () {
      const { contract, voter1, voter2 } = await loadFixture(
        deployWithVotingActive,
      );

      await contract
        .connect(voter1)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 1000n, 1n);
      await contract
        .connect(voter2)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 2000n, 0n);

      expect(await contract.yesVotes()).to.equal(1n);
      expect(await contract.noVotes()).to.equal(1n);
    });
  });

  describe("View functions", function () {
    it("getResults should return current vote counts", async function () {
      const { contract, voter1, voter2 } = await loadFixture(
        deployWithVotingActive,
      );

      await contract
        .connect(voter1)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 1n, 1n);
      await contract
        .connect(voter2)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 2n, 0n);

      const [yes, no] = await contract.getResults();
      expect(yes).to.equal(1n);
      expect(no).to.equal(1n);
    });

    it("totalVotes should return sum of yes and no votes", async function () {
      const { contract, voter1, voter2 } = await loadFixture(
        deployWithVotingActive,
      );

      await contract
        .connect(voter1)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 10n, 1n);
      await contract
        .connect(voter2)
        .castVote(DUMMY_PA, DUMMY_PB, DUMMY_PC, 20n, 0n);

      expect(await contract.totalVotes()).to.equal(2n);
    });

    it("isNullifierUsed should return false for unused nullifier", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.isNullifierUsed(99999n)).to.be.false;
    });

    it("getCommitments should return empty array initially", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const commitments = await contract.getCommitments();
      expect(commitments).to.have.length(0);
    });
  });

  describe("transferOwnership", function () {
    it("should transfer ownership when called by owner", async function () {
      const { contract, owner, nonOwner } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract.connect(owner).transferOwnership(nonOwner.address);
      expect(await contract.owner()).to.equal(nonOwner.address);
    });

    it("should revert with OnlyOwner when called by non-owner", async function () {
      const { contract, nonOwner } = await loadFixture(deployWithTrueVerifier);
      await expect(
        contract.connect(nonOwner).transferOwnership(nonOwner.address),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });

    it("should allow new owner to manage voting", async function () {
      const { contract, owner, nonOwner } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract.connect(owner).transferOwnership(nonOwner.address);

      // New owner can start voting
      await expect(
        contract.connect(nonOwner).startVoting(MERKLE_ROOT, EXTERNAL_NULLIFIER),
      ).to.not.be.reverted;
    });
  });
});
