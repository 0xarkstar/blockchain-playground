import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("GasTestContract", function () {
  async function deployFixture() {
    const [owner, recipient] = await ethers.getSigners();
    const GasTestContract = await ethers.getContractFactory("GasTestContract");
    const contract = await GasTestContract.deploy();
    return { contract, owner, recipient };
  }

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should initialize storageValue to 0", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.storageValue()).to.equal(0n);
    });
  });

  describe("storageWrite / storageRead", function () {
    it("should write and read a value from the mapping", async function () {
      const { contract } = await loadFixture(deployFixture);
      await contract.storageWrite(1, 42);
      expect(await contract.storageRead(1)).to.equal(42n);
    });

    it("should return 0 for unset keys", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.storageRead(999)).to.equal(0n);
    });

    it("should overwrite existing values", async function () {
      const { contract } = await loadFixture(deployFixture);
      await contract.storageWrite(1, 100);
      await contract.storageWrite(1, 200);
      expect(await contract.storageRead(1)).to.equal(200n);
    });

    it("should store multiple keys independently", async function () {
      const { contract } = await loadFixture(deployFixture);
      await contract.storageWrite(1, 10);
      await contract.storageWrite(2, 20);
      await contract.storageWrite(3, 30);
      expect(await contract.storageRead(1)).to.equal(10n);
      expect(await contract.storageRead(2)).to.equal(20n);
      expect(await contract.storageRead(3)).to.equal(30n);
    });
  });

  describe("arrayPush", function () {
    it("should push values to the storage array", async function () {
      const { contract } = await loadFixture(deployFixture);
      await contract.arrayPush(10);
      await contract.arrayPush(20);
      expect(await contract.storageArray(0)).to.equal(10n);
      expect(await contract.storageArray(1)).to.equal(20n);
    });

    it("should revert when reading out-of-bounds index", async function () {
      const { contract } = await loadFixture(deployFixture);
      await expect(contract.storageArray(0)).to.be.reverted;
    });
  });

  describe("hashData", function () {
    it("should return the keccak256 hash of the input", async function () {
      const { contract } = await loadFixture(deployFixture);
      const data = ethers.toUtf8Bytes("hello");
      const expectedHash = ethers.keccak256(data);
      expect(await contract.hashData(data)).to.equal(expectedHash);
    });

    it("should return a different hash for different inputs", async function () {
      const { contract } = await loadFixture(deployFixture);
      const hash1 = await contract.hashData(ethers.toUtf8Bytes("hello"));
      const hash2 = await contract.hashData(ethers.toUtf8Bytes("world"));
      expect(hash1).to.not.equal(hash2);
    });

    it("should handle empty data", async function () {
      const { contract } = await loadFixture(deployFixture);
      const expectedHash = ethers.keccak256("0x");
      expect(await contract.hashData("0x")).to.equal(expectedHash);
    });
  });

  describe("transferEth", function () {
    it("should transfer ETH to the recipient", async function () {
      const { contract, recipient } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("1.0");

      const balanceBefore = await ethers.provider.getBalance(recipient.address);
      await contract.transferEth(recipient.address, { value: amount });
      const balanceAfter = await ethers.provider.getBalance(recipient.address);

      expect(balanceAfter - balanceBefore).to.equal(amount);
    });

    it("should transfer zero ETH without reverting", async function () {
      const { contract, recipient } = await loadFixture(deployFixture);
      await expect(contract.transferEth(recipient.address, { value: 0 })).to.not
        .be.reverted;
    });
  });

  describe("computeLoop", function () {
    it("should return 0 for 0 iterations", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.computeLoop(0)).to.equal(0n);
    });

    it("should return 0 for 1 iteration (0*0)", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.computeLoop(1)).to.equal(0n);
    });

    it("should compute sum of squares correctly", async function () {
      const { contract } = await loadFixture(deployFixture);
      // iterations=5: 0*0 + 1*1 + 2*2 + 3*3 + 4*4 = 0 + 1 + 4 + 9 + 16 = 30
      expect(await contract.computeLoop(5)).to.equal(30n);
    });

    it("should handle larger iteration counts", async function () {
      const { contract } = await loadFixture(deployFixture);
      // iterations=10: sum of i^2 for i=0..9 = 285
      expect(await contract.computeLoop(10)).to.equal(285n);
    });
  });

  describe("storeWithEvent", function () {
    it("should store the value in the mapping", async function () {
      const { contract } = await loadFixture(deployFixture);
      await contract.storeWithEvent(5, 500);
      expect(await contract.storageRead(5)).to.equal(500n);
    });

    it("should emit DataStored event with correct args", async function () {
      const { contract } = await loadFixture(deployFixture);
      await expect(contract.storeWithEvent(5, 500))
        .to.emit(contract, "DataStored")
        .withArgs(5n, 500n);
    });
  });

  describe("receive", function () {
    it("should accept plain ETH transfers", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("1.0");
      const contractAddress = await contract.getAddress();

      await owner.sendTransaction({ to: contractAddress, value: amount });

      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(amount);
    });
  });
});
