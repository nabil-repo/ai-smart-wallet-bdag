"use client"

import { useEffect, useState } from "react"
import { ChatInterface } from "../components/chat-interface"
import { WalletDashboard } from "../components/wallet-dashboard"
import { SettingsDashboard } from "../components/settings-interface"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { WalletService } from "../lib/wallet"
import { MessageSquare, Wallet, Settings } from "lucide-react"
import '../styles/globals.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'


import {
  useAccount,
  useConnect,
  useDisconnect,
  useWalletClient
} from "wagmi"
import { ethers } from 'ethers'

export default function Home() {
  const { address, isConnected } = useAccount()
  const [walletService, setWalletService] = useState<WalletService | null>(null)
  const { data: walletClient } = useWalletClient()



  useEffect(() => {
    const setupWalletService = async () => {
      if (!walletClient || !address || !isConnected) {
        console.log("Waiting for walletClient, address or connection...")
        return
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()

        const service = new WalletService(signer)
        await service.connect()
        console.log("✅ WalletService connected", service)
        setWalletService(service)

      } catch (err) {
        console.error("Failed to initialize wallet service:", err)
      }
    }

    setupWalletService()
  }, [walletClient, address, isConnected])




  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900  text-white font-sans">
      <header className="border-b border-white/10 backdrop-blur-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-700 text-white font-bold text-xl rounded-xl flex items-center justify-center shadow-md">
                AI
              </div>
              <h1 className="text-2xl font-bold tracking-wide">DAGSense</h1>
            </div>


            {isConnected && address ? (
              <div className="flex items-center gap-3 text-sm bg-white/10 px-3 py-1 rounded-xl">
                <ConnectButton />
                {/* <span className="text-white/80">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span> */}
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent animate-pulse">
              AI-Powered Smart Contract Wallet
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Control your wallet using voice or chat. Send tokens, check balances, and many more using AI.
            </p>
          </div>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid grid-cols-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-md">
              <TabsTrigger value="chat" className="flex items-center justify-center gap-2 py-3 text-sm text-white hover:bg-white/10 transition-all">
                <MessageSquare className="h-5 w-5" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center justify-center gap-2 py-3 text-sm text-white hover:bg-white/10 transition-all">
                <Wallet className="h-5 w-5" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center justify-center gap-2 py-3 text-sm text-white hover:bg-white/10 transition-all">
                <Settings className="h-5 w-5" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-6">
              {walletService && isConnected ? (
                <ChatInterface walletService={walletService} />
              ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
                  <MessageSquare className="h-10 w-10 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
                  <p className="text-white/50 mb-6">
                    Start chatting with your AI assistant by connecting your wallet.
                  </p>
                  {/* <ConnectButton /> */}
                </div>
              )}
            </TabsContent>

            <TabsContent value="dashboard" className="mt-6">
              {walletService ? (
                <WalletDashboard
                  walletService={walletService}
                  isConnected={isConnected}
                  onConnect={() => { }}
                />
              ) : (
                <div className="text-center text-white/60">Loading Wallet...</div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              {walletService ? (
                <SettingsDashboard
                  walletService={walletService}
                  isConnected={isConnected}
                  onConnect={() => { }}
                />
              ) : (
                <div className="text-center text-white/60">Loading...</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
