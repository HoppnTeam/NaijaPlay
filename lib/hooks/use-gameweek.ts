import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Gameweek {
  id: string
  number: number
  start_date: string
  end_date: string
  status: 'upcoming' | 'in_progress' | 'completed'
}

interface LeaderboardEntry {
  team_id: string
  total_points: number
  captain_points: number
  teams: {
    name: string
    profiles: {
      full_name: string | null
    } | null
  } | null
}

export function useGameweek() {
  const [currentGameweek, setCurrentGameweek] = useState<Gameweek | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchGameweekData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/gameweeks')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch gameweek data')
        }

        setCurrentGameweek(data.gameweek)
        setLeaderboard(data.leaderboard || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch gameweek data'))
      } finally {
        setLoading(false)
      }
    }

    fetchGameweekData()

    // Subscribe to gameweek updates
    const supabase = createClient()
    const channel = supabase
      .channel('gameweek_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gameweeks'
        },
        () => {
          fetchGameweekData()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const updateGameweekStatus = async (status: 'upcoming' | 'in_progress' | 'completed') => {
    if (!currentGameweek) return

    try {
      const response = await fetch('/api/gameweeks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentGameweek.id,
          status
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update gameweek status')
      }

      setCurrentGameweek(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update gameweek status'))
    }
  }

  return {
    currentGameweek,
    leaderboard,
    loading,
    error,
    updateGameweekStatus
  }
} 