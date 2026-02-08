import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("MerkleProofVerifier", function () {
  async function deployFixture() {
    const [owner] = await ethers.getSigners();
    const MerkleProofVerifier = await ethers.getContractFactory(
      "MerkleProofVerifier",
    );
    const contract = await MerkleProofVerifier.deploy();
    return { contract, owner };
  }

  // Helper to build a simple Merkle tree and produce a proof
  function buildMerkleTree(leaves: string[]): {
    root: string;
    layers: string[][];
  } {
    let layer = leaves.map((leaf) => leaf);
    const layers: string[][] = [layer];

    while (layer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < layer.length; i += 2) {
        if (i + 1 < layer.length) {
          nextLayer.push(
            ethers.keccak256(
              ethers.solidityPacked(
                ["bytes32", "bytes32"],
                [layer[i], layer[i + 1]],
              ),
            ),
          );
        } else {
          nextLayer.push(layer[i]);
        }
      }
      layer = nextLayer;
      layers.push(layer);
    }

    return { root: layer[0], layers };
  }

  function getProof(
    layers: string[][],
    leafIndex: number,
  ): { proof: string[]; index: number } {
    const proof: string[] = [];
    let idx = leafIndex;

    for (let i = 0; i < layers.length - 1; i++) {
      const layer = layers[i];
      const siblingIndex = idx % 2 === 0 ? idx + 1 : idx - 1;
      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }
      idx = Math.floor(idx / 2);
    }

    return { proof, index: leafIndex };
  }

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.getAddress()).to.be.properAddress;
    });
  });

  describe("verify", function () {
    it("should return true for a valid proof (4-leaf tree, index 0)", async function () {
      const { contract } = await loadFixture(deployFixture);

      const leaves = [
        ethers.keccak256(ethers.toUtf8Bytes("leaf0")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf1")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf2")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf3")),
      ];

      const { root, layers } = buildMerkleTree(leaves);
      const { proof, index } = getProof(layers, 0);

      const result = await contract.verify.staticCall(
        proof,
        root,
        leaves[0],
        index,
      );
      expect(result).to.be.true;
    });

    it("should return true for a valid proof (4-leaf tree, index 3)", async function () {
      const { contract } = await loadFixture(deployFixture);

      const leaves = [
        ethers.keccak256(ethers.toUtf8Bytes("leaf0")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf1")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf2")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf3")),
      ];

      const { root, layers } = buildMerkleTree(leaves);
      const { proof, index } = getProof(layers, 3);

      const result = await contract.verify.staticCall(
        proof,
        root,
        leaves[3],
        index,
      );
      expect(result).to.be.true;
    });

    it("should return false for an invalid proof (wrong leaf)", async function () {
      const { contract } = await loadFixture(deployFixture);

      const leaves = [
        ethers.keccak256(ethers.toUtf8Bytes("leaf0")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf1")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf2")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf3")),
      ];

      const { root, layers } = buildMerkleTree(leaves);
      const { proof, index } = getProof(layers, 0);

      const wrongLeaf = ethers.keccak256(ethers.toUtf8Bytes("wrong"));
      const result = await contract.verify.staticCall(
        proof,
        root,
        wrongLeaf,
        index,
      );
      expect(result).to.be.false;
    });

    it("should return false for an invalid proof (wrong root)", async function () {
      const { contract } = await loadFixture(deployFixture);

      const leaves = [
        ethers.keccak256(ethers.toUtf8Bytes("leaf0")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf1")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf2")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf3")),
      ];

      const { layers } = buildMerkleTree(leaves);
      const { proof, index } = getProof(layers, 0);

      const wrongRoot = ethers.keccak256(ethers.toUtf8Bytes("wrongroot"));
      const result = await contract.verify.staticCall(
        proof,
        wrongRoot,
        leaves[0],
        index,
      );
      expect(result).to.be.false;
    });

    it("should return false for wrong index", async function () {
      const { contract } = await loadFixture(deployFixture);

      const leaves = [
        ethers.keccak256(ethers.toUtf8Bytes("leaf0")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf1")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf2")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf3")),
      ];

      const { root, layers } = buildMerkleTree(leaves);
      const { proof } = getProof(layers, 0);

      // Use the correct proof for index 0 but pass index 1
      const result = await contract.verify.staticCall(
        proof,
        root,
        leaves[0],
        1,
      );
      expect(result).to.be.false;
    });

    it("should emit ProofVerified event (valid proof)", async function () {
      const { contract } = await loadFixture(deployFixture);

      const leaves = [
        ethers.keccak256(ethers.toUtf8Bytes("leaf0")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf1")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf2")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf3")),
      ];

      const { root, layers } = buildMerkleTree(leaves);
      const { proof, index } = getProof(layers, 0);

      await expect(contract.verify(proof, root, leaves[0], index))
        .to.emit(contract, "ProofVerified")
        .withArgs(root, leaves[0], true);
    });

    it("should emit ProofVerified event (invalid proof)", async function () {
      const { contract } = await loadFixture(deployFixture);

      const leaves = [
        ethers.keccak256(ethers.toUtf8Bytes("leaf0")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf1")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf2")),
        ethers.keccak256(ethers.toUtf8Bytes("leaf3")),
      ];

      const { root } = buildMerkleTree(leaves);
      const wrongLeaf = ethers.keccak256(ethers.toUtf8Bytes("wrong"));

      await expect(contract.verify([], root, wrongLeaf, 0))
        .to.emit(contract, "ProofVerified")
        .withArgs(root, wrongLeaf, false);
    });

    it("should handle a 2-leaf tree", async function () {
      const { contract } = await loadFixture(deployFixture);

      const leaves = [
        ethers.keccak256(ethers.toUtf8Bytes("a")),
        ethers.keccak256(ethers.toUtf8Bytes("b")),
      ];

      const { root, layers } = buildMerkleTree(leaves);
      const { proof, index } = getProof(layers, 1);

      const result = await contract.verify.staticCall(
        proof,
        root,
        leaves[1],
        index,
      );
      expect(result).to.be.true;
    });

    it("should handle a single-leaf tree (empty proof)", async function () {
      const { contract } = await loadFixture(deployFixture);

      const leaf = ethers.keccak256(ethers.toUtf8Bytes("solo"));
      // With an empty proof, the computed hash is just the leaf itself
      const result = await contract.verify.staticCall([], leaf, leaf, 0);
      expect(result).to.be.true;
    });
  });
});
