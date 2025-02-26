import { useState, useEffect, useCallback } from 'react'
import { Fixture } from '@/lib/api-football/types'
import { toast } from 'sonner'

export function useLiveMatches() {
  const [matches, setMatches] = useState<Fixture[]>([])
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null)

  const fetchMatches = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/matches/live')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch matches')
      }
      
      const data = await response.json()
      setMatches(data.matches)
      setIsLive(data.isLive)
      setError(null)
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch matches'))
      toast.error('Failed to fetch matches')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch matches immediately when component mounts
    fetchMatches()
    
    // Set up interval for live updates
    const interval = setInterval(() => {
      fetchMatches()
    }, 60000) // Update every minute
    
    setUpdateInterval(interval)
    
    // Clean up interval on unmount
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    }
  }, [fetchMatches])

  const refresh = async () => {
    await fetchMatches()
  }

  return {
    matches,
    isLive,
    isLoading,
    error,
    refresh
  }
}

export function useMatchDetails(fixtureId: number) {
  const [fixture, setFixture] = useState<Fixture | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMatchDetails = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/matches/${fixtureId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch match details')
      }
      
      const data = await response.json()
      setFixture(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching match details:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch match details'))
      toast.error('Failed to fetch match details')
    } finally {
      setIsLoading(false)
    }
  }, [fixtureId])

  useEffect(() => {
    fetchMatchDetails()
  }, [fetchMatchDetails])

  return {
    fixture,
    isLoading,
    error,
    refetch: fetchMatchDetails
  }
} 