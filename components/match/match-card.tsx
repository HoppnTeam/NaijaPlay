import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Fixture } from '@/lib/api-football/types'
import { cn } from '@/lib/utils'
import { LiveMatchTracker } from './live-match-tracker'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

interface MatchCardProps {
  fixture: Fixture
  type: 'live' | 'upcoming'
}

// Define the types for LiveMatchTracker
interface PlayerPerformance {
  playerId: string
  playerName: string
  teamId: string
  position: string
  rating: number
  goals: number
  assists: number
  minutesPlayed: number
}

interface MatchEvent {
  minute: number
  type: string
  teamId: string
  playerId: string
  playerName: string
  assistPlayerId?: string
  assistPlayerName?: string
  detail?: string
}

interface Match {
  id: string
  homeTeam: {
    id: string
    name: string
  }
  awayTeam: {
    id: string
    name: string
  }
  homeScore: number
  awayScore: number
  status: 'completed' | 'not_started' | 'in_progress'
  currentMinute: number
  events: MatchEvent[]
  playerPerformances: PlayerPerformance[]
}

// Extend the Fixture type to include venue
interface ExtendedFixture extends Fixture {
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    timestamp: number
    status: {
      long: string
      short: string
      elapsed: number | null
    }
    venue?: {
      name: string
      city: string
    }
  }
}

const MATCH_STATUS_VARIANTS = {
  '1H': 'default',
  '2H': 'default',
  'HT': 'secondary',
  'FT': 'outline',
  'NS': 'outline',
  'PST': 'destructive',
  'CANC': 'destructive',
} as const

