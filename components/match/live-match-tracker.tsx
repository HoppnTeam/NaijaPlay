'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface LiveMatchTrackerProps {
  match: {
    id: string
    home_team: {
      id: string
      name: string
    }
    away_team: {
      id: string
      name: string
    }
    home_score: number
    away_score: number
    match_events: Array<{
      id: string
      type: string
      minute: number
      description: string
    }>
    player_performances: Array<{
      playerId: string
      rating: number
      goals: number
      assists: number
      playerName: string
    }>
  }
}

export function LiveMatchTracker({ match }: LiveMatchTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => (prev + 1) % 91)
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {match.home_team.name} vs {match.away_team.name}
          </CardTitle>
          <Badge variant="secondary">{elapsedTime}'</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4 text-2xl font-bold">
            <span>{match.home_team.name}</span>
            <span className="rounded-lg bg-muted px-4 py-2">
              {match.home_score} - {match.away_score}
            </span>
            <span>{match.away_team.name}</span>
          </div>

          <Tabs defaultValue="events">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="events">Match Events</TabsTrigger>
              <TabsTrigger value="stats">Player Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 p-4">
                  {match.match_events
                    .sort((a, b) => b.minute - a.minute)
                    .map(event => (
                      <div key={event.id} className="flex items-center gap-2 text-sm">
                        <span className="font-mono">{event.minute}'</span>
                        <span>{event.description}</span>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="stats">
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 p-4">
                  {match.player_performances
                    .sort((a, b) => b.rating - a.rating)
                    .map(perf => (
                      <div
                        key={perf.playerId}
                        className="flex items-center justify-between"
                      >
                        <span>{perf.playerName}</span>
                        <div className="flex items-center gap-4">
                          <span>Rating: {perf.rating.toFixed(1)}</span>
                          {perf.goals > 0 && <span>⚽ {perf.goals}</span>}
                          {perf.assists > 0 && <span>👟 {perf.assists}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
} 