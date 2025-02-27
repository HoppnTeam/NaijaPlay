'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Coins, RefreshCw } from 'lucide-react'
import { BudgetTopup } from './budget-topup'
import { useTokens } from '@/hooks/use-tokens'

interface TokenManagementProps {
  team: {
    id: string
    team_name: string
    budget: number
    tokens: number
  }
}

export function TokenManagement({ team }: TokenManagementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userTokens, setUserTokens] = useState(0)
  const supabase = createClientComponentClient()
  const { tokens, mutate } = useTokens()

  useEffect(() => {
    setUserTokens(tokens)
  }, [tokens])

  const handleTopupSuccess = () => {
    // Refresh token data
    mutate()
    
    // Refresh team data (this would typically be handled by the parent component)
    toast({
      title: "Budget updated",
      description: "Your team budget has been updated successfully",
      variant: "default"
    })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#008753] to-[#00A86B] text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Token Balance</CardTitle>
          <CardDescription className="text-white/80">Your available tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Coins className="h-8 w-8" />
            <span className="text-4xl font-bold">{userTokens?.toLocaleString() || '0'}</span>
          </div>
        </CardContent>
      </Card>

      <BudgetTopup 
        team={{
          id: team.id,
          name: team.team_name,
          budget: team.budget
        }}
        userTokens={userTokens}
        onSuccess={handleTopupSuccess}
      />

      <Card>
        <CardHeader>
          <CardTitle>Token History</CardTitle>
          <CardDescription>Recent token transactions for this team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Actions</CardTitle>
          <CardDescription>Ways to earn and spend tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Earn Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Daily login rewards (5 tokens per day)</li>
                  <li>Complete weekly challenges (10-50 tokens)</li>
                  <li>Win matches in leagues</li>
                  <li>Purchase tokens with real money</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spend Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Top up team budget (1 token = ₦1,000,000)</li>
                  <li>Enter premium leagues</li>
                  <li>Buy special player cards</li>
                  <li>Unlock team customizations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 