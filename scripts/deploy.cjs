const { ethers } = require("hardhat")
const hre = require("hardhat")
const fs = require("fs")
const path = require("path")

async function main() {
  console.log("Deploying Smart Wallet contracts...")


  // Deploy WalletFactory
  const WalletFactory = await ethers.getContractFactory("WalletFactory")
  const walletFactory = await WalletFactory.deploy()
  await walletFactory.waitForDeployment()

  const factoryAddress = await walletFactory.getAddress()
  console.log("WalletFactory deployed to:", factoryAddress)

  // Generate ABI files
  console.log("Generating ABI files...")

  const smartWalletArtifact = await hre.artifacts.readArtifact("SmartWallet")
  const walletFactoryArtifact = await hre.artifacts.readArtifact("WalletFactory")

  // Create contracts directory if it doesn't exist
  const contractsDir = path.join(__dirname, "../contracts")
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true })
  }

  // Generate SmartWallet ABI file
  const smartWalletABI = {
    abi: smartWalletArtifact.abi,
    bytecode: smartWalletArtifact.bytecode,
  }

  fs.writeFileSync(path.join(contractsDir, "SmartWallet.json"), JSON.stringify(smartWalletABI, null, 2))

  // Generate WalletFactory ABI file
  const walletFactoryABI = {
    abi: walletFactoryArtifact.abi,
    bytecode: walletFactoryArtifact.bytecode,
  }

  fs.writeFileSync(path.join(contractsDir, "WalletFactory.json"), JSON.stringify(walletFactoryABI, null, 2))

  // Update constants file
  const constantsPath = path.join(__dirname, "../lib/constants.ts")
  let constantsContent = fs.readFileSync(constantsPath, "utf8")

  // Update the contract addresses
  constantsContent = constantsContent.replace(/WALLET_FACTORY: ".*"/, `WALLET_FACTORY: "${factoryAddress}"`)

  fs.writeFileSync(constantsPath, constantsContent)

  // Save deployment data
  const deploymentData = {
    walletFactory: factoryAddress,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    chainId: hre.network.config.chainId,
  }

  fs.writeFileSync("./deployments.json", JSON.stringify(deploymentData, null, 2))

  console.log("Deployment completed!")
  console.log("ABI files generated!")
  console.log("Constants updated!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
