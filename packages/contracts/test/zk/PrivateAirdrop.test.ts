import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("PrivateAirdrop", function () {
  // Dummy proof values (the mock verifier ignores these)
  const DUMMY_PA: [bigint, bigint] = [1n, 2n];
  const DUMMY_PB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const DUMMY_PC: [bigint, bigint] = [1n, 2n];

  const MERKLE_ROOT = ethers.keccak256(ethers.toUtf8Bytes("airdrop_root"));
  const CLAIM_AMOUNT = ethers.parseEther("1.0");
  const TOTAL_FUNDING = ethers.parseEther("10.0");

  async function deployWithTrueVerifier() {
    const [owner, claimer1, claimer2, nonOwner] = await ethers.getSigners();

    const MockVerifier4 = await ethers.getContractFactory("MockVerifier4");
    const verifier = await MockVerifier4.deploy(true);

    const PrivateAirdrop = await ethers.getContractFactory("PrivateAirdrop");
    const contract = await PrivateAirdrop.deploy(await verifier.getAddress());

    return { contract, verifier, owner, claimer1, claimer2, nonOwner };
  }

  async function deployWithFalseVerifier() {
    const [owner, claimer1] = await ethers.getSigners();

    const MockVerifier4 = await ethers.getContractFactory("MockVerifier4");
    const verifier = await MockVerifier4.deploy(false);

    const PrivateAirdrop = await ethers.getContractFactory("PrivateAirdrop");
    const contract = await PrivateAirdrop.deploy(await verifier.getAddress());

    return { contract, verifier, owner, claimer1 };
  }

  async function deployWithETHAirdrop() {
    const { contract, verifier, owner, claimer1, claimer2, nonOwner } =
      await loadFixture(deployWithTrueVerifier);

    await contract.initializeETHAirdrop(MERKLE_ROOT, CLAIM_AMOUNT, {
      value: TOTAL_FUNDING,
    });

    return { contract, verifier, owner, claimer1, claimer2, nonOwner };
  }

  async function deployWithERC20Airdrop() {
    const { contract, verifier, owner, claimer1, claimer2, nonOwner } =
      await loadFixture(deployWithTrueVerifier);

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy();
    const contractAddress = await contract.getAddress();

    // Mint tokens to owner and approve the airdrop contract
    await token.mint(owner.address, TOTAL_FUNDING);
    await token.approve(contractAddress, TOTAL_FUNDING);

    await contract.initializeERC20Airdrop(
      MERKLE_ROOT,
      await token.getAddress(),
      CLAIM_AMOUNT,
      TOTAL_FUNDING,
    );

    return {
      contract,
      verifier,
      token,
      owner,
      claimer1,
      claimer2,
      nonOwner,
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

    it("should start with airdrop inactive", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.active()).to.be.false;
    });

    it("should start with zero stats", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.totalClaimed()).to.equal(0n);
      expect(await contract.claimCount()).to.equal(0n);
    });
  });

  describe("initializeETHAirdrop", function () {
    it("should initialize an ETH airdrop", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await contract.initializeETHAirdrop(MERKLE_ROOT, CLAIM_AMOUNT, {
        value: TOTAL_FUNDING,
      });

      expect(await contract.active()).to.be.true;
      expect(await contract.merkleRoot()).to.equal(MERKLE_ROOT);
      expect(await contract.claimAmount()).to.equal(CLAIM_AMOUNT);
      expect(await contract.isERC20()).to.be.false;
    });

    it("should emit AirdropCreated event", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract.initializeETHAirdrop(MERKLE_ROOT, CLAIM_AMOUNT, {
          value: TOTAL_FUNDING,
        }),
      )
        .to.emit(contract, "AirdropCreated")
        .withArgs(MERKLE_ROOT, TOTAL_FUNDING);
    });

    it("should hold the ETH in the contract", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await contract.initializeETHAirdrop(MERKLE_ROOT, CLAIM_AMOUNT, {
        value: TOTAL_FUNDING,
      });

      const contractAddress = await contract.getAddress();
      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(TOTAL_FUNDING);
    });

    it("should revert with InvalidMerkleRoot for zero root", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract.initializeETHAirdrop(ethers.ZeroHash, CLAIM_AMOUNT, {
          value: TOTAL_FUNDING,
        }),
      ).to.be.revertedWithCustomError(contract, "InvalidMerkleRoot");
    });

    it("should revert with OnlyOwner when called by non-owner", async function () {
      const { contract, nonOwner } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract
          .connect(nonOwner)
          .initializeETHAirdrop(MERKLE_ROOT, CLAIM_AMOUNT, {
            value: TOTAL_FUNDING,
          }),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });
  });

  describe("initializeERC20Airdrop", function () {
    it("should initialize an ERC20 airdrop", async function () {
      const { contract, token } = await loadFixture(deployWithERC20Airdrop);

      expect(await contract.active()).to.be.true;
      expect(await contract.merkleRoot()).to.equal(MERKLE_ROOT);
      expect(await contract.claimAmount()).to.equal(CLAIM_AMOUNT);
      expect(await contract.isERC20()).to.be.true;
      expect(await contract.token()).to.equal(await token.getAddress());
    });

    it("should transfer tokens to the contract", async function () {
      const { contract, token } = await loadFixture(deployWithERC20Airdrop);

      const contractAddress = await contract.getAddress();
      expect(await token.balanceOf(contractAddress)).to.equal(TOTAL_FUNDING);
    });

    it("should emit AirdropCreated event", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);

      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const token = await MockERC20.deploy();
      const contractAddress = await contract.getAddress();

      await token.mint(owner.address, TOTAL_FUNDING);
      await token.approve(contractAddress, TOTAL_FUNDING);

      await expect(
        contract.initializeERC20Airdrop(
          MERKLE_ROOT,
          await token.getAddress(),
          CLAIM_AMOUNT,
          TOTAL_FUNDING,
        ),
      )
        .to.emit(contract, "AirdropCreated")
        .withArgs(MERKLE_ROOT, TOTAL_FUNDING);
    });

    it("should revert with InvalidMerkleRoot for zero root", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);

      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const token = await MockERC20.deploy();

      await expect(
        contract.initializeERC20Airdrop(
          ethers.ZeroHash,
          await token.getAddress(),
          CLAIM_AMOUNT,
          TOTAL_FUNDING,
        ),
      ).to.be.revertedWithCustomError(contract, "InvalidMerkleRoot");
    });

    it("should revert with OnlyOwner when called by non-owner", async function () {
      const { contract, nonOwner } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract
          .connect(nonOwner)
          .initializeERC20Airdrop(
            MERKLE_ROOT,
            ethers.ZeroAddress,
            CLAIM_AMOUNT,
            TOTAL_FUNDING,
          ),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });
  });

  describe("claim (ETH airdrop)", function () {
    it("should transfer ETH to recipient on valid claim", async function () {
      const { contract, claimer1 } = await loadFixture(deployWithETHAirdrop);
      const nullifier = 1001n;

      const balanceBefore = await ethers.provider.getBalance(claimer1.address);

      await contract
        .connect(claimer1)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          nullifier,
          claimer1.address,
          CLAIM_AMOUNT,
        );

      const balanceAfter = await ethers.provider.getBalance(claimer1.address);
      // Balance should increase by roughly CLAIM_AMOUNT (minus gas costs)
      // Since claimer1 sends the tx and pays gas, but also receives ETH,
      // the net should be CLAIM_AMOUNT minus gas. We just check it's more.
      expect(balanceAfter).to.be.gt(balanceBefore - ethers.parseEther("0.01"));
    });

    it("should emit Claimed event", async function () {
      const { contract, claimer1 } = await loadFixture(deployWithETHAirdrop);
      const nullifier = 2001n;

      await expect(
        contract
          .connect(claimer1)
          .claim(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            nullifier,
            claimer1.address,
            CLAIM_AMOUNT,
          ),
      )
        .to.emit(contract, "Claimed")
        .withArgs(nullifier, claimer1.address, CLAIM_AMOUNT);
    });

    it("should update stats after claiming", async function () {
      const { contract, claimer1 } = await loadFixture(deployWithETHAirdrop);

      await contract
        .connect(claimer1)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          3001n,
          claimer1.address,
          CLAIM_AMOUNT,
        );

      expect(await contract.totalClaimed()).to.equal(CLAIM_AMOUNT);
      expect(await contract.claimCount()).to.equal(1n);
    });

    it("should mark nullifier as used", async function () {
      const { contract, claimer1 } = await loadFixture(deployWithETHAirdrop);
      const nullifier = 4001n;

      await contract
        .connect(claimer1)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          nullifier,
          claimer1.address,
          CLAIM_AMOUNT,
        );

      expect(await contract.isNullifierUsed(nullifier)).to.be.true;
    });

    it("should revert with AlreadyClaimed for duplicate nullifier", async function () {
      const { contract, claimer1, claimer2 } =
        await loadFixture(deployWithETHAirdrop);
      const nullifier = 5001n;

      await contract
        .connect(claimer1)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          nullifier,
          claimer1.address,
          CLAIM_AMOUNT,
        );

      await expect(
        contract
          .connect(claimer2)
          .claim(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            nullifier,
            claimer2.address,
            CLAIM_AMOUNT,
          ),
      ).to.be.revertedWithCustomError(contract, "AlreadyClaimed");
    });

    it("should revert with AirdropNotActive when airdrop is inactive", async function () {
      const { contract, claimer1 } = await loadFixture(deployWithTrueVerifier);

      await expect(
        contract
          .connect(claimer1)
          .claim(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            6001n,
            claimer1.address,
            CLAIM_AMOUNT,
          ),
      ).to.be.revertedWithCustomError(contract, "AirdropNotActive");
    });

    it("should revert with InvalidProof when verifier returns false", async function () {
      const { contract, owner, claimer1 } = await loadFixture(
        deployWithFalseVerifier,
      );

      await contract.initializeETHAirdrop(MERKLE_ROOT, CLAIM_AMOUNT, {
        value: TOTAL_FUNDING,
      });

      await expect(
        contract
          .connect(claimer1)
          .claim(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            7001n,
            claimer1.address,
            CLAIM_AMOUNT,
          ),
      ).to.be.revertedWithCustomError(contract, "InvalidProof");
    });

    it("should allow multiple claims with different nullifiers", async function () {
      const { contract, claimer1, claimer2 } =
        await loadFixture(deployWithETHAirdrop);

      await contract
        .connect(claimer1)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          8001n,
          claimer1.address,
          CLAIM_AMOUNT,
        );

      await contract
        .connect(claimer2)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          8002n,
          claimer2.address,
          CLAIM_AMOUNT,
        );

      expect(await contract.claimCount()).to.equal(2n);
      expect(await contract.totalClaimed()).to.equal(CLAIM_AMOUNT * 2n);
    });

    it("should use fixed claimAmount when set, ignoring _amount param", async function () {
      const { contract, claimer1 } = await loadFixture(deployWithETHAirdrop);
      const differentAmount = ethers.parseEther("5.0");

      // Pass a different amount, but contract should use the fixed claimAmount
      await expect(
        contract
          .connect(claimer1)
          .claim(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            9001n,
            claimer1.address,
            differentAmount,
          ),
      )
        .to.emit(contract, "Claimed")
        .withArgs(9001n, claimer1.address, CLAIM_AMOUNT);
    });
  });

  describe("claim (ERC20 airdrop)", function () {
    it("should transfer ERC20 tokens to recipient", async function () {
      const { contract, token, claimer1 } = await loadFixture(
        deployWithERC20Airdrop,
      );

      await contract
        .connect(claimer1)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          10001n,
          claimer1.address,
          CLAIM_AMOUNT,
        );

      expect(await token.balanceOf(claimer1.address)).to.equal(CLAIM_AMOUNT);
    });

    it("should emit Claimed event for ERC20", async function () {
      const { contract, claimer1 } = await loadFixture(deployWithERC20Airdrop);

      await expect(
        contract
          .connect(claimer1)
          .claim(
            DUMMY_PA,
            DUMMY_PB,
            DUMMY_PC,
            11001n,
            claimer1.address,
            CLAIM_AMOUNT,
          ),
      )
        .to.emit(contract, "Claimed")
        .withArgs(11001n, claimer1.address, CLAIM_AMOUNT);
    });

    it("should update stats for ERC20 claims", async function () {
      const { contract, claimer1 } = await loadFixture(deployWithERC20Airdrop);

      await contract
        .connect(claimer1)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          12001n,
          claimer1.address,
          CLAIM_AMOUNT,
        );

      expect(await contract.totalClaimed()).to.equal(CLAIM_AMOUNT);
      expect(await contract.claimCount()).to.equal(1n);
    });
  });

  describe("endAirdrop (ETH)", function () {
    it("should deactivate the airdrop", async function () {
      const { contract } = await loadFixture(deployWithETHAirdrop);

      await contract.endAirdrop();
      expect(await contract.active()).to.be.false;
    });

    it("should return remaining ETH to owner", async function () {
      const { contract, owner } = await loadFixture(deployWithETHAirdrop);

      const ownerBalanceBefore = await ethers.provider.getBalance(
        owner.address,
      );
      await contract.endAirdrop();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      // Owner should have received remaining ETH (minus gas)
      // TOTAL_FUNDING minus gas costs
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });

    it("should emit AirdropEnded event with remaining amount", async function () {
      const { contract } = await loadFixture(deployWithETHAirdrop);

      await expect(contract.endAirdrop())
        .to.emit(contract, "AirdropEnded")
        .withArgs(TOTAL_FUNDING);
    });

    it("should return partial ETH after some claims", async function () {
      const { contract, claimer1 } = await loadFixture(deployWithETHAirdrop);

      // Claim once
      await contract
        .connect(claimer1)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          13001n,
          claimer1.address,
          CLAIM_AMOUNT,
        );

      const remaining = TOTAL_FUNDING - CLAIM_AMOUNT;

      await expect(contract.endAirdrop())
        .to.emit(contract, "AirdropEnded")
        .withArgs(remaining);
    });

    it("should revert with OnlyOwner when called by non-owner", async function () {
      const { contract, nonOwner } = await loadFixture(deployWithETHAirdrop);

      await expect(
        contract.connect(nonOwner).endAirdrop(),
      ).to.be.revertedWithCustomError(contract, "OnlyOwner");
    });
  });

  describe("endAirdrop (ERC20)", function () {
    it("should return remaining tokens to owner", async function () {
      const { contract, token, owner } = await loadFixture(
        deployWithERC20Airdrop,
      );

      await contract.endAirdrop();

      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_FUNDING);
    });

    it("should return partial tokens after some claims", async function () {
      const { contract, token, owner, claimer1 } = await loadFixture(
        deployWithERC20Airdrop,
      );

      await contract
        .connect(claimer1)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          14001n,
          claimer1.address,
          CLAIM_AMOUNT,
        );

      await contract.endAirdrop();

      const remaining = TOTAL_FUNDING - CLAIM_AMOUNT;
      expect(await token.balanceOf(owner.address)).to.equal(remaining);
    });
  });

  describe("View functions", function () {
    it("getBalance should return ETH balance for ETH airdrop", async function () {
      const { contract } = await loadFixture(deployWithETHAirdrop);
      expect(await contract.getBalance()).to.equal(TOTAL_FUNDING);
    });

    it("getBalance should return token balance for ERC20 airdrop", async function () {
      const { contract } = await loadFixture(deployWithERC20Airdrop);
      expect(await contract.getBalance()).to.equal(TOTAL_FUNDING);
    });

    it("getStats should return correct stats", async function () {
      const { contract, claimer1 } = await loadFixture(deployWithETHAirdrop);

      await contract
        .connect(claimer1)
        .claim(
          DUMMY_PA,
          DUMMY_PB,
          DUMMY_PC,
          15001n,
          claimer1.address,
          CLAIM_AMOUNT,
        );

      const [totalClaimed, claimCount, remaining] = await contract.getStats();
      expect(totalClaimed).to.equal(CLAIM_AMOUNT);
      expect(claimCount).to.equal(1n);
      expect(remaining).to.equal(TOTAL_FUNDING - CLAIM_AMOUNT);
    });

    it("isNullifierUsed should return false for unused nullifier", async function () {
      const { contract } = await loadFixture(deployWithTrueVerifier);
      expect(await contract.isNullifierUsed(99999n)).to.be.false;
    });
  });

  describe("receive", function () {
    it("should accept plain ETH transfers", async function () {
      const { contract, owner } = await loadFixture(deployWithTrueVerifier);
      const contractAddress = await contract.getAddress();

      await owner.sendTransaction({
        to: contractAddress,
        value: ethers.parseEther("1.0"),
      });

      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(ethers.parseEther("1.0"));
    });
  });
});
