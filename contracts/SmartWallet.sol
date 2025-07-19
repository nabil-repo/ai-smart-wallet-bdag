// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SmartWallet is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event TokenSent(address indexed token, address indexed to, uint256 amount);
    event TokenSwapped(address indexed fromToken, address indexed toToken, uint256 amountIn, uint256 amountOut);
    event GuardianAdded(address indexed guardian);
    event GuardianRemoved(address indexed guardian);
    event RecoveryInitiated(address indexed newOwner, uint256 timestamp);
    event RecoveryExecuted(address indexed newOwner);

    // State variables
    mapping(address => bool) public guardians;
    address[] public guardianList;
    uint256 public constant RECOVERY_DELAY = 2 days;
    
    struct Recovery {
        address newOwner;
        uint256 timestamp;
        uint256 confirmations;
        mapping(address => bool) confirmed;
    }
    
    Recovery public pendingRecovery;
    bool public recoveryActive;

    // Modifiers
    modifier onlyGuardian() {
        require(guardians[msg.sender], "Not a guardian");
        _;
    }

    constructor(address _owner) {
        _transferOwnership(_owner);
    }

    // Send tokens to another address
    function sendToken(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");

        if (token == address(0)) {
            // Send ETH
            require(address(this).balance >= amount, "Insufficient ETH balance");
            payable(to).transfer(amount);
        } else {
            // Send ERC20 token
            IERC20 tokenContract = IERC20(token);
            require(tokenContract.balanceOf(address(this)) >= amount, "Insufficient token balance");
            tokenContract.safeTransfer(to, amount);
        }

        emit TokenSent(token, to, amount);
    }

    // Get token balance
    function getTokenBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }

    // Add guardian for social recovery
    function addGuardian(address guardian) external onlyOwner {
        require(guardian != address(0), "Invalid guardian address");
        require(!guardians[guardian], "Guardian already exists");
        require(guardianList.length < 10, "Maximum guardians reached");

        guardians[guardian] = true;
        guardianList.push(guardian);
        emit GuardianAdded(guardian);
    }

    // Remove guardian
    function removeGuardian(address guardian) external onlyOwner {
        require(guardians[guardian], "Guardian does not exist");

        guardians[guardian] = false;
        
        // Remove from array
        for (uint256 i = 0; i < guardianList.length; i++) {
            if (guardianList[i] == guardian) {
                guardianList[i] = guardianList[guardianList.length - 1];
                guardianList.pop();
                break;
            }
        }

        emit GuardianRemoved(guardian);
    }

    // Initiate recovery process
    function initiateRecovery(address newOwner) external onlyGuardian {
        require(newOwner != address(0), "Invalid new owner");
        require(!recoveryActive, "Recovery already active");

        pendingRecovery.newOwner = newOwner;
        pendingRecovery.timestamp = block.timestamp;
        pendingRecovery.confirmations = 1;
        pendingRecovery.confirmed[msg.sender] = true;
        recoveryActive = true;

        emit RecoveryInitiated(newOwner, block.timestamp);
    }

    // Confirm recovery
    function confirmRecovery() external onlyGuardian {
        require(recoveryActive, "No active recovery");
        require(!pendingRecovery.confirmed[msg.sender], "Already confirmed");

        pendingRecovery.confirmed[msg.sender] = true;
        pendingRecovery.confirmations++;
    }

    // Execute recovery after delay and sufficient confirmations
    function executeRecovery() external {
        require(recoveryActive, "No active recovery");
        require(block.timestamp >= pendingRecovery.timestamp + RECOVERY_DELAY, "Recovery delay not met");
        require(pendingRecovery.confirmations >= (guardianList.length * 2) / 3, "Insufficient confirmations");

        address newOwner = pendingRecovery.newOwner;
        
        // Reset recovery state
        delete pendingRecovery;
        recoveryActive = false;

        _transferOwnership(newOwner);
        emit RecoveryExecuted(newOwner);
    }

    // Cancel recovery (only owner)
    function cancelRecovery() external onlyOwner {
        require(recoveryActive, "No active recovery");
        delete pendingRecovery;
        recoveryActive = false;
    }

    // Receive ETH
    receive() external payable {}

    // Get guardian count
    function getGuardianCount() external view returns (uint256) {
        return guardianList.length;
    }

    // Get all guardians
    function getGuardians() external view returns (address[] memory) {
        return guardianList;
    }
}
