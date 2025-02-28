'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { PaymentStatus } from '@/components/wallet/payment-status'

export default function WalletTestPage() {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('1000')
  const [reference, setReference] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'processing' | 'success' | 'error' | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const { toast } = useToast()

  const handleInitiateDeposit = async () => {
    if (!email || !amount) {
      toast({
        title: "Missing Information",
        description: "Please provide both email and amount",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Convert amount to kobo for Paystack
      const amountInKobo = parseInt(amount) * 100

      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInKobo,
          email
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize deposit')
      }

      setReference(data.reference)
      toast({
        title: "Deposit Initialized",
        description: `Reference: ${data.reference}`,
      })

      // In a real scenario, we would redirect to the payment page
      // window.location.href = data.authorization_url
      
      // For testing, we'll just show the authorization URL
      setStatusMessage(`Payment URL: ${data.authorization_url}`)
    } catch (error) {
      console.error('Error initiating deposit:', error)
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Failed to process deposit",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!reference) {
      toast({
        title: "Missing Reference",
        description: "Please provide a payment reference",
        variant: "destructive"
      })
      return
    }

    try {
      setVerificationStatus('processing')
      setStatusMessage('Verifying payment...')
      
      const response = await fetch(`/api/wallet/topup?reference=${reference}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed')
      }

      setVerificationStatus('success')
      setStatusMessage(data.message || 'Payment verified successfully')
      
      toast({
        title: "Verification Successful",
        description: data.message || "Payment has been verified",
      })
    } catch (error) {
      console.error('Error verifying payment:', error)
      setVerificationStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Payment verification failed')
      
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify payment",
        variant: "destructive",
      })
    }
  }

  const resetTest = () => {
    setReference('')
    setVerificationStatus(null)
    setStatusMessage('')
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Wallet Test Page</h1>
      
      {verificationStatus ? (
        <div className="space-y-4">
          <PaymentStatus status={verificationStatus} message={statusMessage} />
          <Button onClick={resetTest} className="mt-4">
            Reset Test
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Initiate Deposit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="500"
                  max="500000"
                />
                <p className="text-xs text-muted-foreground">
                  Min: ₦500 | Max: ₦500,000
                </p>
              </div>
              
              <Button 
                onClick={handleInitiateDeposit}
                disabled={isLoading || !email || !amount}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Initiate Deposit"
                )}
              </Button>
              
              {statusMessage && (
                <div className="mt-4 p-4 bg-muted rounded-md text-sm">
                  <p className="font-mono break-all">{statusMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Verify Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Payment Reference</Label>
                <Input
                  id="reference"
                  placeholder="Enter payment reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleVerifyPayment}
                disabled={isLoading || !reference}
                className="w-full"
              >
                Verify Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}