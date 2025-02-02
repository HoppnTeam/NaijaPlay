import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trophy, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface Gameweek {
  id: string
  number: number
  start_date: string
  end_date: string
  status: 'upcoming' | 'in_progress' | 'completed'
}

interface TeamGameweekStat {
  id: string
  team_id: string
  gameweek_id: string
  total_points: number
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  clean_sheets: number
  teams: {
    name: string
    profiles: {
      full_name: string | null
    }[]
  } | null
}

// Mock data for development
const mockGameweek: Gameweek = {
  id: '1',
  number: 1,
  start_date: new Date('2024-03-25').toISOString(),
  end_date: new Date('2024-03-31').toISOString(),
  status: 'in_progress'
}

const mockTeamStats: TeamGameweekStat[] = [
  {
    id: '1',
    team_id: '1',
    gameweek_id: '1',
    total_points: 87,
    matches_played: 1,
    wins: 1,
    draws: 0,
    losses: 0,
    goals_for: 3,
    goals_against: 1,
    clean_sheets: 0,
    teams: {
      name: 'Golden Eagles FC',
      profiles: [{ full_name: 'John Smith' }]
    }
  },
  {
    id: '2',
    team_id: '2',
    gameweek_id: '1',
    total_points: 76,
    matches_played: 1,
    wins: 1,
    draws: 0,
    losses: 0,
    goals_for: 2,
    goals_against: 0,
    clean_sheets: 1,
    teams: {
      name: 'Red Dragons United',
      profiles: [{ full_name: 'Sarah Johnson' }]
    }
  },
  {
    id: '3',
    team_id: '3',
    gameweek_id: '1',
    total_points: 72,
    matches_played: 1,
    wins: 0,
    draws: 1,
    losses: 0,
    goals_for: 2,
    goals_against: 2,
    clean_sheets: 0,
    teams: {
      name: 'Phoenix Rising',
      profiles: [{ full_name: 'Michael Brown' }]
    }
  },
  {
    id: '4',
    team_id: '4',
    gameweek_id: '1',
    total_points: 65,
    matches_played: 1,
    wins: 0,
    draws: 1,
    losses: 0,
    goals_for: 1,
    goals_against: 1,
    clean_sheets: 0,
    teams: {
      name: 'Blue Sharks FC',
      profiles: [{ full_name: 'Emma Wilson' }]
    }
  },
  {
    id: '5',
    team_id: '5',
    gameweek_id: '1',
    total_points: 58,
    matches_played: 1,
    wins: 0,
    draws: 0,
    losses: 1,
    goals_for: 1,
    goals_against: 3,
    clean_sheets: 0,
    teams: {
      name: 'Silver Knights',
      profiles: [{ full_name: 'David Lee' }]
    }
  }
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'upcoming':
      return <Badge variant="secondary">Upcoming</Badge>
    case 'in_progress':
      return <Badge variant="success">In Progress</Badge>
    case 'completed':
      return <Badge>Completed</Badge>
    default:
      return null
  }
}

function GameweekStatus({ gameweek, error }: { gameweek: Gameweek | null, error: any }) {
  // Use mock data if no real data is available
  const displayGameweek = gameweek || mockGameweek

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Current Gameweek
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">Gameweek {displayGameweek.number}</span>
            {getStatusBadge(displayGameweek.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(displayGameweek.start_date)} - {formatDate(displayGameweek.end_date)}
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Matches in Progress: 3</p>
            <p>Matches Completed: 2</p>
            <p>Upcoming Matches: 5</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamStats({ stats, error }: { stats: TeamGameweekStat[] | null, error: any }) {
  // Use mock data if no real data is available
  const displayStats = stats || mockTeamStats

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayStats.map((stat, index) => (
            <div
              key={stat.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-muted-foreground">
                  #{index + 1}
                </span>
                <div>
                  <p className="font-medium">{stat.teams?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.teams?.profiles?.[0]?.full_name || 'Unknown Manager'}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>W: {stat.wins}</span>
                    <span>D: {stat.draws}</span>
                    <span>L: {stat.losses}</span>
                    <span>GF: {stat.goals_for}</span>
                    <span>GA: {stat.goals_against}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stat.total_points}</p>
                <p className="text-sm text-muted-foreground">points</p>
                {stat.clean_sheets > 0 && (
                  <p className="text-xs text-green-500 mt-1">
                    {stat.clean_sheets} Clean Sheet{stat.clean_sheets > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function GameweekPage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch current gameweek
  const { data: gameweeks, error: gameweekError } = await supabase
    .from('gameweeks')
    .select('*')
    .order('number', { ascending: true })
    .limit(1)

  const currentGameweek = gameweeks?.[0]

  // Fetch top performing teams for current gameweek
  const { data: teamStats, error: teamStatsError } = await supabase
    .from('team_gameweek_stats')
    .select(`
      *,
      teams (
        name,
        profiles (
          full_name
        )
      )
    `)
    .eq('gameweek_id', currentGameweek?.id)
    .order('total_points', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gameweek Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <GameweekStatus gameweek={currentGameweek} error={gameweekError} />
        <TeamStats stats={teamStats} error={teamStatsError} />
      </div>
    </div>
  )
} 