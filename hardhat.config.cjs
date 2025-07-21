require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    blockdag: {
      url: process.env.BLOCKDAG_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1043,
    },
  }
};
