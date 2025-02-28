'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MatchEngine, MatchResult } from '@/lib/game/match-engine'
import { Play, Loader2 } from 'lucide-react'

// Define the types that were previously imported from match-engine
interface Player {
  id: string
  name: string
  position: string
  attributes: {
    pace: number
    shooting: number
    passing: number
    dribbling: number
    defending: number
    physical: number
  }
}

interface Team {
  id: string
  name: string
  players: Player[]
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

interface MatchSimulationProps {
  homeTeam: Team
  awayTeam: Team
}

export function MatchSimulation({ homeTeam, awayTeam }: MatchSimulationProps) {
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulateMatch = () => {
    setIsSimulating(true)
    
    // Simulate a match result since the actual MatchEngine implementation is different
    const simulateMatch = (): MatchResult => {
      // Create a simplified match result for demonstration
      const homeScore = Math.floor(Math.random() * 5)
      const awayScore = Math.floor(Math.random() * 3)
      
      // Generate some events
      const events: MatchEvent[] = []
      const numEvents = 5 + Math.floor(Math.random() * 10)
      
      for (let i = 0; i < numEvents; i++) {
        const minute = 1 + Math.floor(Math.random() * 90)
        const isHomeEvent = Math.random() > 0.4
        const team = isHomeEvent ? homeTeam : awayTeam
        const players = team.players
        const player = players[Math.floor(Math.random() * players.length)]
        
        const eventTypes = ['goal', 'card', 'substitution']
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        
        let description = ''
        if (type === 'goal') {
          description = `GOAL! ${player.name} scores for ${team.name}!`
        } else if (type === 'card') {
          const cardType = Math.random() > 0.7 ? 'red' : 'yellow'
          description = `${cardType.toUpperCase()} CARD for ${player.name} (${team.name})`
        } else {
          description = `Substitution for ${team.name}`
        }
        
        events.push({
          minute,
          type,
          teamId: team.id,
          playerId: player.id,
          playerName: player.name,
          detail: type === 'card' ? (Math.random() > 0.7 ? 'red' : 'yellow') : undefined
        })
      }
      
      // Sort events by minute
      events.sort((a, b) => a.minute - b.minute)
      
      // Generate player performances
      const playerPerformances: PlayerPerformance[] = []
      
      // Home team performances
      homeTeam.players.forEach(player => {
        const goals = Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0
        const assists = Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0
        
        playerPerformances.push({
          playerId: player.id,
          playerName: player.name,
          teamId: homeTeam.id,
          position: player.position,
          rating: 5 + Math.random() * 5,
          goals,
          assists,
          minutesPlayed: 90
        })
      })
      
      // Away team performances
      awayTeam.players.forEach(player => {
        const goals = Math.random() > 0.8 ? Math.floor(Math.random() * 2) : 0
        const assists = Math.random() > 0.8 ? Math.floor(Math.random() * 2) : 0
        
        playerPerformances.push({
          playerId: player.id,
          playerName: player.name,
          teamId: awayTeam.id,
          position: player.position,
          rating: 5 + Math.random() * 5,
          goals,
          assists,
          minutesPlayed: 90
        })
      })
      
      return {
        id: `match-${Date.now()}`,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeScore,
        awayScore,
        events,
        playerPerformances,
        date: new Date()
      }
    }
    
    // Simulate the match
    const result = simulateMatch()
    setMatchResult(result)
    setIsSimulating(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold">Match Simulation</h2>
        <Button 
          onClick={handleSimulateMatch} 
          disabled={isSimulating}
          className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base"
        >
          {isSimulating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Match
            </>
          )}
        </Button>
      </div>

      {matchResult && (
        <>
          <Card>
            <CardHeader className="py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg text-center">Match Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-xl sm:text-2xl font-bold">
                <span className="text-center sm:text-right w-full sm:w-1/3 truncate">{homeTeam.name}</span>
                <span className="px-3 py-1 sm:px-4 sm:py-2 bg-muted rounded-lg">
                  {matchResult.homeScore} - {matchResult.awayScore}
                </span>
                <span className="text-center sm:text-left w-full sm:w-1/3 truncate">{awayTeam.name}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="py-3 sm:py-4">
                <CardTitle className="text-base sm:text-lg">Match Events</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <ScrollArea className="h-[250px] sm:h-[300px]">
                  <div className="space-y-2">
                    {matchResult.events.map((event, index) => {
                      let description = '';
                      if (event.type === 'goal') {
                        description = `GOAL! ${event.playerName} scores for ${event.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}!`;
                      } else if (event.type === 'card') {
                        const cardType = event.detail || 'yellow';
                        description = `${cardType.toUpperCase()} CARD for ${event.playerName}`;
                      } else {
                        description = `Substitution for ${event.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}`;
                      }
                      
                      return (
                        <div
                          key={`event-${index}`}
                          className="flex items-center gap-2 text-xs sm:text-sm p-1.5 sm:p-2 hover:bg-muted rounded-md"
                        >
                          <span className="font-mono min-w-[30px] text-right">{event.minute}'</span>
                          <span>{description}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 sm:py-4">
                <CardTitle className="text-base sm:text-lg">Player Performances</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <ScrollArea className="h-[250px] sm:h-[300px]">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-sm sm:text-base">{homeTeam.name}</h3>
                      <div className="space-y-1.5">
                        {matchResult.playerPerformances
                          .filter((p) => 
                            homeTeam.players.some((hp) => hp.id === p.playerId)
                          )
                          .map((performance) => {
                            const player = homeTeam.players.find(
                              (p) => p.id === performance.playerId
                            )!
                            return (
                              <div
                                key={performance.playerId}
                                className="flex justify-between items-center text-xs sm:text-sm p-1.5 hover:bg-muted rounded-md"
                              >
                                <span className="font-medium truncate max-w-[120px] sm:max-w-[180px]">{player.name}</span>
                                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                  <span className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                    {performance.rating.toFixed(1)}
                                  </span>
                                  {performance.goals > 0 && (
                                    <span className="flex items-center">
                                      <span className="mr-1">⚽</span>
                                      <span>{performance.goals}</span>
                                    </span>
                                  )}
                                  {performance.assists > 0 && (
                                    <span className="flex items-center">
                                      <span className="mr-1">👟</span>
                                      <span>{performance.assists}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm sm:text-base">{awayTeam.name}</h3>
                      <div className="space-y-1.5">
                        {matchResult.playerPerformances
                          .filter((p) => 
                            awayTeam.players.some((ap) => ap.id === p.playerId)
                          )
                          .map((performance) => {
                            const player = awayTeam.players.find(
                              (p) => p.id === performance.playerId
                            )!
                            return (
                              <div
                                key={performance.playerId}
                                className="flex justify-between items-center text-xs sm:text-sm p-1.5 hover:bg-muted rounded-md"
                              >
                                <span className="font-medium truncate max-w-[120px] sm:max-w-[180px]">{player.name}</span>
                                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                  <span className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                    {performance.rating.toFixed(1)}
                                  </span>
                                  {performance.goals > 0 && (
                                    <span className="flex items-center">
                                      <span className="mr-1">⚽</span>
                                      <span>{performance.goals}</span>
                                    </span>
                                  )}
                                  {performance.assists > 0 && (
                                    <span className="flex items-center">
                                      <span className="mr-1">👟</span>
                                      <span>{performance.assists}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                        })}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
} 