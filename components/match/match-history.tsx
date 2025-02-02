'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface MatchResult {
  id: string
  match_date: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  league: 'NPFL' | 'EPL'
  gameweek: {
    number: number
    league: 'NPFL' | 'EPL'
  }
  venue: string
}

interface MatchHistoryProps {
  teamId: string
}

export function MatchHistory({ teamId }: MatchHistoryProps) {
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeague, setSelectedLeague] = useState<'NPFL' | 'EPL'>('NPFL')
  const supabase = createClient()

  useEffect(() => {
    fetchMatchResults()
  }, [selectedLeague])

  const fetchMatchResults = async () => {
    try {
      // Get the current gameweek for the selected league
      const { data: currentGameweek } = await supabase
        .from('gameweeks')
        .select('id')
        .eq('status', 'completed')
        .eq('league', selectedLeague)
        .order('end_date', { ascending: false })
        .limit(1)
        .single()

      if (!currentGameweek) return

      // Fetch completed matches from the most recent gameweek
      const { data, error } = await supabase
        .from('match_history')
        .select(`
          id,
          match_date,
          home_team,
          away_team,
          home_score,
          away_score,
          venue,
          league,
          gameweek:gameweek_id (
            number,
            league
          )
        `)
        .eq('gameweek_id', currentGameweek.id)
        .eq('status', 'completed')
        .eq('league', selectedLeague)
        .order('match_date', { ascending: false })

      if (error) throw error
      
      // Transform the data to match the MatchResult type
      const transformedData: MatchResult[] = (data || []).map((item: any) => ({
        ...item,
        gameweek: {
          number: item.gameweek[0].number,
          league: item.gameweek[0].league
        }
      }))
      
      setResults(transformedData)
    } catch (error) {
      console.error('Error fetching match results:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={() => setSelectedLeague('NPFL')}
          className={`px-4 py-2 rounded ${
            selectedLeague === 'NPFL'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary'
          }`}
        >
          NPFL
        </button>
        <button
          onClick={() => setSelectedLeague('EPL')}
          className={`px-4 py-2 rounded ${
            selectedLeague === 'EPL'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary'
          }`}
        >
          EPL
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-16 animate-pulse bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No match results available for {selectedLeague}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((match) => (
            <Card key={match.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedLeague} - Gameweek {match.gameweek.number} - {formatDate(match.match_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span>{match.home_team}</span>
                  <span className="text-xl px-4">
                    {match.home_score} - {match.away_score}
                  </span>
                  <span>{match.away_team}</span>
                </div>
                {match.venue && (
                  <div className="text-sm text-muted-foreground">
                    Venue: {match.venue}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 