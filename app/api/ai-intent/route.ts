// app/api/ai-intent/route.ts
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY!,
  defaultHeaders: {
    "X-Title": "SmartWallet AI",
  },
})


const SYSTEM_PROMPT = `
You are an AI assistant for a smart contract wallet. Your job is to parse user commands and extract their intent for blockchain operations.
Also you are a Crypto and DApps expert.
Supported actions:
- send: Transfer tokens to another address
- swap: Exchange one token for another
- balance: Check token balances
- recover: Initiate wallet recovery
- price: current price of the token , CoinGecko needs full lowercase token IDs so put in the token attribute in respone

Respond ONLY with a raw JSON object. Do NOT include any explanations or markdown like \`\`\`.

If the message is not an actionable command (e.g. small talk, greetings, or questions), then return:
{
  "action": "general prompts",
  "confidence": 1.0,
  "aiResponse": "<Respond helpfully or politely,about all crypto and DApps and other related questions>"
}

Example:
Input: "Send 0.5 ETH to vitalik.eth"
Output:
{
  "action": "send",
  "token": "ETH",
  "amount": "0.5",
  "to": "vitalik.eth",
  "confidence": 0.95
}

IMPORTANT:
- Always return a valid JSON object.
- NEVER wrap response in markdown (e.g., no \`\`\`json).
- NEVER explain anything outside the JSON response.


Now parse this user message:
"{{USER_MESSAGE}}"
`;

export async function POST(req: Request) {
  try {
    const { userMessage } = await req.json()
   
    console.log(userMessage)

    // const completion = await openai.chat.completions.create({
    //   model: "deepseek/deepseek-r1-distill-llama-70b:free",
    //   messages: [
    //     { role: "system", content: SYSTEM_PROMPT },
    //     { role: "user", content: `Parse this user command: "${userMessage}"` },
    //   ],
    // })
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Parse this user command: "${userMessage}"` },
      ],
    })

    const message = completion.choices[0].message?.content || "{}"
    console.log(message)
    const parsed = JSON.parse(message)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error("AI intent parsing failed:", error)
    return NextResponse.json({ error: "Failed to parse intent" }, { status: 500 })
  }
}
