"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Send, Loader2 } from "lucide-react"
import { AIAgent } from "../lib/ai-agent"
import type { WalletService } from "../lib/wallet"
import type { AIIntent } from "../lib/types"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ScrollArea } from "../components/ui/scroll-area"

declare global {
  interface Window {
    SpeechRecognition: any
  }
}

type SpeechRecognition = typeof window.SpeechRecognition


interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  intent?: AIIntent
}

interface ChatInterfaceProps {
  walletService: WalletService
}

export function ChatInterface({ walletService }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm your AI wallet assistant.\nYou can ask me to check balances, send tokens, or more.\nTry asking: 'What's my balance?' or 'Send 0.1 BDAG to 0x...'.",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const aiAgent = useRef(new AIAgent())

  // Auto-scroll on new message
  useEffect(() => {
    const el = scrollAreaRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.lang = "en-US"
        recognition.interimResults = false
        recognition.continuous = false

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }

        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)

        recognitionRef.current = recognition
      }
    }
  }, [])

  const addMessage = (msg: Omit<Message, "id" | "timestamp">) => {
    const newMsg: Message = {
      ...msg,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMsg])
  }

  const handleVoiceInput = () => {
    const recognition = recognitionRef.current
    if (!recognition) return alert("Your browser does not support speech recognition")

    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
    setIsListening(!isListening)
  }

  const executeIntent = async (intent: AIIntent) => {
    console.log(intent)
    switch (intent.action) {
      case "send":
        if (!intent.token || !intent.amount || !intent.to) {
          throw new Error("Missing required parameters for send")
        }
        return await walletService.sendToken(intent.token, intent.to, intent.amount)

      case "balance":
        return intent.token
          ? { [intent.token]: await walletService.getBalance(intent.token) }
          : await walletService.getAllBalances()

      case "price":
        if (!intent.token) throw new Error("No token specified")
        const price = await getTokenPrice(intent.token)
        return { [intent.token]: price ? `$${price}` : "Price not found" }

      case "swap":
        throw new Error("Swap is not implemented")

      case "recover":
        throw new Error("Recovery requires guardian setup")

      default:
        throw new Error("Unknown action")
    }
  }

  async function getTokenPrice(tokenSymbol: string): Promise<number | null> {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol.toLowerCase()}&vs_currencies=usd`
    )
    const data = await res.json()
    return data[tokenSymbol.toLowerCase()]?.usd ?? null
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userText = input.trim()
    setInput("")
    setIsLoading(true)

    addMessage({ type: "user", content: userText })

    const thinkingMsg: Message = {
      id: "thinking",
      type: "assistant",
      content: "", // will be rendered as dots
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, thinkingMsg])

    try {
      const intent = await aiAgent.current.parseIntent(userText)

      if (intent.confidence < 0.7) {
        replaceThinkingMessage({
          content:
            "I didn't fully understand that. Try:\n- 'What's my balance?'\n- 'Send 0.1 BDAG to Bob'\n- 'Swap BDAG to ETH'",
          intent,
        })
      } else {
        let result
        let success = true
        try {
          result = await executeIntent(intent)
        } catch (err) {
          success = false
          result = err
        }

        const reply = await aiAgent.current.generateResponse(intent, success ? result : null)

        replaceThinkingMessage({ content: reply, intent })
      }
    } catch (err) {
      console.error(err)
      replaceThinkingMessage({
        content: "Something went wrong. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const replaceThinkingMessage = (newMsg: Omit<Message, "id" | "timestamp" | "type"> & Partial<Pick<Message, "intent">>) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === "thinking"
          ? {
            ...m,
            id: Date.now().toString(),
            content: newMsg.content,
            intent: newMsg.intent,
            timestamp: new Date(),
          }
          : m
      )
    )
  }



  return (
    <Card className="flex flex-col h-[600px] bg-background text-foreground border border-white/10 shadow-lg ">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          🤖 AI Wallet Assistant
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4 relative overflow-hidden">
        <ScrollArea className="flex-1 overflow-y-auto pr-4 pb-2">
          <div className="space-y-4 pb-5 font-medium" ref={scrollAreaRef}>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg max-w-[80%] px-4 py-2 text-sm whitespace-pre-wrap ${m.type === "user"
                    ? "bg-pink-500 text-white"
                    : " bg-purple-600 text-muted-foreground"
                    }`}
                >
                  <p>
                    {m.id === "thinking" ? (
                      <span className="typing-dots animate-bounce">.</span> // animated span below
                    ) : (
                      m.content
                    )}
                  </p>
                  {m.intent && (
                    <div className="text-xs opacity-60 mt-1">
                      Action: {m.intent.action} | Confidence: {(m.intent.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2 rounded-2xl absolute bottom-0 left-0 right-0 bg-background px-4 py-2 z-10">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask..."
            disabled={isLoading}
            className="flex-1 bg-slate-800 font-bold"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={isListening ? "bg-red-100 text-red-600" : "bg-slate-800  text-white"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

