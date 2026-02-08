import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("SignatureVerifier", function () {
  async function deployFixture() {
    const [owner, other] = await ethers.getSigners();
    const SignatureVerifier =
      await ethers.getContractFactory("SignatureVerifier");
    const contract = await SignatureVerifier.deploy();
    return { contract, owner, other };
  }

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.getAddress()).to.be.properAddress;
    });
  });

  describe("getEthSignedMessageHash", function () {
    it("should produce the correct prefixed hash for a message", async function () {
      const { contract } = await loadFixture(deployFixture);
      const message = ethers.toUtf8Bytes("Hello, World!");
      const contractHash = await contract.getEthSignedMessageHash(message);

      // Manually compute the expected hash
      // Ethereum signed message prefix: "\x19Ethereum Signed Message:\n" + length + message
      const prefix = "\x19Ethereum Signed Message:\n";
      const lengthStr = message.length.toString();
      const expectedHash = ethers.keccak256(
        ethers.solidityPacked(
          ["string", "string", "bytes"],
          [prefix, lengthStr, message],
        ),
      );

      expect(contractHash).to.equal(expectedHash);
    });

    it("should produce different hashes for different messages", async function () {
      const { contract } = await loadFixture(deployFixture);
      const hash1 = await contract.getEthSignedMessageHash(
        ethers.toUtf8Bytes("message1"),
      );
      const hash2 = await contract.getEthSignedMessageHash(
        ethers.toUtf8Bytes("message2"),
      );
      expect(hash1).to.not.equal(hash2);
    });

    it("should handle empty message", async function () {
      const { contract } = await loadFixture(deployFixture);
      const hash = await contract.getEthSignedMessageHash("0x");
      expect(hash).to.be.a("string").that.has.lengthOf(66); // 0x + 64 hex chars
    });
  });

  describe("verify", function () {
    it("should return true for a valid signature", async function () {
      const { contract, owner } = await loadFixture(deployFixture);

      const message = "Hello, blockchain!";
      // ethers signMessage automatically applies the EIP-191 prefix
      const signature = await owner.signMessage(message);

      // hashMessage also applies the prefix, matching what ecrecover expects
      const messageHash = ethers.hashMessage(message);

      const result = await contract.verify.staticCall(
        messageHash,
        signature,
        owner.address,
      );
      expect(result).to.be.true;
    });

    it("should return false for a wrong signer", async function () {
      const { contract, owner, other } = await loadFixture(deployFixture);

      const message = "Hello, blockchain!";
      const signature = await owner.signMessage(message);
      const messageHash = ethers.hashMessage(message);

      // Verify against the wrong address
      const result = await contract.verify.staticCall(
        messageHash,
        signature,
        other.address,
      );
      expect(result).to.be.false;
    });

    it("should return false for a tampered message", async function () {
      const { contract, owner } = await loadFixture(deployFixture);

      const message = "Hello, blockchain!";
      const signature = await owner.signMessage(message);

      // Use a different message hash
      const wrongHash = ethers.hashMessage("Tampered message!");

      const result = await contract.verify.staticCall(
        wrongHash,
        signature,
        owner.address,
      );
      expect(result).to.be.false;
    });

    it("should revert for invalid signature length (too short)", async function () {
      const { contract, owner } = await loadFixture(deployFixture);

      const messageHash = ethers.hashMessage("test");
      const shortSig = "0x" + "aa".repeat(32); // only 32 bytes

      await expect(
        contract.verify.staticCall(messageHash, shortSig, owner.address),
      ).to.be.revertedWith("Invalid signature length");
    });

    it("should revert for invalid signature length (too long)", async function () {
      const { contract, owner } = await loadFixture(deployFixture);

      const messageHash = ethers.hashMessage("test");
      const longSig = "0x" + "aa".repeat(66); // 66 bytes

      await expect(
        contract.verify.staticCall(messageHash, longSig, owner.address),
      ).to.be.revertedWith("Invalid signature length");
    });

    it("should emit SignatureVerified event (valid)", async function () {
      const { contract, owner } = await loadFixture(deployFixture);

      const message = "Hello, blockchain!";
      const signature = await owner.signMessage(message);
      const messageHash = ethers.hashMessage(message);

      await expect(contract.verify(messageHash, signature, owner.address))
        .to.emit(contract, "SignatureVerified")
        .withArgs(owner.address, messageHash, true);
    });

    it("should emit SignatureVerified event (invalid)", async function () {
      const { contract, owner, other } = await loadFixture(deployFixture);

      const message = "Hello, blockchain!";
      const signature = await owner.signMessage(message);
      const messageHash = ethers.hashMessage(message);

      await expect(contract.verify(messageHash, signature, other.address))
        .to.emit(contract, "SignatureVerified")
        .withArgs(other.address, messageHash, false);
    });

    it("should verify signatures from different signers", async function () {
      const { contract, owner, other } = await loadFixture(deployFixture);

      const message = "Shared message";
      const sig1 = await owner.signMessage(message);
      const sig2 = await other.signMessage(message);
      const messageHash = ethers.hashMessage(message);

      const result1 = await contract.verify.staticCall(
        messageHash,
        sig1,
        owner.address,
      );
      const result2 = await contract.verify.staticCall(
        messageHash,
        sig2,
        other.address,
      );

      expect(result1).to.be.true;
      expect(result2).to.be.true;
    });
  });
});
