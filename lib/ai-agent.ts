import type { AIIntent } from "./types";

export class AIAgent {
  async parseIntent(userMessage: string): Promise<AIIntent> {

    try {
      const res = await fetch("/api/ai-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          intentOnly: true,
        }),
      });

      const data = await res.json();


      if (!data.action || typeof data.confidence !== "number") {
        throw new Error("Invalid intent structure");
      }

      return data as AIIntent;
    } catch (error) {
      console.error("parseIntent fallback:", error);
      return this.getMockIntent(userMessage);
    }
  }



  async generateResponse(intent: AIIntent, result?: any): Promise<string> {
    try {
      if (intent.action !== "general prompts") {
        return this.getMockResponse(intent, result);
      }

      if (intent.aiResponse) {
        return intent.aiResponse;
      }

      // (Optional fallback for general prompts)
      return this.getMockResponse(intent, result);
    } catch (error) {
      console.error("generateResponse fallback:", error);
      return this.getMockResponse(intent, result);
    }
  }


  private getMockIntent(userMessage: string): AIIntent {
    const message = userMessage.toLowerCase();

    if (message.includes("send") && message.includes("bdag")) {
      return { action: "send", token: "BDAG", amount: "0.1", to: "demo address", confidence: 0.8 };
    } else if (message.includes("balance")) {
      return { action: "balance", confidence: 0.9 };
    } else if (message.includes("swap")) {
      return { action: "swap", fromToken: "USDC", toToken: "BDAG", amount: "100", confidence: 0.8 };
    } else if (message.includes("price")) {
      return { action: "price", token: "BDAG", confidence: 0.9 };
    } else if (message.includes("recover") || message.includes("recovery")) {
      return { action: "recover", confidence: 0.9 };
    } else {
      return {
        action: "general prompts",
        confidence: 1.0,
        aiResponse: "👋 Hello! How can I assist you with your wallet today?",
      };
    }
  }

  public getMockResponse(intent: AIIntent, result?: any): string {
    console.log(result)
    switch (intent.action) {
      case "send":
        return result
          ? `✅ Sent ${intent.amount} ${intent.token} to ${intent.to}.`
          : `❌ Failed to send ${intent.amount} ${intent.token} to ${intent.to}.`;
      case "balance":
        if (!result || result.length === 0) {
          return "💰 No balances found.";
        }
        const balanceLines = result.map((b: any) => `- ${b.token}: ${b.balance}`).join("\n");
        return `💰 Your balances:\n${balanceLines}`;

      case "swap":
        return result
          ? `✅ Swapped ${intent.amount} ${intent.fromToken} to ${intent.toToken}.`
          : `❌ Failed to swap ${intent.amount} ${intent.fromToken}.`;
      case "price":
        return result
          ? `📊 Current price of ${intent.token}: ${result[intent.token]}`
          : "🔍 Checking price...";
      case "recover":
        return "🔐 Please contact your guardians to begin recovery.";
      case "general prompts":
        return intent.aiResponse || "👋 Hello! How can I assist you?";
      default:
        return "🤖 Sorry, I didn't get that. Try commands like 'send', 'swap', or 'balance'.";
    }
  }
}
