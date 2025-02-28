import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins } from "lucide-react"
import { PurchaseTokens } from '@/components/tokens/purchase-tokens'
import { TokenHistory } from '@/components/tokens/token-history'
import { redirect } from 'next/navigation'

// Helper function to format large numbers with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-NG').format(num)
}

// Helper function to format currency
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function TokensPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's token balance
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('tokens')
    .eq('id', user.id)
    .single()

  // If there's an error fetching the profile, initialize with 0 tokens
  const tokenBalance = error ? 0 : (profile?.tokens ?? 0)

  const tokenPackages = [
    { 
      amount: 100_000_000, 
      price: 3_000, 
      bonus: 0,
      label: '100M Fantasy Money',
      description: 'Basic Package'
    },
    { 
      amount: 250_000_000, 
      price: 5_000, 
      bonus: 0,
      label: '250M Fantasy Money',
      description: 'Standard Package'
    },
    { 
      amount: 500_000_000, 
      price: 8_000, 
      bonus: 0,
      label: '500M Fantasy Money',
      description: 'Premium Package'
    },
    { 
      amount: 1_000_000_000, 
      price: 15_000, 
      bonus: 0,
      label: '1B Fantasy Money',
      description: 'Ultimate Package'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Tokens</h2>
      </div>

      <Card className="bg-gradient-to-br from-[#008753] to-[#00A86B] text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Token Balance</CardTitle>
          <CardDescription className="text-white/80">Your current token balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Coins className="h-8 w-8" />
            <span className="text-4xl font-bold">{formatNumber(tokenBalance)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Tokens</CardTitle>
          <CardDescription>Select a package to purchase tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <PurchaseTokens tokenPackages={tokenPackages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token History</CardTitle>
          <CardDescription>Your recent token transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <TokenHistory />
        </CardContent>
      </Card>
    </div>
  )
} 