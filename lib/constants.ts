export const SUPPORTED_TOKENS: Record<string, string> = {
  BDAG: "0x0000000000000000000000000000000000000000"
}

export const CONTRACT_ADDRESSES = {
  WALLET_FACTORY: process.env.NEXT_PUBLIC_WALLET_FACTORY_ADDRESS || "0xF030E94be8B2fCDF2317928CACaF8979F3DEc524",
  SMART_WALLET: "0x...", // Will be populated after deployment
}

export const AVALANCHE_FUJI_TESTNET = {
  chainId: Number.parseInt(process.env.NEXT_PUBLIC_AVALANCHE_CHAIN_ID || "43113"),
  name: "Avalanche Fuji Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
  blockExplorer: process.env.NEXT_PUBLIC_AVALANCHE_EXPLORER || "https://subnets-test.avax.network/c-chain",
};



// Network configuration
export const NETWORK_CONFIG = {
  [AVALANCHE_FUJI_TESTNET.chainId]: AVALANCHE_FUJI_TESTNET,
}
