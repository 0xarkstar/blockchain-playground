// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title GasTestContract
/// @notice Various operations for gas cost comparison in the Gas Estimator demo
contract GasTestContract {
    mapping(uint256 => uint256) public storageMap;
    uint256 public storageValue;
    uint256[] public storageArray;

    /// @notice Simple storage write (SSTORE)
    function storageWrite(uint256 key, uint256 value) external {
        storageMap[key] = value;
    }

    /// @notice Simple storage read (SLOAD)
    function storageRead(uint256 key) external view returns (uint256) {
        return storageMap[key];
    }

    /// @notice Dynamic array push
    function arrayPush(uint256 value) external {
        storageArray.push(value);
    }

    /// @notice Keccak256 hashing
    function hashData(bytes calldata data) external pure returns (bytes32) {
        return keccak256(data);
    }

    /// @notice Simple ETH transfer
    function transferEth(address payable to) external payable {
        to.transfer(msg.value);
    }

    /// @notice Loop with computation
    function computeLoop(uint256 iterations) external pure returns (uint256) {
        uint256 result = 0;
        for (uint256 i = 0; i < iterations; i++) {
            result += i * i;
        }
        return result;
    }

    /// @notice Emit event
    event DataStored(uint256 indexed key, uint256 value);

    function storeWithEvent(uint256 key, uint256 value) external {
        storageMap[key] = value;
        emit DataStored(key, value);
    }

    receive() external payable {}
}
