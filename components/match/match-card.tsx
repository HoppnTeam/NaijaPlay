import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Fixture } from '@/types/fixtures'
import { cn } from '@/lib/utils'

interface MatchCardProps {
  fixture: Fixture
  type: 'live' | 'upcoming'
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
  const isLive = type === 'live'
  const status = fixture.fixture.status
  const matchDate = new Date(fixture.fixture.date)

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

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      {/* League Badge */}
      <div className="absolute top-2 left-2">
        <div className="flex items-center gap-2">
          <img 
            src={fixture.league.logo} 
            alt={fixture.league.name}
            className="h-4 w-4 object-contain"
          />
          <span className="text-xs text-muted-foreground">
            {fixture.league.name}
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
              src={fixture.teams.home.logo}
              alt={fixture.teams.home.name}
              className={cn(
                "mx-auto h-12 w-12 object-contain",
                fixture.teams.home.winner && "ring-2 ring-green-500 rounded-full"
              )}
            />
            <p className="mt-2 text-sm font-medium line-clamp-1">
              {fixture.teams.home.name}
            </p>
          </div>

          {/* Score/Time */}
          <div className="text-center">
            <div className="text-2xl font-bold">
              {isLive || status.short === 'FT' ? (
                `${fixture.goals.home ?? 0} - ${fixture.goals.away ?? 0}`
              ) : (
                'vs'
              )}
            </div>
            {isLive && fixture.score.halftime.home !== null && (
              <div className="mt-1 text-xs text-muted-foreground">
                HT: {fixture.score.halftime.home} - {fixture.score.halftime.away}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="text-center">
            <img
              src={fixture.teams.away.logo}
              alt={fixture.teams.away.name}
              className={cn(
                "mx-auto h-12 w-12 object-contain",
                fixture.teams.away.winner && "ring-2 ring-green-500 rounded-full"
              )}
            />
            <p className="mt-2 text-sm font-medium line-clamp-1">
              {fixture.teams.away.name}
            </p>
          </div>
        </div>

        {/* Match Events */}
        {isLive && fixture.events && fixture.events.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium mb-2">Recent Events</p>
            <div className="space-y-1">
              {fixture.events.slice(-3).map((event, index) => (
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
        {!isLive && fixture.fixture.venue.name && (
          <div className="mt-4 text-xs text-center text-muted-foreground">
            {fixture.fixture.venue.name}, {fixture.fixture.venue.city}
          </div>
        )}
      </CardContent>
    </Card>
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