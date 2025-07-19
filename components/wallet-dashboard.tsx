"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Modal } from "../components/ui/Modal"
import { Wallet, Shield, Users, Copy, ExternalLink } from "lucide-react"
import type { WalletService } from "../lib/wallet"
import { ethers } from "ethers"
import type { WalletBalance } from "../lib/types"

interface WalletDashboardProps {
  walletService: WalletService
  isConnected: boolean
  onConnect: () => void
}

export function WalletDashboard({ walletService, isConnected, onConnect }: WalletDashboardProps) {
  const [balances, setBalances] = useState<WalletBalance[]>([])
  const [guardians, setGuardians] = useState<string[]>([])
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newGuardian, setNewGuardian] = useState("")
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [modalTitle, setModalTitle] = useState<string>("")
  const [showRecoveryInput, setShowRecoveryInput] = useState(false)
  const [newRecoveryOwner, setNewRecoveryOwner] = useState("")





  useEffect(() => {
    if (isConnected) {
      loadWalletData()
    }
  }, [isConnected])

  const loadWalletData = async () => {
    setIsLoading(true)
    try {
      // Get balances
      const balanceData = await walletService.getAllBalances()
      setBalances(balanceData.map((b) => ({ ...b, symbol: b.token, usdValue: "0" })))

      // Get guardians
      const guardianList = await walletService.getGuardians()
      console.log("gurds:" + guardianList)
      setGuardians(guardianList)

      // Get wallet address
      const address = walletService.getSmartWalletAddress()
      setWalletAddress(await address)
    } catch (error) {
      console.error("Failed to load wallet data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
  }

  const openInExplorer = () => {
    window.open(`https://primordial.bdagscan.com/address/${walletAddress}`, "_blank")
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Connect your wallet to start using the AI-powered smart contract wallet
          </p>
          <Button onClick={onConnect}>Connect Wallet</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Smart Wallet Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">{walletAddress || "Loading..."}</code>
            <Button variant="outline" size="icon" onClick={copyAddress}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={openInExplorer}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading balances...</div>
          ) : balances.length > 0 ? (
            <div className="space-y-3">
              {balances.map((balance) => (
                <div key={balance.token} className="flex items-center justify-between p-3 bg-muted rounded-lg">

                  <div className="text-right">
                    <p className="font-semibold">{Number.parseFloat(balance.balance).toFixed(4)} BDAG</p>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No tokens found. Send some tokens to your wallet to get started.
            </div>
          )}
        </CardContent>
      </Card>

    
    </div>
  )
}
