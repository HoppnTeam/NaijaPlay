'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TeamBet {
  id: string
  type: 'team'
  amount: number
  potentialWin: number
  createdAt: string
  gameweek: number
  details: {
    team1: {
      id: string
      name: string
      points: number | null
    }
    team2: {
      id: string
      name: string
      points: number | null
    }
    selectedTeam: {
      id: string
      name: string
    }
  }
}

interface PlayerBet {
  id: string
  type: 'player'
  amount: number
  potentialWin: number
  createdAt: string
  gameweek: number
  details: {
    player: {
      id: string
      name: string
      team: string
      position: string
    }
    metric: string
    prediction: number
    actualValue: number | null
  }
}

type Bet = TeamBet | PlayerBet

export function ActiveBets() {
  const [bets, setBets] = useState<{ teamBets: TeamBet[], playerBets: PlayerBet[] }>({ teamBets: [], playerBets: [] })
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const response = await fetch('/api/betting/active-bets')
        if (!response.ok) throw new Error('Failed to fetch bets')
        const data = await response.json()
        setBets(data)
      } catch (error) {
        console.error('Error fetching bets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBets()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (bets.teamBets.length === 0 && bets.playerBets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            You have no active bets. Place a bet to see it here!
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderTeamBet = (bet: TeamBet) => (
    <Card key={bet.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge variant="secondary" className="mb-2">Team vs Team</Badge>
            <h4 className="font-semibold">
              {bet.details.team1.name} vs {bet.details.team2.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              Your pick: {bet.details.selectedTeam.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Stake: {formatCurrency(bet.amount)}</div>
            <div className="text-sm text-muted-foreground">
              Potential Win: {formatCurrency(bet.potentialWin)}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Gameweek {bet.gameweek}</span>
          <span className="text-muted-foreground">{formatDate(bet.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )

  const renderPlayerBet = (bet: PlayerBet) => (
    <Card key={bet.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge variant="secondary" className="mb-2">Player Performance</Badge>
            <h4 className="font-semibold">
              {bet.details.player.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {bet.details.player.team} - {bet.details.player.position}
            </p>
            <p className="text-sm mt-1">
              Prediction: {bet.details.prediction} {bet.details.metric}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Stake: {formatCurrency(bet.amount)}</div>
            <div className="text-sm text-muted-foreground">
              Potential Win: {formatCurrency(bet.potentialWin)}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Gameweek {bet.gameweek}</span>
          <span className="text-muted-foreground">{formatDate(bet.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div>
      {bets.teamBets.map(renderTeamBet)}
      {bets.playerBets.map(renderPlayerBet)}
    </div>
  )
} 