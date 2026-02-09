import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("SimpleMixer", function () {
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  const DENOMINATION = ethers.parseEther("0.01");

  async function deployWithTrueVerifier() {
    const [owner, depositor, recipient, relayer] = await ethers.getSigners();

    const MockVerifier5 = await ethers.getContractFactory("MockVerifier5");
    const verifier = await MockVerifier5.deploy(true);

    const SimpleMixer = await ethers.getContractFactory("SimpleMixer");
    const contract = await SimpleMixer.deploy(await verifier.getAddress());

    return { contract, verifier, owner, depositor, recipient, relayer };
  }

  async function deployWithFalseVerifier() {
    const [owner, depositor, recipient, relayer] = await ethers.getSigners();

    const MockVerifier5 = await ethers.getContractFactory("MockVerifier5");
    const verifier = await MockVerifier5.deploy(false);

    const SimpleMixer = await ethers.getContractFactory("SimpleMixer");
    const contract = await SimpleMixer.deploy(await verifier.getAddress());

    return { contract, verifier, owner, depositor, recipient, relayer };
  }

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should store the verifier address", async function () {
      const { contract, verifier } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.verifier()).to.equal(await verifier.getAddress());
    });

    it("should have correct DENOMINATION", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.DENOMINATION()).to.equal(DENOMINATION);
    });

    it("should initialize nextLeafIndex to 0", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.nextLeafIndex()).to.equal(0);
    });

    it("should have correct TREE_DEPTH", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.TREE_DEPTH()).to.equal(10);
    });
  });

  describe("deposit", function () {
    it("should accept deposit with correct denomination", async function () {
      const { contract, depositor } = await loadFixture(
        deployWithTrueVerifier,
      );
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await contract.connect(depositor).deposit(commitment, {
        value: DENOMINATION,
      });

      expect(await contract.isKnownCommitment(commitment)).to.be.true;
      expect(await contract.getDepositCount()).to.equal(1);
    });

    it("should emit Deposit event", async function () {
      const { contract, depositor } = await loadFixture(
        deployWithTrueVerifier,
      );
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await expect(
        contract.connect(depositor).deposit(commitment, {
          value: DENOMINATION,
        }),
      )
        .to.emit(contract, "Deposit")
        .withArgs(commitment, 0, () => true);
    });

    it("should revert with InvalidDeposit for wrong amount", async function () {
      const { contract, depositor } = await loadFixture(
        deployWithTrueVerifier,
      );
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await expect(
        contract.connect(depositor).deposit(commitment, {
          value: ethers.parseEther("0.02"),
        }),
      ).to.be.revertedWithCustomError(contract, "InvalidDeposit");
    });

    it("should revert with CommitmentAlreadyExists for duplicate", async function () {
      const { contract, depositor } = await loadFixture(
        deployWithTrueVerifier,
      );
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await contract.connect(depositor).deposit(commitment, {
        value: DENOMINATION,
      });

      await expect(
        contract.connect(depositor).deposit(commitment, {
          value: DENOMINATION,
        }),
      ).to.be.revertedWithCustomError(contract, "CommitmentAlreadyExists");
    });

    it("should update Merkle root on deposit", async function () {
      const { contract, depositor } = await loadFixture(
        deployWithTrueVerifier,
      );
      const rootBefore = await contract.merkleRoot();
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await contract.connect(depositor).deposit(commitment, {
        value: DENOMINATION,
      });

      const rootAfter = await contract.merkleRoot();
      expect(rootAfter).to.not.equal(rootBefore);
    });

    it("should allow multiple deposits", async function () {
      const { contract, depositor } = await loadFixture(
        deployWithTrueVerifier,
      );

      for (let i = 1; i <= 3; i++) {
        const commitment = ethers.zeroPadValue(ethers.toBeHex(BigInt(i)), 32);
        await contract.connect(depositor).deposit(commitment, {
          value: DENOMINATION,
        });
      }

      expect(await contract.getDepositCount()).to.equal(3);
    });
  });

  describe("withdraw", function () {
    it("should revert with InvalidProof when verifier returns false", async function () {
      const { contract, depositor, recipient, relayer } = await loadFixture(
        deployWithFalseVerifier,
      );
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await contract.connect(depositor).deposit(commitment, {
        value: DENOMINATION,
      });

      const root = await contract.merkleRoot();
      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(99999n), 32);

      await expect(
        contract.withdraw(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          root,
          nullifierHash,
          recipient.address,
          relayer.address,
          0,
        ),
      ).to.be.revertedWithCustomError(contract, "InvalidProof");
    });

    it("should revert with NullifierAlreadyUsed for double withdrawal", async function () {
      const { contract, depositor, recipient, relayer } = await loadFixture(
        deployWithTrueVerifier,
      );
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await contract.connect(depositor).deposit(commitment, {
        value: DENOMINATION,
      });

      const root = await contract.merkleRoot();
      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(99999n), 32);

      await contract.withdraw(
        DUMMY_PA,
        DUMMY_PB,
        DUMMY_PC,
        root,
        nullifierHash,
        recipient.address,
        relayer.address,
        0,
      );

      await expect(
        contract.withdraw(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          root,
          nullifierHash,
          recipient.address,
          relayer.address,
          0,
        ),
      ).to.be.revertedWithCustomError(contract, "NullifierAlreadyUsed");
    });

    it("should revert with InvalidFee when fee exceeds denomination", async function () {
      const { contract, depositor, recipient, relayer } = await loadFixture(
        deployWithTrueVerifier,
      );
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);

      await contract.connect(depositor).deposit(commitment, {
        value: DENOMINATION,
      });

      const root = await contract.merkleRoot();
      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(99999n), 32);

      await expect(
        contract.withdraw(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          root,
          nullifierHash,
          recipient.address,
          relayer.address,
          DENOMINATION + 1n,
        ),
      ).to.be.revertedWithCustomError(contract, "InvalidFee");
    });
  });

  describe("View functions", function () {
    it("isSpent should return false for unused nullifier", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const nullifierHash = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);
      expect(await contract.isSpent(nullifierHash)).to.be.false;
    });

    it("isKnownCommitment should return false for unknown commitment", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      const commitment = ethers.zeroPadValue(ethers.toBeHex(12345n), 32);
      expect(await contract.isKnownCommitment(commitment)).to.be.false;
    });

    it("getAllCommitments should return all deposited commitments", async function () {
      const { contract, depositor } = await loadFixture(
        deployWithTrueVerifier,
      );

      const c1 = ethers.zeroPadValue(ethers.toBeHex(1n), 32);
      const c2 = ethers.zeroPadValue(ethers.toBeHex(2n), 32);

      await contract.connect(depositor).deposit(c1, { value: DENOMINATION });
      await contract.connect(depositor).deposit(c2, { value: DENOMINATION });

      const allCommitments = await contract.getAllCommitments();
      expect(allCommitments).to.have.lengthOf(2);
      expect(allCommitments[0]).to.equal(c1);
      expect(allCommitments[1]).to.equal(c2);
    });
  });
});
