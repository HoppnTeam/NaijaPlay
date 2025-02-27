import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trophy, Users, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

interface Match {
  id: string
  gameweek_id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  status: 'scheduled' | 'in_progress' | 'completed'
  home_score: number
  away_score: number
  home_team: {
    id: string
    name: string
  }
  away_team: {
    id: string
    name: string
  }
}

interface PlayerGameweekStat {
  id: string
  player_id: string
  gameweek_id: string
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
  total_points: number
  players: {
    id: string
    first_name: string
    last_name: string
    position: string
    team: string
    price: number
    image_url: string | null
  }
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

function GameweekNavigation({ 
  currentGameweek, 
  allGameweeks 
}: { 
  currentGameweek: Gameweek | null, 
  allGameweeks: Gameweek[] | null 
}) {
  if (!currentGameweek || !allGameweeks || allGameweeks.length === 0) {
    return null
  }

  const currentIndex = allGameweeks.findIndex(gw => gw.id === currentGameweek.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < allGameweeks.length - 1
  const previousGameweek = hasPrevious ? allGameweeks[currentIndex - 1] : null
  const nextGameweek = hasNext ? allGameweeks[currentIndex + 1] : null

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {hasPrevious ? (
          <Link href={`/dashboard/gameweek?id=${previousGameweek?.id}`} passHref>
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Gameweek {previousGameweek?.number}
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
        )}
        
        <div className="w-40">
          <Select defaultValue={currentGameweek.id}>
            <SelectTrigger>
              <SelectValue placeholder="Select Gameweek" />
            </SelectTrigger>
            <SelectContent>
              {allGameweeks.map(gameweek => (
                <SelectItem key={gameweek.id} value={gameweek.id}>
                  <Link href={`/dashboard/gameweek?id=${gameweek.id}`} className="block w-full">
                    Gameweek {gameweek.number}
                  </Link>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {hasNext ? (
          <Link href={`/dashboard/gameweek?id=${nextGameweek?.id}`} passHref>
            <Button variant="outline" size="sm">
              Gameweek {nextGameweek?.number}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant={currentGameweek.status === 'upcoming' ? 'secondary' : 
                        currentGameweek.status === 'in_progress' ? 'success' : 'default'}>
          {currentGameweek.status === 'upcoming' ? 'Upcoming' : 
           currentGameweek.status === 'in_progress' ? 'In Progress' : 'Completed'}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {formatDate(currentGameweek.start_date)} - {formatDate(currentGameweek.end_date)}
        </span>
      </div>
    </div>
  )
}

function GameweekStatus({ gameweek, matches, error }: { 
  gameweek: Gameweek | null, 
  matches: Match[] | null,
  error: any 
}) {
  // Use mock data if no real data is available
  const displayGameweek = gameweek || mockGameweek
  
  // Count matches by status
  const matchesInProgress = matches?.filter(m => m.status === 'in_progress').length || 0
  const matchesCompleted = matches?.filter(m => m.status === 'completed').length || 0
  const matchesUpcoming = matches?.filter(m => m.status === 'scheduled').length || 0
  const totalMatches = (matches?.length || 0)

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
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <p>In Progress: {matchesInProgress}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-4 py-0">✓</Badge>
                <p>Completed: {matchesCompleted}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <p>Upcoming: {matchesUpcoming}</p>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-gray-500" />
                <p>Total Matches: {totalMatches}</p>
              </div>
            </div>
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

function MatchList({ matches, error }: { matches: Match[] | null, error: any }) {
  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No matches scheduled for this gameweek yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex-1 text-right">
                <p className="font-medium">{match.home_team.name}</p>
                {match.status !== 'scheduled' && (
                  <p className="text-2xl font-bold">{match.home_score}</p>
                )}
              </div>
              
              <div className="mx-4 text-center">
                {match.status === 'scheduled' ? (
                  <div>
                    <Badge variant="outline">VS</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : match.status === 'in_progress' ? (
                  <Badge variant="success">LIVE</Badge>
                ) : (
                  <Badge>FT</Badge>
                )}
              </div>
              
              <div className="flex-1 text-left">
                <p className="font-medium">{match.away_team.name}</p>
                {match.status !== 'scheduled' && (
                  <p className="text-2xl font-bold">{match.away_score}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function fetchTeamPlayerStats(supabase: any, teamId: string, gameweekId: string) {
  // Fetch all players in the team
  const { data: teamPlayers, error: teamPlayersError } = await supabase
    .from('team_players')
    .select(`
      id,
      player_id,
      is_captain,
      is_vice_captain,
      is_starting,
      players (
        id,
        first_name,
        last_name,
        position,
        team,
        price,
        image_url
      )
    `)
    .eq('team_id', teamId)

  if (teamPlayersError) {
    console.error('Error fetching team players:', teamPlayersError)
    return []
  }

  // Fetch player stats for the gameweek
  const playerIds = teamPlayers.map((tp: any) => tp.player_id)
  const { data: playerStats, error: playerStatsError } = await supabase
    .from('player_gameweek_stats')
    .select(`
      id,
      player_id,
      gameweek_id,
      minutes_played,
      goals_scored,
      assists,
      clean_sheets,
      goals_conceded,
      own_goals,
      penalties_saved,
      penalties_missed,
      yellow_cards,
      red_cards,
      saves,
      bonus,
      total_points
    `)
    .eq('gameweek_id', gameweekId)
    .in('player_id', playerIds)

  if (playerStatsError) {
    console.error('Error fetching player stats:', playerStatsError)
    return []
  }

  // Combine team player data with stats
  return teamPlayers.map((teamPlayer: any) => {
    const stats = playerStats.find((ps: any) => ps.player_id === teamPlayer.player_id) || {
      minutes_played: 0,
      goals_scored: 0,
      assists: 0,
      clean_sheets: 0,
      goals_conceded: 0,
      own_goals: 0,
      penalties_saved: 0,
      penalties_missed: 0,
      yellow_cards: 0,
      red_cards: 0,
      saves: 0,
      bonus: 0,
      total_points: 0
    }

    return {
      ...teamPlayer,
      ...stats,
      // Double points for captain
      effective_points: teamPlayer.is_captain ? stats.total_points * 2 : stats.total_points
    }
  })
}

function MyTeamPerformance({ 
  teamId, 
  gameweekId, 
  playerStats,
  error 
}: { 
  teamId: string | null, 
  gameweekId: string | null,
  playerStats: any[] | null,
  error: any 
}) {
  if (!teamId || !gameweekId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            You need to create a team first to see your performance.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!playerStats || playerStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No player statistics available for this gameweek yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate total points
  const totalPoints = playerStats.reduce((sum, player) => sum + player.effective_points, 0)
  
  // Sort players: starting XI first, then by position (GK, DEF, MID, FWD)
  const sortedPlayers = [...playerStats].sort((a, b) => {
    if (a.is_starting !== b.is_starting) {
      return a.is_starting ? -1 : 1
    }
    
    const positionOrder: Record<string, number> = {
      'Goalkeeper': 1,
      'Defender': 2,
      'Midfielder': 3,
      'Forward': 4
    }
    
    return positionOrder[a.players.position] - positionOrder[b.players.position]
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Team Performance
            </div>
            <div className="text-2xl font-bold">{totalPoints} pts</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedPlayers.map((player) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-3 rounded-lg border 
                  ${player.is_starting ? 'bg-accent/20' : ''}
                  ${player.is_captain ? 'border-yellow-400' : player.is_vice_captain ? 'border-blue-400' : ''}
                  hover:bg-accent/50 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                      {player.players.image_url ? (
                        <img 
                          src={player.players.image_url} 
                          alt={`${player.players.first_name} ${player.players.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold">
                          {player.players.first_name[0]}{player.players.last_name[0]}
                        </span>
                      )}
                    </div>
                    {player.is_captain && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-black">C</span>
                      </div>
                    )}
                    {player.is_vice_captain && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-black">V</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium">{player.players.first_name} {player.players.last_name}</p>
                    <p className="text-xs text-muted-foreground">{player.players.position} • {player.players.team}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">MP:</span>
                      <span>{player.minutes_played}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">G:</span>
                      <span>{player.goals_scored}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">A:</span>
                      <span>{player.assists}</span>
                    </div>
                    {player.players.position === 'Goalkeeper' && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">S:</span>
                        <span>{player.saves}</span>
                      </div>
                    )}
                    {['Goalkeeper', 'Defender'].includes(player.players.position) && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">CS:</span>
                        <span>{player.clean_sheets}</span>
                      </div>
                    )}
                    {player.yellow_cards > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-3 bg-yellow-400"></div>
                        <span>{player.yellow_cards}</span>
                      </div>
                    )}
                    {player.red_cards > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-3 bg-red-500"></div>
                        <span>{player.red_cards}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right min-w-[50px]">
                    <p className="text-lg font-bold">
                      {player.effective_points}
                      {player.is_captain && <span className="text-xs text-muted-foreground ml-1">(×2)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GameweekLeaderboard({ stats, error }: { stats: TeamGameweekStat[] | null, error: any }) {
  // Use mock data if no real data is available
  const displayStats = stats || mockTeamStats

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Gameweek Leaderboard
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

export default async function GameweekPage({ searchParams }: { searchParams: { id?: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const gameweekId = searchParams.id

  // Fetch all gameweeks for navigation
  const { data: allGameweeks, error: allGameweeksError } = await supabase
    .from('gameweeks')
    .select('*')
    .order('number', { ascending: true })

  // Fetch current gameweek
  let currentGameweek = null
  let gameweekError = null

  if (gameweekId) {
    // Fetch specific gameweek if ID is provided
    const { data, error } = await supabase
      .from('gameweeks')
      .select('*')
      .eq('id', gameweekId)
      .single()
    
    currentGameweek = data
    gameweekError = error
  } else {
    // Fetch active gameweek or most recent one
    const { data, error } = await supabase
      .from('gameweeks')
      .select('*')
      .eq('status', 'in_progress')
      .order('number', { ascending: true })
      .limit(1)
    
    if (data && data.length > 0) {
      currentGameweek = data[0]
    } else {
      // If no active gameweek, get the most recent one
      const { data: recentData, error: recentError } = await supabase
        .from('gameweeks')
        .select('*')
        .order('number', { ascending: false })
        .limit(1)
      
      if (recentData && recentData.length > 0) {
        currentGameweek = recentData[0]
      }
      
      gameweekError = recentError
    }
    
    gameweekError = error
  }

  // Fetch matches for current gameweek
  const { data: matches, error: matchesError } = await supabase
    .from('match_history')
    .select(`
      *,
      home_team:teams!match_history_home_team_id_fkey (id, name),
      away_team:teams!match_history_away_team_id_fkey (id, name)
    `)
    .eq('gameweek_id', currentGameweek?.id)
    .order('match_date', { ascending: true })

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
    .limit(10)

  // Get user's team
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userTeam } = await supabase
    .from('teams')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  let playerStats = null
  if (userTeam?.id && currentGameweek?.id) {
    playerStats = await fetchTeamPlayerStats(supabase, userTeam.id, currentGameweek.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gameweek {currentGameweek?.number || '?'}</h1>
      </div>
      
      <GameweekNavigation currentGameweek={currentGameweek} allGameweeks={allGameweeks} />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="my-team">My Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <GameweekStatus gameweek={currentGameweek} matches={matches} error={gameweekError} />
            <TeamStats stats={teamStats} error={teamStatsError} />
            <div className="md:col-span-2 lg:col-span-3">
              <MatchList matches={matches} error={matchesError} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="matches" className="mt-6">
          <MatchList matches={matches} error={matchesError} />
        </TabsContent>
        
        <TabsContent value="leaderboard" className="mt-6">
          <GameweekLeaderboard stats={teamStats} error={teamStatsError} />
        </TabsContent>
        
        <TabsContent value="my-team" className="mt-6">
          <MyTeamPerformance 
            teamId={userTeam?.id || null} 
            gameweekId={currentGameweek?.id || null}
            playerStats={playerStats}
            error={null} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 