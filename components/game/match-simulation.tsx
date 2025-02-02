'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MatchEngine, Team, Player, PlayerPerformance } from '@/lib/game/match-engine'

interface MatchSimulationProps {
  homeTeam: Team
  awayTeam: Team
}

export function MatchSimulation({ homeTeam, awayTeam }: MatchSimulationProps) {
  const [matchResult, setMatchResult] = useState<ReturnType<MatchEngine['simulateMatch']> | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulateMatch = () => {
    setIsSimulating(true)
    const engine = new MatchEngine()
    const result = engine.simulateMatch(homeTeam, awayTeam)
    setMatchResult(result)
    setIsSimulating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Match Simulation</h2>
        <Button 
          onClick={handleSimulateMatch} 
          disabled={isSimulating}
        >
          {isSimulating ? 'Simulating...' : 'Start Match'}
        </Button>
      </div>

      {matchResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Match Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center gap-4 text-2xl font-bold">
                <span>{homeTeam.name}</span>
                <span className="px-4 py-2 bg-muted rounded-lg">
                  {matchResult.homeScore} - {matchResult.awayScore}
                </span>
                <span>{awayTeam.name}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Match Events</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {matchResult.events.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="font-mono">{event.minute}'</span>
                        <span>{event.description}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Player Performances</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{homeTeam.name}</h3>
                      <div className="space-y-2">
                        {matchResult.playerPerformances
                          .filter((p: PlayerPerformance) => 
                            homeTeam.players.some((hp: Player) => hp.id === p.playerId)
                          )
                          .map(performance => {
                            const player = homeTeam.players.find(
                              (p: Player) => p.id === performance.playerId
                            )!
                            return (
                              <div
                                key={performance.playerId}
                                className="flex justify-between items-center text-sm"
                              >
                                <span>{player.name}</span>
                                <div className="flex items-center gap-4">
                                  <span>Rating: {performance.rating.toFixed(1)}</span>
                                  {performance.goals > 0 && (
                                    <span>⚽ {performance.goals}</span>
                                  )}
                                  {performance.assists > 0 && (
                                    <span>👟 {performance.assists}</span>
                                  )}
                                </div>
                              </div>
                            )
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">{awayTeam.name}</h3>
                      <div className="space-y-2">
                        {matchResult.playerPerformances
                          .filter((p: PlayerPerformance) => 
                            awayTeam.players.some((ap: Player) => ap.id === p.playerId)
                          )
                          .map(performance => {
                            const player = awayTeam.players.find(
                              (p: Player) => p.id === performance.playerId
                            )!
                            return (
                              <div
                                key={performance.playerId}
                                className="flex justify-between items-center text-sm"
                              >
                                <span>{player.name}</span>
                                <div className="flex items-center gap-4">
                                  <span>Rating: {performance.rating.toFixed(1)}</span>
                                  {performance.goals > 0 && (
                                    <span>⚽ {performance.goals}</span>
                                  )}
                                  {performance.assists > 0 && (
                                    <span>👟 {performance.assists}</span>
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