export function MatchCard({ fixture, type }: MatchCardProps) {
  // Cast fixture to ExtendedFixture to handle venue property
  const extendedFixture = fixture as ExtendedFixture
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const isLive = type === 'live'
  const status = extendedFixture.fixture.status
  const matchDate = new Date(extendedFixture.fixture.date)

  const getStatusDisplay = () => {
    if (status.short === 'HT') return 'Half Time'
    if (status.short === 'FT') return 'Full Time'
    if (status.elapsed) return `${status.elapsed}'`
    if (status.short === 'NS') {
      return matchDate.toLocaleString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Lagos'
      })
    }
    return status.long
  }

  const getStatusVariant = () => {
    return (MATCH_STATUS_VARIANTS[status.short as keyof typeof MATCH_STATUS_VARIANTS] || 'outline') as
      | 'default'
      | 'secondary'
      | 'outline'
      | 'destructive'
  }

  // Convert API Football data to LiveMatchTracker format
  const convertToLiveMatchFormat = (): Match => {
    const events: MatchEvent[] = extendedFixture.events?.map(event => ({
      minute: event.time.elapsed,
      type: event.type.toLowerCase(),
      teamId: event.team.id.toString(),
      playerId: event.player.id.toString(),
      playerName: event.player.name,
      assistPlayerId: event.assist?.id?.toString(),
      // Convert null to undefined for assistPlayerName
      assistPlayerName: event.assist?.name || undefined,
      detail: event.detail
    })) || []

    // Extract player performances from lineups if available
    const playerPerformances: PlayerPerformance[] = []
    if (extendedFixture.lineups && extendedFixture.lineups.length > 0) {
      extendedFixture.lineups.forEach(lineup => {
        const teamId = lineup.team.id.toString()
        
        // Add starting XI
        lineup.startXI.forEach(player => {
          if (player.statistics && player.statistics.length > 0) {
            const stats = player.statistics[0]
            playerPerformances.push({
              playerId: player.id.toString(),
              playerName: player.name,
              teamId: teamId,
              position: player.position,
              rating: parseFloat(stats.games.rating || '6.0'),
              goals: stats.goals.total || 0,
              assists: stats.goals.assists || 0,
              minutesPlayed: stats.games.minutes
            })
          }
        })
        
        // Add substitutes who played
        lineup.substitutes.forEach(player => {
          if (player.statistics && player.statistics.length > 0 && player.statistics[0].games.minutes > 0) {
            const stats = player.statistics[0]
            playerPerformances.push({
              playerId: player.id.toString(),
              playerName: player.name,
              teamId: teamId,
              position: player.position,
              rating: parseFloat(stats.games.rating || '6.0'),
              goals: stats.goals.total || 0,
              assists: stats.goals.assists || 0,
              minutesPlayed: stats.games.minutes
            })
          }
        })
      })
    }

    // Map API status to our status format
    let matchStatus: 'completed' | 'not_started' | 'in_progress' = 'not_started'
    if (status.short === 'FT') {
      matchStatus = 'completed'
    } else if (status.short === 'NS') {
      matchStatus = 'not_started'
    } else {
      matchStatus = 'in_progress'
    }

    return {
      id: extendedFixture.fixture.id.toString(),
      homeTeam: {
        id: extendedFixture.teams.home.id.toString(),
        name: extendedFixture.teams.home.name
      },
      awayTeam: {
        id: extendedFixture.teams.away.id.toString(),
        name: extendedFixture.teams.away.name
      },
      homeScore: extendedFixture.goals.home || 0,
      awayScore: extendedFixture.goals.away || 0,
      status: matchStatus,
      currentMinute: status.elapsed || 0,
      events,
      playerPerformances
    }
  }

  // Check if venue information is available
  const hasVenueInfo = extendedFixture.fixture.venue && extendedFixture.fixture.venue.name && extendedFixture.fixture.venue.city

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
          {/* League Badge */}
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-2">
              <img 
                src={extendedFixture.league.logo} 
                alt={extendedFixture.league.name}
                className="h-4 w-4 object-contain"
              />
              <span className="text-xs text-muted-foreground">
                {extendedFixture.league.name}
              </span>
            </div>
          </div>

          {/* Match Status */}
          <div className="absolute top-2 right-2">
            <Badge variant={getStatusVariant()}>
              {getStatusDisplay()}
            </Badge>
          </div>

          <CardContent className="pt-10">
            <div className="grid grid-cols-3 items-center gap-4">
              {/* Home Team */}
              <div className="text-center">
                <img
                  src={extendedFixture.teams.home.logo}
                  alt={extendedFixture.teams.home.name}
                  className={cn(
                    "mx-auto h-12 w-12 object-contain",
                    extendedFixture.teams.home.winner && "ring-2 ring-green-500 rounded-full"
                  )}
                />
                <p className="mt-2 text-sm font-medium line-clamp-1">
                  {extendedFixture.teams.home.name}
                </p>
              </div>

              {/* Score/Time */}
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {isLive || status.short === 'FT' ? (
                    `${extendedFixture.goals.home ?? 0} - ${extendedFixture.goals.away ?? 0}`
                  ) : (
                    'vs'
                  )}
                </div>
                {isLive && extendedFixture.score.halftime.home !== null && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    HT: {extendedFixture.score.halftime.home} - {extendedFixture.score.halftime.away}
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="text-center">
                <img
                  src={extendedFixture.teams.away.logo}
                  alt={extendedFixture.teams.away.name}
                  className={cn(
                    "mx-auto h-12 w-12 object-contain",
                    extendedFixture.teams.away.winner && "ring-2 ring-green-500 rounded-full"
                  )}
                />
                <p className="mt-2 text-sm font-medium line-clamp-1">
                  {extendedFixture.teams.away.name}
                </p>
              </div>
            </div>

            {/* Match Events */}
            {isLive && extendedFixture.events && extendedFixture.events.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs font-medium mb-2">Recent Events</p>
                <div className="space-y-1">
                  {extendedFixture.events.slice(-3).map((event, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs">
                        {event.time.elapsed}'
                        {event.time.extra && `+${event.time.extra}`}
                      </Badge>
                      <span>{getEventEmoji(event.type)}</span>
                      <span className="font-medium">{event.player.name}</span>
                      {event.assist.name && (
                        <span className="text-muted-foreground">
                          (assist: {event.assist.name})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue Info - Only for upcoming matches */}
            {!isLive && hasVenueInfo && extendedFixture.fixture.venue && (
              <div className="mt-4 text-xs text-center text-muted-foreground">
                {extendedFixture.fixture.venue.name}, {extendedFixture.fixture.venue.city}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        {(isLive || status.short === 'FT') && (
          <LiveMatchTracker match={convertToLiveMatchFormat()} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function getEventEmoji(type: string): string {
  switch (type.toLowerCase()) {
    case 'goal':
      return '⚽'
    case 'card':
      return '🟨'
    case 'subst':
      return '🔄'
    case 'var':
      return '📺'
    default:
      return '📝'
  }
} 