'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Fixture {
  id: string
  match_date: string
  home_team: string
  away_team: string
  venue: string
  league: 'NPFL' | 'EPL'
  gameweek: {
    number: number
    league: 'NPFL' | 'EPL'
  }
}

interface MatchScheduleProps {
  teamId: string
}

export function MatchSchedule({ teamId }: MatchScheduleProps) {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeague, setSelectedLeague] = useState<'NPFL' | 'EPL'>('NPFL')
  const supabase = createClient()

  useEffect(() => {
    fetchUpcomingFixtures()
  }, [selectedLeague])

  const fetchUpcomingFixtures = async () => {
    try {
      // Get the current gameweek for the selected league
      const { data: currentGameweek } = await supabase
        .from('gameweeks')
        .select('id')
        .eq('status', 'upcoming')
        .eq('league', selectedLeague)
        .order('start_date', { ascending: true })
        .limit(1)
        .single()

      if (!currentGameweek) return

      // Fetch upcoming fixtures for the current gameweek
      const { data, error } = await supabase
        .from('match_history')
        .select(`
          id,
          match_date,
          home_team,
          away_team,
          venue,
          league,
          gameweek:gameweek_id (
            number,
            league
          )
        `)
        .eq('gameweek_id', currentGameweek.id)
        .eq('status', 'scheduled')
        .eq('league', selectedLeague)
        .order('match_date', { ascending: true })

      if (error) throw error
      
      // Transform the data to match the Fixture type
      const transformedData: Fixture[] = (data || []).map((item: any) => ({
        ...item,
        gameweek: {
          number: item.gameweek[0].number,
          league: item.gameweek[0].league
        }
      }))
      
      setFixtures(transformedData)
    } catch (error) {
      console.error('Error fetching fixtures:', error)
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
      ) : fixtures.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No upcoming fixtures scheduled for {selectedLeague}
        </div>
      ) : (
        <div className="space-y-4">
          {fixtures.map((fixture) => (
            <Card key={fixture.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedLeague} - Gameweek {fixture.gameweek.number}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{formatDate(fixture.match_date)}</span>
                </div>
                <div className="font-semibold">
                  {fixture.home_team} vs {fixture.away_team}
                </div>
                {fixture.venue && (
                  <div className="text-sm text-muted-foreground">
                    Venue: {fixture.venue}
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