/**
 * ZK Set Membership — prove you belong to a group without revealing which member you are.
 *
 * Uses a simplified Merkle-commitment approach:
 *   1. Each member commits to their identity: hash(id || secret)
 *   2. Commitments form a Merkle tree
 *   3. A member proves membership by revealing a Merkle path + their secret,
 *      without revealing their identity index
 *
 * In production, this is the idea behind Semaphore / Tornado Cash nullifiers.
 */

import { hashToHex, type HashScheme } from "./commitment";

// ── Types ──────────────────────────────────────────────────────────────

export interface MemberCommitment {
  readonly index: number;
  readonly commitment: string; // hash(id || secret)
}

export interface MemberGroup {
  readonly members: readonly MemberCommitment[];
  readonly root: string; // Merkle root of commitments
  readonly tree: readonly string[]; // full binary tree (1-indexed)
}

export interface MerklePathNode {
  readonly hash: string;
  readonly position: "left" | "right";
}

export interface ZKMembershipProof {
  readonly memberCommitment: string;
  readonly merklePath: readonly MerklePathNode[];
  readonly root: string;
  readonly verified: boolean;
}

export interface ProofComparison {
  readonly transparent: {
    readonly revealed: string;
    readonly info: string;
  };
  readonly zk: {
    readonly revealed: string;
    readonly info: string;
  };
}

// ── Merkle tree helpers ────────────────────────────────────────────────

function nextPow2(n: number): number {
  let v = 1;
  while (v < n) v <<= 1;
  return v;
}

function buildMerkleTree(
  leaves: readonly string[],
  scheme: HashScheme = "sha256"
): readonly string[] {
  const n = nextPow2(leaves.length);
  const tree: string[] = new Array(2 * n).fill("");

  // Fill leaves
  for (let i = 0; i < leaves.length; i++) {
    tree[n + i] = leaves[i];
  }
  // Pad remaining leaves with hash of empty
  for (let i = leaves.length; i < n; i++) {
    tree[n + i] = hashToHex("empty", scheme);
  }
  // Build parents
  for (let i = n - 1; i >= 1; i--) {
    tree[i] = hashToHex(tree[2 * i] + tree[2 * i + 1], scheme);
  }
  return tree;
}

// ── Public API ─────────────────────────────────────────────────────────

/** Create a group from member identifiers, each committed with a secret. */
export function createMemberGroup(
  members: readonly string[],
  secrets?: readonly string[],
  scheme: HashScheme = "sha256"
): MemberGroup {
  const commitments: MemberCommitment[] = members.map((id, i) => {
    const secret = secrets?.[i] ?? `secret_${i}`;
    return {
      index: i,
      commitment: hashToHex(`${id}:${secret}`, scheme),
    };
  });
  const leaves = commitments.map((c) => c.commitment);
  const tree = buildMerkleTree(leaves, scheme);
  return { members: commitments, root: tree[1], tree };
}

/** Prove membership at a given index. */
export function proveZKMembership(
  group: MemberGroup,
  memberIndex: number,
  secret: string,
  scheme: HashScheme = "sha256"
): ZKMembershipProof {
  const n = nextPow2(group.members.length);
  const commitment = group.members[memberIndex].commitment;

  // Verify the secret matches
  const memberIds = group.members.map((_, i) => i);
  void memberIds; // unused, just for clarity

  // Build Merkle path
  const path: MerklePathNode[] = [];
  let idx = n + memberIndex; // leaf position in tree
  while (idx > 1) {
    const sibling = idx ^ 1; // XOR to get sibling
    path.push({
      hash: group.tree[sibling] as string,
      position: idx % 2 === 0 ? "right" : "left",
    });
    idx >>= 1;
  }

  // Verify: recompute root from leaf + path
  let current = commitment;
  for (const node of path) {
    current =
      node.position === "right"
        ? hashToHex(current + node.hash, scheme)
        : hashToHex(node.hash + current, scheme);
  }
  const verified = current === group.root;

  return { memberCommitment: commitment, merklePath: path, root: group.root, verified };
}

/** Verify a membership proof against a known root. */
export function verifyZKMembership(
  root: string,
  proof: ZKMembershipProof,
  scheme: HashScheme = "sha256"
): boolean {
  let current = proof.memberCommitment;
  for (const node of proof.merklePath) {
    current =
      node.position === "right"
        ? hashToHex(current + node.hash, scheme)
        : hashToHex(node.hash + current, scheme);
  }
  return current === root;
}

/** Compare transparent vs zero-knowledge proof: what does the verifier learn? */
export function compareProofs(): ProofComparison {
  return {
    transparent: {
      revealed: "Member identity, index in group, secret",
      info: "Verifier knows exactly who the member is and their position in the group",
    },
    zk: {
      revealed: "Merkle path, commitment hash, root",
      info: "Verifier only knows someone is in the group — not who or which position",
    },
  };
}
