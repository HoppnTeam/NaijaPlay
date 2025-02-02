import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Users, Star, TrendingUp, Shield, Goal } from 'lucide-react'

// Mock data for development
const leagueStats = [
  {
    id: '1',
    name: 'Premier Division',
    total_teams: 10,
    matches_played: 45,
    total_goals: 132,
    avg_goals_per_match: 2.93,
    clean_sheets: 15,
    top_scorer: 'Michael Brown',
    top_scorer_goals: 12
  },
  {
    id: '2',
    name: 'Championship',
    total_teams: 8,
    matches_played: 28,
    total_goals: 84,
    avg_goals_per_match: 3.0,
    clean_sheets: 8,
    top_scorer: 'Sarah Johnson',
    top_scorer_goals: 9
  }
]

const teamStats = [
  {
    id: '1',
    name: 'Golden Eagles FC',
    matches_played: 10,
    wins: 7,
    draws: 2,
    losses: 1,
    goals_for: 25,
    goals_against: 10,
    clean_sheets: 5,
    points: 23,
    form: ['W', 'W', 'D', 'W', 'W'],
    top_scorer: 'John Smith',
    top_scorer_goals: 8
  },
  {
    id: '2',
    name: 'Red Dragons United',
    matches_played: 10,
    wins: 6,
    draws: 3,
    losses: 1,
    goals_for: 20,
    goals_against: 8,
    clean_sheets: 6,
    points: 21,
    form: ['W', 'D', 'W', 'D', 'W'],
    top_scorer: 'Sarah Johnson',
    top_scorer_goals: 7
  },
  {
    id: '3',
    name: 'Phoenix Rising',
    matches_played: 10,
    wins: 6,
    draws: 2,
    losses: 2,
    goals_for: 22,
    goals_against: 12,
    clean_sheets: 4,
    points: 20,
    form: ['L', 'W', 'W', 'D', 'W'],
    top_scorer: 'Michael Brown',
    top_scorer_goals: 9
  }
]

const playerStats = [
  {
    id: '1',
    name: 'Michael Brown',
    team: 'Phoenix Rising',
    position: 'Forward',
    matches_played: 10,
    goals: 12,
    assists: 5,
    clean_sheets: 0,
    yellow_cards: 2,
    red_cards: 0,
    minutes_played: 870,
    form_rating: 8.5
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    team: 'Red Dragons United',
    position: 'Midfielder',
    matches_played: 9,
    goals: 7,
    assists: 8,
    clean_sheets: 0,
    yellow_cards: 1,
    red_cards: 0,
    minutes_played: 810,
    form_rating: 8.2
  },
  {
    id: '3',
    name: 'David Lee',
    team: 'Golden Eagles FC',
    position: 'Defender',
    matches_played: 10,
    goals: 2,
    assists: 1,
    clean_sheets: 5,
    yellow_cards: 3,
    red_cards: 0,
    minutes_played: 900,
    form_rating: 7.8
  }
]

function LeagueStatistics() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {leagueStats.map((league) => (
        <Card key={league.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {league.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Teams</p>
                  <p className="text-2xl font-bold">{league.total_teams}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matches</p>
                  <p className="text-2xl font-bold">{league.matches_played}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Goals</p>
                  <p className="text-2xl font-bold">{league.total_goals}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clean Sheets</p>
                  <p className="text-2xl font-bold">{league.clean_sheets}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Top Scorer</p>
                <p className="font-medium">{league.top_scorer}</p>
                <p className="text-sm text-muted-foreground">{league.top_scorer_goals} goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TeamStatistics() {
  return (
    <div className="space-y-6">
      {teamStats.map((team) => (
        <Card key={team.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {team.name}
              </div>
              <div className="flex items-center gap-1 text-sm">
                {team.form.map((result, index) => (
                  <span
                    key={index}
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-white
                      ${result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-yellow-500' : 'bg-red-500'}`}
                  >
                    {result}
                  </span>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Played</p>
                  <p className="text-xl font-bold">{team.matches_played}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Won</p>
                  <p className="text-xl font-bold">{team.wins}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Drawn</p>
                  <p className="text-xl font-bold">{team.draws}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lost</p>
                  <p className="text-xl font-bold">{team.losses}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Goals For</p>
                  <p className="text-xl font-bold">{team.goals_for}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Goals Against</p>
                  <p className="text-xl font-bold">{team.goals_against}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clean Sheets</p>
                  <p className="text-xl font-bold">{team.clean_sheets}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Top Scorer</p>
                <p className="font-medium">{team.top_scorer}</p>
                <p className="text-sm text-muted-foreground">{team.top_scorer_goals} goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PlayerStatistics() {
  return (
    <div className="space-y-6">
      {playerStats.map((player) => (
        <Card key={player.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <div>
                  <p>{player.name}</p>
                  <p className="text-sm text-muted-foreground">{player.team}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-bold">{player.form_rating}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Matches</p>
                  <p className="text-xl font-bold">{player.matches_played}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Goals</p>
                  <p className="text-xl font-bold">{player.goals}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assists</p>
                  <p className="text-xl font-bold">{player.assists}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                  <p className="text-xl font-bold">{player.minutes_played}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Clean Sheets</p>
                  <p className="text-xl font-bold">{player.clean_sheets}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yellow Cards</p>
                  <p className="text-xl font-bold">{player.yellow_cards}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Red Cards</p>
                  <p className="text-xl font-bold">{player.red_cards}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function StatisticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Statistics</h1>
      </div>

      <Tabs defaultValue="leagues" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leagues" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leagues
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Players
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leagues" className="space-y-4">
          <LeagueStatistics />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamStatistics />
        </TabsContent>

        <TabsContent value="players" className="space-y-4">
          <PlayerStatistics />
        </TabsContent>
      </Tabs>
    </div>
  )
} 