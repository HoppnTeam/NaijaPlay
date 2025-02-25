'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, RefreshCw, Calendar, AlertCircle } from 'lucide-react'
import { useLiveMatches } from '@/hooks/use-live-matches'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MatchCard } from '@/components/match/match-card'
import { Fixture } from '@/lib/api-football/types'

// League-specific configurations
const LEAGUE_CONFIGS = {
  39: {
    name: 'English Premier League',
    shortName: 'EPL',
    primaryColor: 'bg-[#3D195B]',
    textColor: 'text-[#3D195B]'
  },
  332: {
    name: 'Nigerian Premier League',
    shortName: 'NPFL',
    primaryColor: 'bg-[#008751]',
    textColor: 'text-[#008751]'
  }
} as const

export function LiveMatches() {
  const { matches, isLive, isLoading, error, refresh } = useLiveMatches()

  // Group matches by league
  const matchesByLeague = matches?.reduce((acc: Record<number, Fixture[]>, match) => {
    const leagueId = match.league.id
    if (!acc[leagueId]) {
      acc[leagueId] = []
    }
    acc[leagueId].push(match)
    return acc
  }, {}) || {}

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load matches</p>
            </div>
            <Button 
              onClick={refresh} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const hasMatches = Object.keys(matchesByLeague).length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isLive ? (
              <Trophy className="h-5 w-5 text-primary" />
            ) : (
              <Calendar className="h-5 w-5 text-primary" />
            )}
            {isLive ? 'Live Matches' : 'Upcoming Matches'}
            {hasMatches && (
              <Badge variant="secondary" className="ml-2">
                {matches.length} {isLive ? 'Live' : 'Upcoming'}
              </Badge>
            )}
          </CardTitle>
          <Button 
            onClick={refresh} 
            variant="ghost" 
            size="sm"
            disabled={isLoading}
            className={cn(
              "transition-all duration-200",
              isLoading && "animate-pulse"
            )}
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              isLoading && "animate-spin"
            )} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasMatches ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {isLive 
                ? 'No live matches at the moment'
                : 'No upcoming matches found'
              }
            </p>
            <Button 
              onClick={refresh} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Again
                </>
              )}
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {Object.entries(matchesByLeague).map(([leagueId, leagueMatches]) => {
                const league = leagueMatches[0]?.league
                const config = LEAGUE_CONFIGS[Number(leagueId) as keyof typeof LEAGUE_CONFIGS]
                
                return (
                  <div key={leagueId} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1 rounded-lg",
                        config?.primaryColor || "bg-gray-200"
                      )}>
                        <img 
                          src={league?.logo} 
                          alt={league?.name}
                          className="h-6 w-6 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{league?.name}</h3>
                        {config && (
                          <span className={cn(
                            "text-xs",
                            config.textColor
                          )}>
                            {config.shortName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {leagueMatches.map((match) => (
                        <MatchCard 
                          key={match.fixture.id}
                          fixture={match}
                          type={isLive ? 'live' : 'upcoming'}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <Card className={cn(
      "transition-all duration-200",
      "animate-pulse"
    )}>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-[200px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function formatMatchTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // If match is today
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  }
  
  // If match is tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  }
  
  // Otherwise show day and time
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getMatchStatusDisplay(elapsed: number | null, status: string): string {
  if (status === 'HT') return 'Half Time'
  if (status === 'FT') return 'Full Time'
  if (elapsed) return `${elapsed}'`
  return status
}

function getMatchStatusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case '1H':
    case '2H':
      return 'default'
    case 'HT':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getEventEmoji(type: string): string {
  switch (type.toLowerCase()) {
    case 'goal':
      return '⚽'
    case 'card':
      return '🟨'
    case 'subst':
      return '🔄'
    default:
      return '📝'
  }
} 