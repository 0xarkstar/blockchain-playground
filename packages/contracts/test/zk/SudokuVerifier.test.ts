import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("SudokuVerifier", function () {
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  // 82 public signals (81 cells + 1 validity flag)
  function makePubSignals(seed: bigint = 1n): bigint[] {
    const signals: bigint[] = [];
    for (let i = 0; i < 82; i++) {
      signals.push(seed + BigInt(i));
    }
    return signals;
  }

  async function deployWithTrueVerifier() {
    const [owner, other] = await ethers.getSigners();

    const MockVerifier82 = await ethers.getContractFactory("MockVerifier82");
    const verifier = await MockVerifier82.deploy(true);

    const SudokuVerifier =
      await ethers.getContractFactory("SudokuVerifier");
    const contract = await SudokuVerifier.deploy(
      await verifier.getAddress(),
    );

    return { contract, verifier, owner, other };
  }

  async function deployWithFalseVerifier() {
    const [owner, other] = await ethers.getSigners();

    const MockVerifier82 = await ethers.getContractFactory("MockVerifier82");
    const verifier = await MockVerifier82.deploy(false);

    const SudokuVerifier =
      await ethers.getContractFactory("SudokuVerifier");
    const contract = await SudokuVerifier.deploy(
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

    it("should initialize totalSolutions to 0", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.totalSolutions()).to.equal(0);
    });
  });

  describe("verifySolution", function () {
    it("should verify and record solver when proof is valid", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);
      const pubSignals = makePubSignals();

      await contract.verifySolution(DUMMY_PA, DUMMY_PB, DUMMY_PC, pubSignals);

      expect(await contract.totalSolutions()).to.equal(1);
    });

    it("should emit SudokuSolved event", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);
      const pubSignals = makePubSignals();

      await expect(
        contract.verifySolution(DUMMY_PA, DUMMY_PB, DUMMY_PC, pubSignals),
      )
        .to.emit(contract, "SudokuSolved")
        .withArgs(owner.address, () => true, () => true);
    });

    it("should revert with PuzzleAlreadySolved for same puzzle", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const pubSignals = makePubSignals();

      await contract.verifySolution(DUMMY_PA, DUMMY_PB, DUMMY_PC, pubSignals);

      await expect(
        contract.verifySolution(DUMMY_PA, DUMMY_PB, DUMMY_PC, pubSignals),
      ).to.be.revertedWithCustomError(contract, "PuzzleAlreadySolved");
    });

    it("should revert with InvalidProof when verifier returns false", async function () {
      const { contract } = await loadFixture(deployWithFalseVerifier);
      const pubSignals = makePubSignals();

      await expect(
        contract.verifySolution(DUMMY_PA, DUMMY_PB, DUMMY_PC, pubSignals),
      ).to.be.revertedWithCustomError(contract, "InvalidProof");
    });

    it("should allow different puzzles to be solved independently", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await contract.verifySolution(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        makePubSignals(1n),
      );
      await contract.verifySolution(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        makePubSignals(100n),
      );

      expect(await contract.totalSolutions()).to.equal(2);
    });
  });

  describe("View functions", function () {
    it("isPuzzleSolved should return false for unsolved puzzle", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const randomHash = ethers.zeroPadValue(ethers.toBeHex(9999n), 32);
      expect(await contract.isPuzzleSolved(randomHash)).to.be.false;
    });

    it("getPuzzleSolver should return zero address for unsolved puzzle", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const randomHash = ethers.zeroPadValue(ethers.toBeHex(9999n), 32);
      expect(await contract.getPuzzleSolver(randomHash)).to.equal(
        ethers.ZeroAddress,
      );
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
