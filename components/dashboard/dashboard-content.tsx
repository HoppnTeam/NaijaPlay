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
  type: 'NPFL' | 'EPL'
  max_teams: number
  entry_fee: number
  total_prize: number
  start_date: string
  end_date: string
  status: 'upcoming' | 'active' | 'completed'
}

interface DashboardContentProps {
  teamData: Team | null
  leagueData: League | null
  allPlayers: TeamPlayer['player'][]
}

function DashboardStats({ teamData }: { teamData: Team | null }) {
  const totalPoints = teamData?.team_players?.reduce(
    (sum: number, tp: TeamPlayer) => sum + calculatePoints(tp.player),
    0
  ) || 0

  const teamValue = teamData?.team_players?.reduce(
    (sum: number, tp: TeamPlayer) => sum + (tp.player.current_price || 0),
    0
  ) || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<div>Loading league table...</div>}>
          {leagueData?.id ? (
            <LeagueTable 
              leagueId={leagueData.id}
              data={[]} // We'll fetch this data in the LeagueTable component
            />
          ) : (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">Join a league to see standings</p>
            </Card>
          )}
        </Suspense>
        <Suspense fallback={<div>Loading fixtures...</div>}>
          <UpcomingFixtures matches={[]} />
        </Suspense>
        <Suspense fallback={<div>Loading performance chart...</div>}>
          <PerformanceChart />
        </Suspense>
      </div>
    </div>
  )
} 