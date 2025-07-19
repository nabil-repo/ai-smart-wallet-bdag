export type AIIntent = {
  action: "send" | "swap" | "balance" | "recover" | "unknown" | "general prompts" | "price";
  confidence: number;
  token?: string;
  amount?: string;
  to?: string;
  fromToken?: string;
  toToken?: string;
  aiResponse?: string; // <--- this is new
};


export interface TokenInfo {
  symbol: string
  address: string
  decimals: number
  name: string
}

export interface WalletBalance {
  token: string
  balance: string
  symbol: string
  usdValue?: string
}

export interface Transaction {
  hash: string
  type: string
  amount: string
  token: string
  to?: string
  from?: string
  timestamp: number
  status: "pending" | "confirmed" | "failed"
}
