"use client"
import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, SUPPORTED_TOKENS } from "./constants"

const SmartWalletABI = [
  "function sendToken(address token, address to, uint256 amount) external",
  "function getTokenBalance(address token) external view returns (uint256)",
  "function addGuardian(address guardian) external",
  "function removeGuardian(address guardian) external",
  "function getGuardians() external view returns (address[])",
  "function getGuardianCount() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function initiateRecovery(address newOwner) external",
  "function confirmRecovery() external",
  "function executeRecovery() external",
  "function cancelRecovery() external",
  "function guardians(address) external view returns (bool)",
  "function recoveryActive() external view returns (bool)",
  "event TokenSent(address indexed token, address indexed to, uint256 amount)",
  "event GuardianAdded(address indexed guardian)",
  "event GuardianRemoved(address indexed guardian)",
]

const WalletFactoryABI = [
  "function createWallet() external returns (address)",
  "function getWallet(address user) external view returns (address)",
  "function userWallets(address) external view returns (address)",
  "function getAllWallets() external view returns (address[])",
  "function getWalletCount() external view returns (uint256)",
  "event WalletCreated(address indexed owner, address indexed wallet)",
]

const BDAG_PARAMS  = {
  chainId: "0x413",
  chainName: "BlockDAG Primordial Testnet",
  nativeCurrency: {
    name: "BlockDAG",
    symbol: "BDAG",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.primordial.bdagscan.com"],
  blockExplorerUrls: ["https://primordial.bdagscan.com"],
};


export class WalletService {
  private signer: ethers.Signer | null = null
  private smartWallet: ethers.Contract | null = null
  private smartWalletAddress: string = ""

  constructor(signer: ethers.Signer) {
    this.signer = signer
  }



  async connect(): Promise<string> {
    try {
      await this.ensureCorrectNetwork()

      const address = await this.signer.getAddress()
      await this.getOrCreateSmartWallet(address)

      return address
    } catch (error: any) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }

  private async ensureCorrectNetwork() {
    const targetChainId = BDAG_PARAMS .chainId

    const currentChainId = await window.ethereum.request({ method: "eth_chainId" })

    if (currentChainId !== targetChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [BDAG_PARAMS ],
          })
        } else {
          throw switchError
        }
      }
    }
  }


  async getOrCreateSmartWallet(userAddress: string): Promise<string> {
    if (!this.signer) throw new Error("Signer not initialized")

    const factory = new ethers.Contract(
      CONTRACT_ADDRESSES.WALLET_FACTORY,
      WalletFactoryABI,
      this.signer
    )

    let walletAddress = await factory.getWallet(userAddress)


    if (walletAddress === ethers.ZeroAddress) {
      console.log("✅ No wallet found. Creating new smart wallet...")
      console.log(walletAddress)
      const tx = await factory.createWallet()
      await tx.wait()
      walletAddress = await factory.getWallet(userAddress)
    } else {
      console.log("✅ Existing smart wallet found:", walletAddress)
    }

    this.smartWalletAddress = walletAddress
    this.smartWallet = new ethers.Contract(walletAddress, SmartWalletABI, this.signer)

    return walletAddress
  }

  async getSmartWalletAddress(): Promise<string> {
    return this.smartWalletAddress
  }

  async sendToken(token: string, to: string, amount: string): Promise<string> {
    if (!this.smartWallet) throw new Error("Smart wallet not initialized")

    const tokenAddress = SUPPORTED_TOKENS[token.toUpperCase()] || token
    const parsedAmount = ethers.parseEther(amount)

    const tx = await this.smartWallet.sendToken(tokenAddress, to, parsedAmount)
    return tx.hash
  }

  async getBalance(token: string): Promise<string> {
    if (!this.smartWallet) throw new Error("Smart wallet not initialized")

    const tokenAddress = SUPPORTED_TOKENS[token.toUpperCase()] || token
    const balance = await this.smartWallet.getTokenBalance(tokenAddress)

    return ethers.formatEther(balance)
  }

  async getAllBalances(): Promise<Array<{ token: string; balance: string }>> {
    const balances: Array<{ token: string; balance: string }> = []

    for (const [symbol] of Object.entries(SUPPORTED_TOKENS)) {
      try {
        const balance = await this.getBalance(symbol)
        if (parseFloat(balance) > 0) {
          balances.push({ token: symbol, balance })
        }
      } catch (err) {
        console.warn(`Skipping ${symbol}:`, err)
      }
    }

    return balances
  }

  async addGuardian(guardian: string): Promise<string> {
    if (!this.smartWallet) throw new Error("Smart wallet not initialized")

    const tx = await this.smartWallet.addGuardian(guardian)
    return tx.hash
  }

  async getGuardians(): Promise<string[]> {
    if (!this.smartWallet) throw new Error("Smart wallet not initialized")

    return await this.smartWallet.getGuardians()
  }

  async initiateRecovery(newOwner: string): Promise<string> {
    if (!this.smartWallet) throw new Error("Smart wallet not initialized")
    const tx = await this.smartWallet.initiateRecovery(newOwner)
    return tx.hash
  }

  async confirmRecovery(): Promise<string> {
    if (!this.smartWallet) throw new Error("Smart wallet not initialized")
    const tx = await this.smartWallet.confirmRecovery()
    return tx.hash
  }

  async executeRecovery(): Promise<string> {
    if (!this.smartWallet) throw new Error("Smart wallet not initialized")
    const tx = await this.smartWallet.executeRecovery()
    return tx.hash
  }

  async cancelRecovery(): Promise<string> {
    if (!this.smartWallet) throw new Error("Smart wallet not initialized")
    const tx = await this.smartWallet.cancelRecovery()
    return tx.hash
  }

}
