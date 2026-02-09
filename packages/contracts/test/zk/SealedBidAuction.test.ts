import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-network-helpers";

describe("SealedBidAuction", function () {
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  const MIN_BID = ethers.parseEther("0.1");
  const MAX_BID = ethers.parseEther("10");
  const DEPOSIT = ethers.parseEther("0.5");
  const BIDDING_DURATION = 3600; // 1 hour
  const REVEAL_DURATION = 3600; // 1 hour

  async function deployWithTrueVerifier() {
    const [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    const MockVerifier4 = await ethers.getContractFactory("MockVerifier4");
    const verifier = await MockVerifier4.deploy(true);

    const SealedBidAuction =
      await ethers.getContractFactory("SealedBidAuction");
    const contract = await SealedBidAuction.deploy(
      await verifier.getAddress(),
    );

    return { contract, verifier, owner, seller, bidder1, bidder2 };
  }

  async function deployWithFalseVerifier() {
    const [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    const MockVerifier4 = await ethers.getContractFactory("MockVerifier4");
    const verifier = await MockVerifier4.deploy(false);

    const SealedBidAuction =
      await ethers.getContractFactory("SealedBidAuction");
    const contract = await SealedBidAuction.deploy(
      await verifier.getAddress(),
    );

    return { contract, verifier, owner, seller, bidder1, bidder2 };
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

    it("should initialize auctionCounter to 0", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.auctionCounter()).to.equal(0);
    });
  });

  describe("createAuction", function () {
    it("should create a new auction", async function () {
      const { contract, seller } = await loadFixture(deployWithTrueVerifier);

      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      const auction = await contract.getAuction(0);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.minBid).to.equal(MIN_BID);
      expect(auction.maxBid).to.equal(MAX_BID);
      expect(auction.phase).to.equal(0); // Bidding
      expect(auction.winner).to.equal(ethers.ZeroAddress);
      expect(auction.winningBid).to.equal(0);
    });

    it("should emit AuctionCreated event", async function () {
      const { contract, seller } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract
          .connect(seller)
          .createAuction(
            MIN_BID,
            MAX_BID,
            DEPOSIT,
            BIDDING_DURATION,
            REVEAL_DURATION,
          ),
      )
        .to.emit(contract, "AuctionCreated")
        .withArgs(0, MIN_BID, MAX_BID);
    });

    it("should increment auctionCounter", async function () {
      const { contract, seller } = await loadFixture(deployWithTrueVerifier);

      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      expect(await contract.auctionCounter()).to.equal(2);
    });
  });

  describe("commitBid", function () {
    it("should accept bid commitment with sufficient deposit", async function () {
      const { contract, seller, bidder1 } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      const commitment = 12345n;

      await contract.connect(bidder1).commitBid(0, commitment, {
        value: DEPOSIT,
      });

      expect(await contract.getBidderCount(0)).to.equal(1);
    });

    it("should emit BidCommitted event", async function () {
      const { contract, seller, bidder1 } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      await expect(
        contract.connect(bidder1).commitBid(0, 12345n, { value: DEPOSIT }),
      )
        .to.emit(contract, "BidCommitted")
        .withArgs(0, bidder1.address, 12345n);
    });

    it("should revert with InsufficientDeposit for low deposit", async function () {
      const { contract, seller, bidder1 } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      await expect(
        contract.connect(bidder1).commitBid(0, 12345n, {
          value: ethers.parseEther("0.1"),
        }),
      ).to.be.revertedWithCustomError(contract, "InsufficientDeposit");
    });

    it("should allow multiple bidders", async function () {
      const { contract, seller, bidder1, bidder2 } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      await contract
        .connect(bidder1)
        .commitBid(0, 111n, { value: DEPOSIT });
      await contract
        .connect(bidder2)
        .commitBid(0, 222n, { value: DEPOSIT });

      expect(await contract.getBidderCount(0)).to.equal(2);
    });
  });

  describe("revealBid", function () {
    it("should revert with NotInRevealPhase during bidding phase", async function () {
      const { contract, seller, bidder1 } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      await contract
        .connect(bidder1)
        .commitBid(0, 12345n, { value: DEPOSIT });

      // Still in bidding phase
      await expect(
        contract
          .connect(bidder1)
          .revealBid(0, DUMMY_PA, DUMMY_PB, DUMMY_PC, ethers.parseEther("1")),
      ).to.be.revertedWithCustomError(contract, "NotInRevealPhase");
    });

    it("should accept reveal after bidding phase ends", async function () {
      const { contract, seller, bidder1 } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      await contract
        .connect(bidder1)
        .commitBid(0, 12345n, { value: DEPOSIT });

      // Advance past bidding phase
      await time.increase(BIDDING_DURATION + 1);

      await contract
        .connect(bidder1)
        .revealBid(0, DUMMY_PA, DUMMY_PB, DUMMY_PC, ethers.parseEther("1"));

      const auction = await contract.getAuction(0);
      expect(auction.winner).to.equal(bidder1.address);
      expect(auction.winningBid).to.equal(ethers.parseEther("1"));
    });

    it("should emit BidRevealed event", async function () {
      const { contract, seller, bidder1 } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      await contract
        .connect(bidder1)
        .commitBid(0, 12345n, { value: DEPOSIT });

      await time.increase(BIDDING_DURATION + 1);

      await expect(
        contract
          .connect(bidder1)
          .revealBid(0, DUMMY_PA, DUMMY_PB, DUMMY_PC, ethers.parseEther("1")),
      )
        .to.emit(contract, "BidRevealed")
        .withArgs(0, bidder1.address);
    });

    it("should revert with InvalidProof when verifier returns false", async function () {
      const { contract, seller, bidder1 } = await loadFixture(
        deployWithFalseVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      await contract
        .connect(bidder1)
        .commitBid(0, 12345n, { value: DEPOSIT });

      await time.increase(BIDDING_DURATION + 1);

      await expect(
        contract
          .connect(bidder1)
          .revealBid(0, DUMMY_PA, DUMMY_PB, DUMMY_PC, ethers.parseEther("1")),
      ).to.be.revertedWithCustomError(contract, "InvalidProof");
    });

    it("should revert with AlreadyRevealed for double reveal", async function () {
      const { contract, seller, bidder1 } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      await contract
        .connect(bidder1)
        .commitBid(0, 12345n, { value: DEPOSIT });

      await time.increase(BIDDING_DURATION + 1);

      await contract
        .connect(bidder1)
        .revealBid(0, DUMMY_PA, DUMMY_PB, DUMMY_PC, ethers.parseEther("1"));

      await expect(
        contract
          .connect(bidder1)
          .revealBid(0, DUMMY_PA, DUMMY_PB, DUMMY_PC, ethers.parseEther("1")),
      ).to.be.revertedWithCustomError(contract, "AlreadyRevealed");
    });

    it("should revert with CommitmentNotFound for non-bidder", async function () {
      const { contract, seller, bidder1, bidder2 } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      await contract
        .connect(bidder1)
        .commitBid(0, 12345n, { value: DEPOSIT });

      await time.increase(BIDDING_DURATION + 1);

      await expect(
        contract
          .connect(bidder2)
          .revealBid(0, DUMMY_PA, DUMMY_PB, DUMMY_PC, ethers.parseEther("1")),
      ).to.be.revertedWithCustomError(contract, "CommitmentNotFound");
    });

    it("should update winner to highest bidder", async function () {
      const { contract, seller, bidder1, bidder2 } = await loadFixture(
        deployWithTrueVerifier,
      );
      await contract
        .connect(seller)
        .createAuction(
          MIN_BID,
          MAX_BID,
          DEPOSIT,
          BIDDING_DURATION,
          REVEAL_DURATION,
        );

      await contract
        .connect(bidder1)
        .commitBid(0, 111n, { value: DEPOSIT });
      await contract
        .connect(bidder2)
        .commitBid(0, 222n, { value: DEPOSIT });

      await time.increase(BIDDING_DURATION + 1);

      await contract
        .connect(bidder1)
        .revealBid(0, DUMMY_PA, DUMMY_PB, DUMMY_PC, ethers.parseEther("1"));
      await contract
        .connect(bidder2)
        .revealBid(0, DUMMY_PA, DUMMY_PB, DUMMY_PC, ethers.parseEther("5"));

      const auction = await contract.getAuction(0);
      expect(auction.winner).to.equal(bidder2.address);
      expect(auction.winningBid).to.equal(ethers.parseEther("5"));
    });
  });

  describe("View functions", function () {
    it("getBidderCount should return 0 for non-existent auction", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.getBidderCount(99)).to.equal(0);
    });

    it("getAuction should return zero values for non-existent auction", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const auction = await contract.getAuction(99);
      expect(auction.seller).to.equal(ethers.ZeroAddress);
    });
  });
});
