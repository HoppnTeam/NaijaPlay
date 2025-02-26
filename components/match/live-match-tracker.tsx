'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Clock, Trophy, Star } from 'lucide-react'

interface Team {
  id: string
  name: string
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

interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  homeScore: number
  awayScore: number
  status: 'not_started' | 'in_progress' | 'completed'
  currentMinute: number
  events: MatchEvent[]
  playerPerformances: PlayerPerformance[]
}

interface LiveMatchTrackerProps {
  match: Match
}

export function LiveMatchTracker({ match }: LiveMatchTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(match.currentMinute)
  
  // Update elapsed time every minute if match is in progress
  useEffect(() => {
    if (match.status !== 'in_progress') {
      setElapsedTime(match.currentMinute)
      return
    }
    
    const timer = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1
        return newTime > 90 ? 90 : newTime
      })
    }, 60000) // Update every minute
    
    return () => clearInterval(timer)
  }, [match.status, match.currentMinute])
  
  // Sort events by minute
  const sortedEvents = [...match.events].sort((a, b) => b.minute - a.minute)
  
  // Sort player performances by rating
  const sortedPerformances = [...match.playerPerformances].sort((a, b) => b.rating - a.rating)
  
  // Group performances by team
  const homeTeamPerformances = sortedPerformances.filter(p => p.teamId === match.homeTeam.id)
  const awayTeamPerformances = sortedPerformances.filter(p => p.teamId === match.awayTeam.id)
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Match Details</CardTitle>
          <Badge variant={match.status === 'in_progress' ? 'default' : 'secondary'}>
            {match.status === 'in_progress' ? (
              <span className="flex items-center">
                <Clock className="mr-1 h-3 w-3" /> Live: {elapsedTime}'
              </span>
            ) : match.status === 'completed' ? (
              'Full Time'
            ) : (
              'Not Started'
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Home Team */}
            <div className="text-center">
              <h3 className="text-lg font-bold">{match.homeTeam.name}</h3>
              <div className="mt-2 text-3xl font-bold">{match.homeScore}</div>
            </div>
            
            {/* VS */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">vs</div>
            </div>
            
            {/* Away Team */}
            <div className="text-center">
              <h3 className="text-lg font-bold">{match.awayTeam.name}</h3>
              <div className="mt-2 text-3xl font-bold">{match.awayScore}</div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Match Events</TabsTrigger>
            <TabsTrigger value="players">Player Performances</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <div className="space-y-4 mt-4">
              {sortedEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No events yet
                </p>
              ) : (
                sortedEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-3 border-b pb-3">
                    <Badge variant="outline" className="mt-0.5">
                      {event.minute}'
                    </Badge>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.playerName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({event.teamId === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span>{getEventEmoji(event.type)}</span>
                        <span>{event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span>
                        {event.assistPlayerName && (
                          <span className="text-muted-foreground">
                            (Assist: {event.assistPlayerName})
                          </span>
                        )}
                      </div>
                      {event.detail && (
                        <p className="text-xs text-muted-foreground mt-1">{event.detail}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="players">
            <div className="space-y-6 mt-4">
              {/* Home Team Players */}
              <div>
                <h3 className="font-semibold mb-3">{match.homeTeam.name}</h3>
                <div className="space-y-2">
                  {homeTeamPerformances.map((player) => (
                    <div key={player.playerId} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{player.playerName}</div>
                        <div className="text-xs text-muted-foreground">{player.position}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          {player.goals > 0 && (
                            <span className="mr-2">⚽ {player.goals}</span>
                          )}
                          {player.assists > 0 && (
                            <span>🅰️ {player.assists}</span>
                          )}
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {player.rating.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Away Team Players */}
              <div>
                <h3 className="font-semibold mb-3">{match.awayTeam.name}</h3>
                <div className="space-y-2">
                  {awayTeamPerformances.map((player) => (
                    <div key={player.playerId} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{player.playerName}</div>
                        <div className="text-xs text-muted-foreground">{player.position}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          {player.goals > 0 && (
                            <span className="mr-2">⚽ {player.goals}</span>
                          )}
                          {player.assists > 0 && (
                            <span>🅰️ {player.assists}</span>
                          )}
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {player.rating.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
    case 'substitution':
      return '🔄'
    case 'var':
      return '📺'
    default:
      return '📝'
  }
} 