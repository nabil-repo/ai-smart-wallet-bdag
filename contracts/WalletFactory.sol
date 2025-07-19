// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SmartWallet.sol";

contract WalletFactory {
    event WalletCreated(address indexed owner, address indexed wallet);
    
    mapping(address => address) public userWallets;
    address[] public allWallets;

    function createWallet() external returns (address) {
        require(userWallets[msg.sender] == address(0), "Wallet already exists");

        SmartWallet wallet = new SmartWallet(msg.sender);
        address walletAddress = address(wallet);

        userWallets[msg.sender] = walletAddress;
        allWallets.push(walletAddress);

        emit WalletCreated(msg.sender, walletAddress);
        return walletAddress;
    }

    function getWallet(address user) external view returns (address) {
        return userWallets[user];
    }

    function getAllWallets() external view returns (address[] memory) {
        return allWallets;
    }

    function getWalletCount() external view returns (uint256) {
        return allWallets.length;
    }
}
