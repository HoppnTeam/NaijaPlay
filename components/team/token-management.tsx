'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Coins } from 'lucide-react'

interface TokenManagementProps {
  team: {
    id: string
    team_name: string
    tokens: number
  }
}

export function TokenManagement({ team }: TokenManagementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#008753] to-[#00A86B] text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Token Balance</CardTitle>
          <CardDescription className="text-white/80">Your team's token balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Coins className="h-8 w-8" />
            <span className="text-4xl font-bold">{team.tokens?.toLocaleString() || '0'}</span>
          </div>
        </CardContent>
      </Card>

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
                  <li>Win matches in leagues</li>
                  <li>Complete daily challenges</li>
                  <li>Achieve team milestones</li>
                  <li>Participate in tournaments</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spend Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Enter premium leagues</li>
                  <li>Buy special player cards</li>
                  <li>Unlock team customizations</li>
                  <li>Purchase power-ups</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 