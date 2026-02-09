import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("MastermindGame", function () {
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  async function deployFixture() {
    const [codeSetter, guesser, other] = await ethers.getSigners();

    const MockVerifier5 = await ethers.getContractFactory("MockVerifier5");
    const verifier = await MockVerifier5.deploy(true);

    const MastermindGame =
      await ethers.getContractFactory("MastermindGame");
    const contract = await MastermindGame.deploy(await verifier.getAddress());

    return { contract, verifier, codeSetter, guesser, other };
  }

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should store the verifier address", async function () {
      const { contract, verifier } = await loadFixture(deployFixture);
      expect(await contract.verifier()).to.equal(await verifier.getAddress());
    });

    it("should initialize gameCounter to 0", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.gameCounter()).to.equal(0);
    });

    it("should have correct constants", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.MAX_COLOR()).to.equal(5);
      expect(await contract.CODE_LENGTH()).to.equal(4);
      expect(await contract.DEFAULT_MAX_ATTEMPTS()).to.equal(10);
    });
  });

  describe("createGame", function () {
    it("should create a new game", async function () {
      const { contract, codeSetter, guesser } =
        await loadFixture(deployFixture);
      const commitment = 12345n;

      await contract.createGame(commitment, guesser.address, 10);

      const game = await contract.getGame(0);
      expect(game.codeSetter).to.equal(codeSetter.address);
      expect(game.guesser).to.equal(guesser.address);
      expect(game.codeCommitment).to.equal(commitment);
      expect(game.currentAttempt).to.equal(0);
      expect(game.maxAttempts).to.equal(10);
      expect(game.active).to.be.true;
      expect(game.waitingForHint).to.be.false;
    });

    it("should emit GameCreated event", async function () {
      const { contract, codeSetter, guesser } =
        await loadFixture(deployFixture);

      await expect(contract.createGame(12345n, guesser.address, 10))
        .to.emit(contract, "GameCreated")
        .withArgs(0, codeSetter.address, 12345n);
    });

    it("should use default max attempts when 0 is passed", async function () {
      const { contract, guesser } = await loadFixture(deployFixture);

      await contract.createGame(12345n, guesser.address, 0);

      const game = await contract.getGame(0);
      expect(game.maxAttempts).to.equal(10);
    });

    it("should increment gameCounter", async function () {
      const { contract, guesser } = await loadFixture(deployFixture);

      await contract.createGame(1n, guesser.address, 5);
      await contract.createGame(2n, guesser.address, 5);

      expect(await contract.gameCounter()).to.equal(2);
    });
  });

  describe("makeGuess", function () {
    it("should accept a valid guess", async function () {
      const { contract, codeSetter, guesser } =
        await loadFixture(deployFixture);
      await contract
        .connect(codeSetter)
        .createGame(12345n, guesser.address, 10);

      await contract.connect(guesser).makeGuess(0, [1, 2, 3, 4]);

      const game = await contract.getGame(0);
      expect(game.currentAttempt).to.equal(1);
      expect(game.waitingForHint).to.be.true;
    });

    it("should emit GuessMade event", async function () {
      const { contract, codeSetter, guesser } =
        await loadFixture(deployFixture);
      await contract
        .connect(codeSetter)
        .createGame(12345n, guesser.address, 10);

      await expect(contract.connect(guesser).makeGuess(0, [1, 2, 3, 4]))
        .to.emit(contract, "GuessMade")
        .withArgs(0, [1, 2, 3, 4], 1);
    });

    it("should revert when called by non-guesser", async function () {
      const { contract, codeSetter, guesser, other } =
        await loadFixture(deployFixture);
      await contract
        .connect(codeSetter)
        .createGame(12345n, guesser.address, 10);

      await expect(
        contract.connect(other).makeGuess(0, [1, 2, 3, 4]),
      ).to.be.revertedWithCustomError(contract, "NotGuesser");
    });

    it("should revert with InvalidGuess for colors above MAX_COLOR", async function () {
      const { contract, codeSetter, guesser } =
        await loadFixture(deployFixture);
      await contract
        .connect(codeSetter)
        .createGame(12345n, guesser.address, 10);

      await expect(
        contract.connect(guesser).makeGuess(0, [1, 2, 3, 6]),
      ).to.be.revertedWithCustomError(contract, "InvalidGuess");
    });

    it("should revert when game is not active", async function () {
      const { contract, guesser } = await loadFixture(deployFixture);

      await expect(
        contract.connect(guesser).makeGuess(99, [1, 2, 3, 4]),
      ).to.be.revertedWithCustomError(contract, "GameNotActive");
    });
  });

  describe("provideHint", function () {
    it("should provide hint after guess", async function () {
      const { contract, codeSetter, guesser } =
        await loadFixture(deployFixture);
      await contract
        .connect(codeSetter)
        .createGame(12345n, guesser.address, 10);
      await contract.connect(guesser).makeGuess(0, [1, 2, 3, 4]);

      await contract
        .connect(codeSetter)
        .provideHint(0, 2, 1, DUMMY_PA, DUMMY_PB, DUMMY_PC);

      const game = await contract.getGame(0);
      expect(game.waitingForHint).to.be.false;
    });

    it("should emit HintProvided event", async function () {
      const { contract, codeSetter, guesser } =
        await loadFixture(deployFixture);
      await contract
        .connect(codeSetter)
        .createGame(12345n, guesser.address, 10);
      await contract.connect(guesser).makeGuess(0, [1, 2, 3, 4]);

      await expect(
        contract
          .connect(codeSetter)
          .provideHint(0, 2, 1, DUMMY_PA, DUMMY_PB, DUMMY_PC),
      )
        .to.emit(contract, "HintProvided")
        .withArgs(0, 2, 1);
    });

    it("should end game with GameWon when all black pegs", async function () {
      const { contract, codeSetter, guesser } =
        await loadFixture(deployFixture);
      await contract
        .connect(codeSetter)
        .createGame(12345n, guesser.address, 10);
      await contract.connect(guesser).makeGuess(0, [1, 2, 3, 4]);

      await expect(
        contract
          .connect(codeSetter)
          .provideHint(0, 4, 0, DUMMY_PA, DUMMY_PB, DUMMY_PC),
      )
        .to.emit(contract, "GameWon")
        .withArgs(0, guesser.address);

      const game = await contract.getGame(0);
      expect(game.active).to.be.false;
    });

    it("should revert when called by non-codeSetter", async function () {
      const { contract, codeSetter, guesser, other } =
        await loadFixture(deployFixture);
      await contract
        .connect(codeSetter)
        .createGame(12345n, guesser.address, 10);
      await contract.connect(guesser).makeGuess(0, [1, 2, 3, 4]);

      await expect(
        contract
          .connect(other)
          .provideHint(0, 2, 1, DUMMY_PA, DUMMY_PB, DUMMY_PC),
      ).to.be.revertedWithCustomError(contract, "NotCodeSetter");
    });
  });

  describe("getLastGuess", function () {
    it("should return the last guess", async function () {
      const { contract, codeSetter, guesser } =
        await loadFixture(deployFixture);
      await contract
        .connect(codeSetter)
        .createGame(12345n, guesser.address, 10);
      await contract.connect(guesser).makeGuess(0, [5, 3, 2, 1]);

      const lastGuess = await contract.getLastGuess(0);
      expect(lastGuess).to.deep.equal([5, 3, 2, 1]);
    });
  });
});
