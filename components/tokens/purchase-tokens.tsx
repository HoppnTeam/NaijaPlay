'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Coins } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface TokenPackage {
  amount: number
  price: number
  bonus: number
  label: string
  description: string
}

interface PurchaseTokensProps {
  tokenPackages: TokenPackage[]
}

export function PurchaseTokens({ tokenPackages }: PurchaseTokensProps) {
  const [processingPackage, setProcessingPackage] = useState<number | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  const handlePurchase = async (pkg: TokenPackage) => {
    try {
      setProcessingPackage(pkg.amount)

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to purchase tokens",
          variant: "destructive"
        })
        return
      }

      // Convert amount to kobo (Paystack requires amount in kobo)
      const amountInKobo = pkg.price * 100

      // Initialize payment with Paystack
      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInKobo, // Send amount in kobo
          tokens: pkg.amount,
          package_name: pkg.label,
          email: user.email // Required by Paystack
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      if (!data.authorization_url) {
        throw new Error('No payment URL received')
      }

      // Log the response for debugging
      console.log('Payment initialization response:', data)

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url

    } catch (error) {
      console.error('Error purchasing tokens:', error)
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Failed to process purchase",
        variant: "destructive",
      })
      setProcessingPackage(null) // Reset processing state on error
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {tokenPackages.map((pkg) => (
        <Card 
          key={pkg.amount}
          className="relative overflow-hidden"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              {pkg.label}
            </CardTitle>
            <CardDescription>{pkg.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{formatNaira(pkg.price)}</div>
              <div className="text-sm text-muted-foreground">
                {formatNumber(pkg.amount)} tokens
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => handlePurchase(pkg)}
              disabled={processingPackage === pkg.amount}
            >
              {processingPackage === pkg.amount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Purchase'
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 