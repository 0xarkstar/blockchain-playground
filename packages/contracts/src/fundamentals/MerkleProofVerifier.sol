// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MerkleProofVerifier
/// @notice Verifies Merkle inclusion proofs on-chain for the Blockchain Fundamentals track
contract MerkleProofVerifier {
    event ProofVerified(bytes32 indexed root, bytes32 indexed leaf, bool valid);

    /// @notice Verify a Merkle proof
    /// @param proof Array of sibling hashes from leaf to root
    /// @param root The expected Merkle root
    /// @param leaf The leaf hash to prove inclusion for
    /// @param index The index of the leaf in the tree
    /// @return valid Whether the proof is valid
    function verify(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf,
        uint256 index
    ) external returns (bool valid) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            if (index % 2 == 0) {
                computedHash = keccak256(
                    abi.encodePacked(computedHash, proof[i])
                );
            } else {
                computedHash = keccak256(
                    abi.encodePacked(proof[i], computedHash)
                );
            }
            index = index / 2;
        }

        valid = computedHash == root;
        emit ProofVerified(root, leaf, valid);
    }
}
