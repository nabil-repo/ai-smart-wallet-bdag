const fs = require("fs")
const path = require("path")

async function generateABIs() {
  console.log("Generating ABI files...")

  // Read compiled contracts
  const smartWalletArtifact = require("../artifacts/contracts/SmartWallet.sol/SmartWallet.json")
  const walletFactoryArtifact = require("../artifacts/contracts/WalletFactory.sol/WalletFactory.json")

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

  console.log("ABI files generated successfully!")
}

generateABIs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
