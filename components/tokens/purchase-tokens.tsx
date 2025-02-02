'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface TokenPackage {
  amount: number
  price: number
  bonus: number
}

interface PurchaseTokensProps {
  tokenPackages: TokenPackage[]
}

export function PurchaseTokens({ tokenPackages }: PurchaseTokensProps) {
  const [isLoading, setIsLoading] = useState<number | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handlePurchase = async (pkg: TokenPackage) => {
    try {
      setIsLoading(pkg.amount)

      // Here you would integrate with your payment provider
      // For now, we'll just simulate a successful purchase
      await new Promise(resolve => setTimeout(resolve, 2000))

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      // Start a transaction
      const { data: profile } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('id', user.id)
        .single()

      const currentBalance = profile?.tokens || 0
      const newBalance = currentBalance + pkg.amount + pkg.bonus

      // Update user's token balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tokens: newBalance })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: pkg.amount + pkg.bonus,
          type: 'purchase',
          description: `Purchased ${pkg.amount} tokens + ${pkg.bonus} bonus tokens`
        })

      if (transactionError) throw transactionError

      toast({
        title: "Purchase successful!",
        description: `${pkg.amount + pkg.bonus} tokens have been added to your account.`,
      })

      // Refresh the page to show updated balance
      window.location.reload()
    } catch (error) {
      console.error('Error purchasing tokens:', error)
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {tokenPackages.map((pkg) => (
        <Button
          key={pkg.amount}
          onClick={() => handlePurchase(pkg)}
          disabled={isLoading !== null}
          className="h-auto py-6 flex flex-col gap-2"
        >
          {isLoading === pkg.amount ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="text-lg font-bold">{pkg.amount} Tokens</span>
              {pkg.bonus > 0 && (
                <span className="text-sm text-muted">+{pkg.bonus} Bonus</span>
              )}
              <span className="text-lg font-bold">₦{pkg.price.toLocaleString()}</span>
            </>
          )}
        </Button>
      ))}
    </div>
  )
} 