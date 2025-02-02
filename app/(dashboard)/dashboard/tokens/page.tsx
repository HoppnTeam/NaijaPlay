import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins } from "lucide-react"
import { PurchaseTokens } from '@/components/tokens/purchase-tokens'
import { TokenHistory } from '@/components/tokens/token-history'
import { redirect } from 'next/navigation'

export default async function TokensPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get authenticated user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch user's token balance
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('tokens')
    .eq('id', session.user.id)
    .single()

  // If there's an error fetching the profile, initialize with 0 tokens
  const tokenBalance = error ? 0 : (profile?.tokens ?? 0)

  const tokenPackages = [
    { amount: 100, price: 1000, bonus: 0 },
    { amount: 500, price: 4500, bonus: 50 },
    { amount: 1000, price: 8500, bonus: 150 },
    { amount: 2000, price: 16000, bonus: 400 },
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
            <span className="text-4xl font-bold">{tokenBalance.toLocaleString()}</span>
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