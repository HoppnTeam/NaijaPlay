'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { WalletCard } from "@/components/wallet/wallet-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActiveBets } from "@/components/betting/active-bets"
import { TeamBetting } from "@/components/betting/team-betting"
import { PlayerBetting } from "@/components/betting/player-betting"
import { BettingInstructions } from "@/components/betting/betting-instructions"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

// Define a simple WalletButton component directly in this file
// to avoid circular dependencies
function WalletButton({ variant = "default" }) {
  const [balance, setBalance] = useState(0)
  const supabase = createClientComponentClient()

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setBalance(data?.balance || 0)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={variant} className="flex gap-2">
          <Wallet className="h-4 w-4" />
          {formatNaira(balance)}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="mt-6">
          <WalletCard />
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface Team {
  id: string
  name: string
  points: number
}

interface Player {
  id: string
  name: string
  team: string
  position: string
  goals: number
  assists: number
  clean_sheets: number
}

export default function BettingPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [gameweeks, setGameweeks] = useState<number[]>([])
  const [userBalance, setUserBalance] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teams data
        const { data: teamsData } = await supabase
          .from('teams')
          .select('id, name, points')
          .order('points', { ascending: false })
        setTeams(teamsData || [])

        // Fetch players data
        const { data: playersData } = await supabase
          .from('players')
          .select('id, name, team, position, goals, assists, clean_sheets')
          .order('name')
        setPlayers(playersData || [])

        // Set gameweeks (1-38 for Premier League)
        setGameweeks(Array.from({ length: 38 }, (_, i) => i + 1))

        // Fetch user balance
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: balanceData } = await supabase
            .from('user_balances')
            .select('balance')
            .eq('user_id', user.id)
            .single()
          setUserBalance(balanceData?.balance || 0)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Betting</h1>
        <WalletButton variant="outline" />
      </div>

      <WalletCard variant="compact" />

      <BettingInstructions />

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Bets</TabsTrigger>
          <TabsTrigger value="available">Available Bets</TabsTrigger>
          <TabsTrigger value="history">Betting History</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveBets />
        </TabsContent>

        <TabsContent value="available">
          <div className="grid gap-6 md:grid-cols-2">
            <TeamBetting 
              teams={teams}
              gameweeks={gameweeks}
              userBalance={userBalance}
            />
            <PlayerBetting 
              players={players}
              gameweeks={gameweeks}
              userBalance={userBalance}
            />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Betting History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your betting history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 