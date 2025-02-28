'use client'

import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { LeagueTable } from "@/components/dashboard/league-table"
import UpcomingFixtures from "@/components/dashboard/upcoming-fixtures"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { TopPerformers } from '@/components/top-performers'
import { calculatePoints } from '@/lib/calculatePoints'
import {
  Trophy,
  Users,
  Star,
  TrendingUp,
  Plus,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from 'react'

interface TeamPlayer {
  player: {
    id: string
    name: string
    position: string
    team: string
    current_price: number
    minutes_played: number
    goals_scored: number
    assists: number
    clean_sheets: number
    goals_conceded: number
    own_goals: number
    penalties_saved: number
    penalties_missed: number
    yellow_cards: number
    red_cards: number
    saves: number
    bonus: number
  }
}

interface Team {
  id: string
  name: string
  user_id: string
  team_players: TeamPlayer[]
}

interface League {
  id: string
  name: string
  code: string
  user_id: string
}

interface Player {
  id: string
  name: string
  position: string
  team: string
  current_price: number
}

interface DashboardContentProps {
  teamData: Team | null
  leagueData: League | null
  allPlayers: Player[]
}

function TeamStats({ teamData }: { teamData: Team | null }) {
  if (!teamData) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">Create your team to see stats</p>
        <Button className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>
    )
  }

  // Calculate total points
  const totalPoints = teamData.team_players.reduce((total, tp) => {
    return total + calculatePoints(tp.player)
  }, 0)

  // Calculate team value
  const teamValue = teamData.team_players.reduce((total, tp) => {
    return total + tp.player.current_price
  }, 0)

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
      <StatsCard
        title="Total Points"
        value={totalPoints}
        description="Season 2023/24"
        icon={Star}
      />
      <StatsCard
        title="Players"
        value={teamData?.team_players?.length || 0}
        description="Squad Size"
        icon={Users}
      />
      <StatsCard
        title="Team Value"
        value={`₦${teamValue.toLocaleString()}`}
        description="↑ ₦0.5M from last week"
        icon={TrendingUp}
      />
      <StatsCard
        title="Weekly Rank"
        value="125,430"
        description="Top 15%"
        icon={Trophy}
      />
    </div>
  )
}

export function DashboardContent({ leagueData, allPlayers }: Omit<DashboardContentProps, 'teamData'>) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold">Dashboard</h2>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading league table...</div>}>
          {leagueData?.id ? (
            <LeagueTable 
              leagueId={leagueData.id}
              data={[]} // We'll fetch this data in the LeagueTable component
            />
          ) : (
            <Card className="p-4 sm:p-6 h-full flex items-center justify-center">
              <p className="text-muted-foreground text-center">Join a league to see standings</p>
            </Card>
          )}
        </Suspense>
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading fixtures...</div>}>
          <UpcomingFixtures matches={[]} />
        </Suspense>
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading performance chart...</div>}>
          <PerformanceChart />
        </Suspense>
      </div>
    </div>
  )
} 