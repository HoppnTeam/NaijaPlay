import { useState, useEffect } from 'react'
import { liveMatchesService } from '@/lib/api-football/services/live-matches'
import { Fixture } from '@/lib/api-football/types'

export function useLiveMatches() {
  const [matches, setMatches] = useState<Fixture[]>([])
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Start updates when component mounts
    liveMatchesService.startUpdates()

    // Subscribe to updates
    const unsubscribe = liveMatchesService.subscribe(({ matches, isLive }) => {
      setMatches(matches)
      setIsLive(isLive)
      setIsLoading(false)
    })

    // Get initial state
    const { matches: initialMatches, isLive: initialIsLive } = liveMatchesService.getMatches()
    setMatches(initialMatches)
    setIsLive(initialIsLive)
    setIsLoading(false)

    // Cleanup
    return () => {
      unsubscribe()
      liveMatchesService.stopUpdates()
    }
  }, [])

  const refresh = async () => {
    try {
      setIsLoading(true)
      await liveMatchesService.refreshMatches()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh matches'))
    } finally {
      setIsLoading(false)
    }
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

  useEffect(() => {
    let isMounted = true

    const fetchMatchDetails = async () => {
      try {
        setIsLoading(true)
        const details = await liveMatchesService.getMatchDetails(fixtureId)
        if (isMounted) {
          setFixture(details)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch match details'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchMatchDetails()

    return () => {
      isMounted = false
    }
  }, [fixtureId])

  return {
    fixture,
    isLoading,
    error,
    refetch: async () => {
      try {
        setIsLoading(true)
        const details = await liveMatchesService.getMatchDetails(fixtureId)
        setFixture(details)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch match details'))
      } finally {
        setIsLoading(false)
      }
    }
  }
} 