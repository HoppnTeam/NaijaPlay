'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Users, Star, TrendingUp, Shield, Goal } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useStatistics, useLeagueStandings } from '@/hooks/use-statistics'

function LeagueStatistics() {
  const { leagueStandings, isLoading } = useStatistics()
  
  if (isLoading) {
    return <LeagueStatisticsSkeleton />
  }
  
  // Get all leagues
  const leagues = Object.values(leagueStandings).map(standing => ({
    id: standing.league.id,
    name: standing.league.name,
    country: standing.league.country,
    logo: standing.league.logo,
    season: standing.league.season,
    total_teams: standing.league.standings[0].length,
    matches_played: standing.league.standings[0][0].all.played,
    // Calculate total goals
    total_goals: standing.league.standings[0].reduce(
      (sum, team) => sum + team.all.goals.for, 0
    ),
    // Calculate average goals per match
    avg_goals_per_match: (
      standing.league.standings[0].reduce(
        (sum, team) => sum + team.all.goals.for, 0
      ) / 
      (standing.league.standings[0][0].all.played * standing.league.standings[0].length / 2)
    ).toFixed(2),
    // Find top scorer (using mock data since we don't have this in the standings)
    top_scorer: standing.league.id === 332 ? "John Obi" : "Ibrahim Hassan",
    top_scorer_goals: standing.league.id === 332 ? 8 : 7
  }))
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {leagues.map((league) => (
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
                  <p className="text-sm text-muted-foreground">Avg Goals</p>
                  <p className="text-2xl font-bold">{league.avg_goals_per_match}</p>
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

function LeagueStatisticsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TeamStatistics() {
  const { teamStatistics, isLoading } = useStatistics()
  
  if (isLoading) {
    return <TeamStatisticsSkeleton />
  }
  
  // Get all teams
  const teams = Object.values(teamStatistics).map(stats => ({
    id: stats.team.id,
    name: stats.team.name,
    logo: stats.team.logo,
    matches_played: stats.fixtures.played.total,
    wins: stats.fixtures.wins.total,
    draws: stats.fixtures.draws.total,
    losses: stats.fixtures.loses.total,
    goals_for: stats.goals.for.total,
    goals_against: stats.goals.against.total,
    clean_sheets: 0, // Not available in the API data
    points: stats.fixtures.wins.total * 3 + stats.fixtures.draws.total,
    form: stats.form.split('').map(char => {
      if (char === 'W') return 'W'
      if (char === 'D') return 'D'
      if (char === 'L') return 'L'
      return ''
    }).filter(Boolean),
    // Mock top scorer data
    top_scorer: stats.team.id === 2001 ? "John Obi" : "Ibrahim Hassan",
    top_scorer_goals: stats.team.id === 2001 ? 8 : 7
  }))
  
  return (
    <div className="space-y-6">
      {teams.map((team) => (
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
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="text-xl font-bold">{team.points}</p>
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

function TeamStatisticsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="w-6 h-6 rounded-full" />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-7 w-10" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-7 w-10" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PlayerStatistics() {
  const { playerStatistics, isLoading } = useStatistics()
  
  if (isLoading) {
    return <PlayerStatisticsSkeleton />
  }
  
  // Flatten player statistics from all teams
  const players = Object.values(playerStatistics).flatMap(teamPlayers => 
    teamPlayers.map(player => ({
      id: player.id,
      name: player.name,
      team: player.statistics[0].games.position === 'F' ? 'Enyimba FC' : 'Kano Pillars',
      position: player.position,
      matches_played: player.statistics[0].games.minutes > 0 ? 10 : 0,
      goals: player.statistics[0].goals.total || 0,
      assists: player.statistics[0].goals.assists || 0,
      clean_sheets: 0, // Not available directly
      yellow_cards: player.statistics[0].cards.yellow,
      red_cards: player.statistics[0].cards.red,
      minutes_played: player.statistics[0].games.minutes,
      form_rating: parseFloat(player.statistics[0].games.rating || '0')
    }))
  ).sort((a, b) => b.goals - a.goals || b.assists - a.assists)
  
  return (
    <div className="space-y-6">
      {players.map((player) => (
        <Card key={player.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <div>
                  {player.name}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {player.team}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                  {player.position}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{player.form_rating.toFixed(1)}</span>
                </span>
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
                  <p className="text-sm text-muted-foreground">Yellow Cards</p>
                  <p className="text-xl font-bold">{player.yellow_cards}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Red Cards</p>
                  <p className="text-xl font-bold">{player.red_cards}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">G+A</p>
                  <p className="text-xl font-bold">{player.goals + player.assists}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PlayerStatisticsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-7 w-10" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-7 w-10" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState("league")
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Statistics</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="league">
            <Trophy className="h-4 w-4 mr-2" />
            League
          </TabsTrigger>
          <TabsTrigger value="team">
            <Shield className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="player">
            <Users className="h-4 w-4 mr-2" />
            Players
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="league" className="space-y-4">
          <LeagueStatistics />
        </TabsContent>
        
        <TabsContent value="team" className="space-y-4">
          <TeamStatistics />
        </TabsContent>
        
        <TabsContent value="player" className="space-y-4">
          <PlayerStatistics />
        </TabsContent>
      </Tabs>
    </div>
  )
} 