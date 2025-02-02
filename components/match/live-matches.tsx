'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface Match {
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
  match_date: string
  status: string
}

export function LiveMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchLiveMatches() {
      try {
        const { data, error } = await supabase
          .from('match_history')
          .select(`
            id,
            home_score,
            away_score,
            match_date,
            status,
            home_team:teams!match_history_home_team_id_fkey (
              id,
              name
            ),
            away_team:teams!match_history_away_team_id_fkey (
              id,
              name
            )
          `)
          .eq('status', 'in_progress')

        if (error) throw error

        // Transform the data to match our interface
        const transformedMatches: Match[] = (data || []).map(match => ({
          ...match,
          home_team: match.home_team[0],
          away_team: match.away_team[0]
        }))

        setMatches(transformedMatches)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch matches'))
      } finally {
        setLoading(false)
      }
    }

    fetchLiveMatches()

    // Subscribe to match updates
    const channel = supabase
      .channel('match_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_history',
          filter: 'status=eq.in_progress'
        },
        () => {
          fetchLiveMatches()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        Error: {error.message}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No live matches at the moment
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <Card key={match.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Live Match
              <Badge className="ml-2 bg-green-500">In Progress</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{match.home_team.name}</span>
                <span className="text-2xl font-bold">{match.home_score}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{match.away_team.name}</span>
                <span className="text-2xl font-bold">{match.away_score}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 