import { hashBytes, type HashAlgorithm } from "./hash";
import { bytesToHex } from "@blockchain-playground/utils";

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
  index?: number;
  level: number;
  position: number;
}

export interface MerkleProof {
  leaf: string;
  index: number;
  siblings: Array<{ hash: string; position: "left" | "right" }>;
  root: string;
}

export class MerkleTree {
  readonly root: MerkleNode;
  readonly leaves: MerkleNode[];
  readonly levels: MerkleNode[][];
  private readonly algorithm: HashAlgorithm;

  constructor(data: string[], algorithm: HashAlgorithm = "keccak256") {
    this.algorithm = algorithm;
    this.leaves = data.map((d, i) => ({
      hash: bytesToHex(hashBytes(d, algorithm)),
      data: d,
      index: i,
      level: 0,
      position: i,
    }));

    this.levels = [this.leaves];
    this.root = this.buildTree(this.leaves);
  }

  private buildTree(nodes: MerkleNode[]): MerkleNode {
    if (nodes.length === 1) return nodes[0];

    const nextLevel: MerkleNode[] = [];
    const level = nodes[0].level + 1;

    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = nodes[i + 1] ?? left;

      const combinedBytes = new Uint8Array(64);
      const leftBytes = new Uint8Array(
        left.hash
          .slice(2)
          .match(/.{2}/g)!
          .map((b) => parseInt(b, 16)),
      );
      const rightBytes = new Uint8Array(
        right.hash
          .slice(2)
          .match(/.{2}/g)!
          .map((b) => parseInt(b, 16)),
      );
      combinedBytes.set(leftBytes, 0);
      combinedBytes.set(rightBytes, 32);

      const parentHash = bytesToHex(hashBytes(combinedBytes, this.algorithm));

      nextLevel.push({
        hash: parentHash,
        left,
        right: nodes[i + 1] ? right : undefined,
        level,
        position: Math.floor(i / 2),
      });
    }

    this.levels.push(nextLevel);
    return this.buildTree(nextLevel);
  }

  getProof(index: number): MerkleProof {
    const siblings: MerkleProof["siblings"] = [];
    let currentIndex = index;

    for (let level = 0; level < this.levels.length - 1; level++) {
      const nodes = this.levels[level];
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;

      if (siblingIndex < nodes.length) {
        siblings.push({
          hash: nodes[siblingIndex].hash,
          position: isRight ? "left" : "right",
        });
      } else {
        siblings.push({
          hash: nodes[currentIndex].hash,
          position: "right",
        });
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      leaf: this.leaves[index].hash,
      index,
      siblings,
      root: this.root.hash,
    };
  }

  static verifyProof(
    proof: MerkleProof,
    algorithm: HashAlgorithm = "keccak256",
  ): boolean {
    let currentHash = proof.leaf;

    for (const sibling of proof.siblings) {
      const leftHash = sibling.position === "left" ? sibling.hash : currentHash;
      const rightHash =
        sibling.position === "right" ? sibling.hash : currentHash;

      const leftBytes = new Uint8Array(
        leftHash
          .slice(2)
          .match(/.{2}/g)!
          .map((b) => parseInt(b, 16)),
      );
      const rightBytes = new Uint8Array(
        rightHash
          .slice(2)
          .match(/.{2}/g)!
          .map((b) => parseInt(b, 16)),
      );

      const combined = new Uint8Array(64);
      combined.set(leftBytes, 0);
      combined.set(rightBytes, 32);
      currentHash = bytesToHex(hashBytes(combined, algorithm));
    }

    return currentHash === proof.root;
  }
}
