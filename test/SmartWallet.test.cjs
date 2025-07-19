const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("SmartWallet", () => {
  let smartWallet
  let walletFactory
  let owner
  let guardian1
  let guardian2
  let recipient
  let mockToken

  beforeEach(async () => {
    ;[owner, guardian1, guardian2, recipient] = await ethers.getSigners()

    // Deploy WalletFactory
    const WalletFactory = await ethers.getContractFactory("WalletFactory")
    walletFactory = await WalletFactory.deploy()
    await walletFactory.waitForDeployment()

    // Create a wallet
    await walletFactory.connect(owner).createWallet()
    const walletAddress = await walletFactory.getWallet(owner.address)
    smartWallet = await ethers.getContractAt("SmartWallet", walletAddress)

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20")
    mockToken = await MockToken.deploy("Test Token", "TEST", ethers.parseEther("1000"))
    await mockToken.waitForDeployment()
  })

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await smartWallet.owner()).to.equal(owner.address)
    })
  })

  describe("Token Operations", () => {
    beforeEach(async () => {
      // Transfer some tokens to the wallet
      await mockToken.transfer(smartWallet.target, ethers.parseEther("100"))

      // Send some ETH to the wallet
      await owner.sendTransaction({
        to: smartWallet.target,
        value: ethers.parseEther("1"),
      })
    })

    it("Should send ERC20 tokens", async () => {
      const amount = ethers.parseEther("10")

      await smartWallet.connect(owner).sendToken(mockToken.target, recipient.address, amount)

      expect(await mockToken.balanceOf(recipient.address)).to.equal(amount)
    })

    it("Should send ETH", async () => {
      const amount = ethers.parseEther("0.1")
      const initialBalance = await ethers.provider.getBalance(recipient.address)

      await smartWallet.connect(owner).sendToken(ethers.ZeroAddress, recipient.address, amount)

      const finalBalance = await ethers.provider.getBalance(recipient.address)
      expect(finalBalance - initialBalance).to.equal(amount)
    })

    it("Should get token balance", async () => {
      const balance = await smartWallet.getTokenBalance(mockToken.target)
      expect(balance).to.equal(ethers.parseEther("100"))
    })

    it("Should get ETH balance", async () => {
      const balance = await smartWallet.getTokenBalance(ethers.ZeroAddress)
      expect(balance).to.equal(ethers.parseEther("1"))
    })
  })

  describe("Guardian Management", () => {
    it("Should add guardian", async () => {
      await smartWallet.connect(owner).addGuardian(guardian1.address)
      expect(await smartWallet.guardians(guardian1.address)).to.be.true
    })

    it("Should remove guardian", async () => {
      await smartWallet.connect(owner).addGuardian(guardian1.address)
      await smartWallet.connect(owner).removeGuardian(guardian1.address)
      expect(await smartWallet.guardians(guardian1.address)).to.be.false
    })

    it("Should not allow non-owner to add guardian", async () => {
      await expect(smartWallet.connect(guardian1).addGuardian(guardian2.address)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      )
    })
  })

  describe("Recovery Process", () => {
    beforeEach(async () => {
      await smartWallet.connect(owner).addGuardian(guardian1.address)
      await smartWallet.connect(owner).addGuardian(guardian2.address)
    })

    it("Should initiate recovery", async () => {
      await smartWallet.connect(guardian1).initiateRecovery(recipient.address)
      expect(await smartWallet.recoveryActive()).to.be.true
    })

    it("Should confirm recovery", async () => {
      await smartWallet.connect(guardian1).initiateRecovery(recipient.address)
      await smartWallet.connect(guardian2).confirmRecovery()

      const recovery = await smartWallet.pendingRecovery()
      expect(recovery.confirmations).to.equal(2)
    })
  })
})
