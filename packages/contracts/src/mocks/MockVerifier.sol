// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockVerifier1
/// @notice Mock Groth16 verifier for HashPreimageVerifier (1 public signal)
contract MockVerifier1 {
    bool public shouldReturn;

    constructor(bool _shouldReturn) {
        shouldReturn = _shouldReturn;
    }

    function setShouldReturn(bool _shouldReturn) external {
        shouldReturn = _shouldReturn;
    }

    function verifyProof(
        uint256[2] calldata,
        uint256[2][2] calldata,
        uint256[2] calldata,
        uint256[1] calldata
    ) external view returns (bool) {
        return shouldReturn;
    }
}

/// @title MockVerifier3
/// @notice Mock Groth16 verifier for AgeVerifier (3 public signals)
contract MockVerifier3 {
    bool public shouldReturn;

    constructor(bool _shouldReturn) {
        shouldReturn = _shouldReturn;
    }

    function setShouldReturn(bool _shouldReturn) external {
        shouldReturn = _shouldReturn;
    }

    function verifyProof(
        uint256[2] calldata,
        uint256[2][2] calldata,
        uint256[2] calldata,
        uint256[3] calldata
    ) external view returns (bool) {
        return shouldReturn;
    }
}

/// @title MockVerifier4
/// @notice Mock verifier for SecretVoting and PrivateAirdrop (4 public signals)
contract MockVerifier4 {
    bool public shouldReturn;

    constructor(bool _shouldReturn) {
        shouldReturn = _shouldReturn;
    }

    function setShouldReturn(bool _shouldReturn) external {
        shouldReturn = _shouldReturn;
    }

    function verifyProof(
        uint[2] calldata,
        uint[2][2] calldata,
        uint[2] calldata,
        uint[4] calldata
    ) external view returns (bool) {
        return shouldReturn;
    }
}

/// @title MockERC20
/// @notice Minimal ERC20 mock for PrivateAirdrop tests
contract MockERC20 {
    string public name = "MockToken";
    string public symbol = "MOCK";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        allowance[from][msg.sender] -= value;
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
        return true;
    }
}
