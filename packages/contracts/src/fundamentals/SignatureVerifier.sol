// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SignatureVerifier
/// @notice ECDSA signature verification using ecrecover for the Digital Signature Studio demo
contract SignatureVerifier {
    event SignatureVerified(
        address indexed signer,
        bytes32 indexed messageHash,
        bool valid
    );

    /// @notice Verify an ECDSA signature
    /// @param messageHash The hash of the signed message (prefixed with Ethereum signed message header)
    /// @param signature The 65-byte signature (r, s, v)
    /// @param expectedSigner The address expected to have signed the message
    /// @return valid Whether the signature is valid
    function verify(
        bytes32 messageHash,
        bytes calldata signature,
        address expectedSigner
    ) external returns (bool valid) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }

        if (v < 27) {
            v += 27;
        }

        address recovered = ecrecover(messageHash, v, r, s);
        valid = recovered == expectedSigner && recovered != address(0);

        emit SignatureVerified(expectedSigner, messageHash, valid);
    }

    /// @notice Get the Ethereum signed message hash
    /// @param message The original message bytes
    /// @return The prefixed message hash
    function getEthSignedMessageHash(
        bytes calldata message
    ) external pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n",
                    _toString(message.length),
                    message
                )
            );
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
