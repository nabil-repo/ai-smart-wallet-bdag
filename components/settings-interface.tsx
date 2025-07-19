"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Modal } from "./ui/Modal"
import { Wallet, Shield, Users, Copy, ExternalLink } from "lucide-react"
import type { WalletService } from "../lib/wallet"
import { ethers } from "ethers"
import type { WalletBalance } from "../lib/types"

interface WalletDashboardProps {
  walletService: WalletService
  isConnected: boolean
  onConnect: () => void
}

export function SettingsDashboard({ walletService, isConnected, onConnect }: WalletDashboardProps) {
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
      {/* Guardians */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recovery Guardians
            <Badge variant="secondary">{guardians.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {guardians.length > 0 ? (
            <div className="space-y-2">
              {guardians.map((guardian, index) => (
                <div className="flex items-center flex-col">
                  <div key={guardian} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <code className="flex-1 text-sm">{guardian}</code>
                    <Badge variant="outline">Guardian {index + 1}</Badge>

                  </div>

                  <div className="flex items-center">
                    <Button variant="outline" onClick={() => setShowModal(true)}>
                      Add Guardian
                    </Button>
                  </div>
                </div>


              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-semibold mb-2">No Guardians Set</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Add trusted guardians to enable wallet recovery in case you lose access
              </p>
              <Button variant="outline" onClick={() => setShowModal(true)}>
                Add Guardian
              </Button>

            </div>
          )}
        </CardContent>
      </Card>
      {/* Recovery Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Wallet Recovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* <Button
            className="w-full bg-orange-600 text-white"
            onClick={async () => {
              const newOwner = prompt("Enter new owner's wallet address:")
              if (!newOwner || newOwner.length !== 42 || !newOwner.startsWith("0x")) {
                alert("Invalid address.")
                return
              }
              try {
                setIsLoading(true)
                const txHash = await walletService.initiateRecovery(newOwner)
                alert(`Recovery initiated: ${txHash}`)
              } catch (err) {
                console.error(err)
                alert("Failed to initiate recovery.")
              } finally {
                setIsLoading(false)
              }
            }}
          >
            Initiate Recovery
          </Button>

          <Button
            className="w-full bg-blue-600 text-white"
            onClick={async () => {
              try {
                setIsLoading(true)
                const txHash = await walletService.confirmRecovery()
                alert(`Recovery confirmed: ${txHash}`)
              } catch (err) {
                console.error(err)
                alert("Failed to confirm recovery.")
              } finally {
                setIsLoading(false)
              }
            }}
          >
            Confirm Recovery
          </Button>

          <Button
            className="w-full bg-green-600 text-white"
            onClick={async () => {
              try {
                setIsLoading(true)
                const txHash = await walletService.executeRecovery()
                alert(`Recovery executed: ${txHash}`)
              } catch (err) {
                console.error(err)
                alert("Failed to execute recovery.")
              } finally {
                setIsLoading(false)
              }
            }}
          >
            Execute Recovery
          </Button>

          <Button
            className="w-full bg-gray-700 text-white"
            onClick={async () => {
              try {
                setIsLoading(true)
                const txHash = await walletService.cancelRecovery()
                alert(`Recovery cancelled: ${txHash}`)
              } catch (err) {
                console.error(err)
                alert("Failed to cancel recovery.")
              } finally {
                setIsLoading(false)
              }
            }}
          >
            Cancel Recovery
          </Button> */}

          <Button
            className="w-full bg-orange-600 text-white"
            onClick={() => setShowRecoveryInput(true)}
          >
            Initiate Recovery
          </Button>

          <Button
            className="w-full bg-blue-600 text-white"
            onClick={async () => {
              try {
                setIsLoading(true)
                const txHash = await walletService.confirmRecovery()
                setModalTitle("Recovery Confirmed")
                setModalMessage(`Transaction Hash: ${txHash}`)
              } catch (err) {
                console.error(err)
                setModalTitle("Error")
                setModalMessage("Failed to confirm recovery.")
              } finally {
                setIsLoading(false)
              }
            }}
          >
            Confirm Recovery
          </Button>

          <Button
            className="w-full bg-green-600 text-white"
            onClick={async () => {
              try {
                setIsLoading(true)
                const txHash = await walletService.executeRecovery()
                setModalTitle("Recovery Executed")
                setModalMessage(`Transaction Hash: ${txHash}`)
              } catch (err) {
                console.error(err)
                setModalTitle("Error")
                setModalMessage("Failed to execute recovery.")
              } finally {
                setIsLoading(false)
              }
            }}
          >
            Execute Recovery
          </Button>

          <Button
            className="w-full bg-gray-700 text-white"
            onClick={async () => {
              try {
                setIsLoading(true)
                const txHash = await walletService.cancelRecovery()
                setModalTitle("Recovery Cancelled")
                setModalMessage(`Transaction Hash: ${txHash}`)
              } catch (err) {
                console.error(err)
                setModalTitle("Error")
                setModalMessage("Failed to cancel recovery.")
              } finally {
                setIsLoading(false)
              }
            }}
          >
            Cancel Recovery
          </Button>

        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background dark:bg-zinc-900 p-6 rounded-md shadow-md w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Guardian</h2>

            <input
              type="text"
              placeholder="Enter guardian address"
              value={newGuardian}
              onChange={(e) => setNewGuardian(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-background text-foreground mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md border bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!newGuardian || newGuardian.length !== 42 || !newGuardian.startsWith("0x")) {
                      alert("Please enter a valid address")
                      return
                    }
                    setIsLoading(true)
                    const tx = await walletService.addGuardian(newGuardian)
                    alert("Guardian added successfully! TX: " + tx)
                    const updated = await walletService.getGuardians()
                    setGuardians(updated)
                    setShowModal(false)
                    setNewGuardian("")
                  } catch (err) {
                    console.error(err)
                    alert("Failed to add guardian.")
                  } finally {
                    setIsLoading(false)
                  }
                }}
                className="px-4 py-2 rounded-md bg-purple-600 text-white"
              >
                {isLoading ? "Adding..." : "Add Guardian"}
              </button>
            </div>
          </div>
        </div>
      )}
      {modalMessage && (
        <Modal
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalMessage(null)}
        />
      )}

      {showRecoveryInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background dark:bg-zinc-900 p-6 rounded-md shadow-md w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Initiate Recovery</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter the new owner's wallet address:
            </p>
            <input
              type="text"
              placeholder="0x..."
              value={newRecoveryOwner}
              onChange={(e) => setNewRecoveryOwner(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-background text-foreground mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRecoveryInput(false)}>
                Cancel
              </Button>
              <Button
                className="bg-orange-600 text-white"
                onClick={async () => {
                  if (!newRecoveryOwner || newRecoveryOwner.length !== 42 || !newRecoveryOwner.startsWith("0x")) {
                    setModalTitle("Invalid Address")
                    setModalMessage("Please enter a valid Ethereum address.")
                    return
                  }
                  try {
                    setIsLoading(true)
                    const txHash = await walletService.initiateRecovery(newRecoveryOwner)
                    setModalTitle("Recovery Initiated")
                    setModalMessage(`Transaction Hash: ${txHash}`)
                    setShowRecoveryInput(false)
                    setNewRecoveryOwner("")
                  } catch (err) {
                    console.error(err)
                    setModalTitle("Error")
                    setModalMessage("Failed to initiate recovery.")
                  } finally {
                    setIsLoading(false)
                  }
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}



    </div>
  )
}
