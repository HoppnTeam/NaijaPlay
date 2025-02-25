'use client'

// This component handles the match page functionality
import { useEffect, useState } from 'react'
import { LiveMatches } from '@/components/match/live-matches'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSquadData } from '@/hooks/use-squad-data'
import { useTeam } from '@/hooks/use-team'
import { Loader2 } from 'lucide-react'
import type { Database } from '@/types/supabase'

type TeamWithPlayers = Database['public']['Tables']['teams']['Row'] & {
  team_players?: Array<{
    players: Database['public']['Tables']['players']['Row']
  }>
}

export default function MatchPage() {
  const [primaryTeamId, setPrimaryTeamId] = useState<string | null>(null)
  
  useEffect(() => {
    try {
      const storedId = localStorage.getItem('primaryTeamId')
      setPrimaryTeamId(storedId as string | null)
    } catch (error) {
      console.error('Error accessing localStorage:', error)
      setPrimaryTeamId(null)
    }
  }, [])

  const { team, isLoading: teamLoading } = useTeam(primaryTeamId)
  const { squad, isLoading: squadLoading } = useSquadData(team?.id)

  const isLoading = teamLoading || squadLoading

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Match Center</h2>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Matches</TabsTrigger>
          <TabsTrigger value="my-team">My Team</TabsTrigger>
          <TabsTrigger value="history">Match History</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <LiveMatches />
        </TabsContent>

        <TabsContent value="my-team">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              </CardContent>
            </Card>
          ) : !team ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Create a team to start tracking match performance
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Team Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Formation: {team.formation}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Playing Style: {team.playing_style}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mentality: {team.mentality}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Active Players */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {squad?.players?.map((tp) => (
                      <div key={tp.player_id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{tp.players.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {tp.players.position}
                          </p>
                        </div>
                        {tp.is_captain && (
                          <span className="text-sm font-medium text-primary">Captain</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {/* We'll implement match history later */}
              <p className="text-center text-muted-foreground">Match history coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 