import { useState, useEffect } from 'react'
import { statisticsService } from '@/lib/api-football/services/statistics'
import { TeamStatistics, LeagueStanding, Player } from '@/lib/api-football/types'

// Hook for all statistics
export function useStatistics() {
  const [data, setData] = useState<{
    teamStatistics: Record<number, TeamStatistics>,
    leagueStandings: Record<number, LeagueStanding>,
    playerStatistics: Record<number, Player[]>,
    isLoading: boolean
  }>({
    teamStatistics: {},
    leagueStandings: {},
    playerStatistics: {},
    isLoading: true
  })

  useEffect(() => {
    // Start the statistics service updates
    statisticsService.startUpdates()

    // Subscribe to updates
    const unsubscribe = statisticsService.subscribe(setData)

    // Initial data fetch
    const fetchData = async () => {
      try {
        const response = await fetch('/api/statistics')
        if (!response.ok) throw new Error('Failed to fetch statistics')
        
        const data = await response.json()
        setData({
          teamStatistics: data.teamStatistics || {},
          leagueStandings: data.leagueStandings || {},
          playerStatistics: data.playerStatistics || {},
          isLoading: false
        })
      } catch (error) {
        console.error('Error fetching statistics:', error)
        setData(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchData()

    // Cleanup
    return () => {
      unsubscribe()
      statisticsService.stopUpdates()
    }
  }, [])

  return data
}

// Hook for team statistics
export function useTeamStatistics(teamId: number) {
  const [data, setData] = useState<{
    statistics: TeamStatistics | null,
    isLoading: boolean
  }>({
    statistics: null,
    isLoading: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/statistics?type=team&teamId=${teamId}`)
        if (!response.ok) throw new Error('Failed to fetch team statistics')
        
        const data = await response.json()
        setData({
          statistics: data.teamStatistics || null,
          isLoading: false
        })
      } catch (error) {
        console.error(`Error fetching team statistics for team ${teamId}:`, error)
        setData({ statistics: null, isLoading: false })
      }
    }

    fetchData()
  }, [teamId])

  return data
}

// Hook for league standings
export function useLeagueStandings(leagueId: number) {
  const [data, setData] = useState<{
    standings: LeagueStanding | null,
    isLoading: boolean
  }>({
    standings: null,
    isLoading: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/statistics?type=league&leagueId=${leagueId}`)
        if (!response.ok) throw new Error('Failed to fetch league standings')
        
        const data = await response.json()
        setData({
          standings: data.leagueStandings || null,
          isLoading: false
        })
      } catch (error) {
        console.error(`Error fetching league standings for league ${leagueId}:`, error)
        setData({ standings: null, isLoading: false })
      }
    }

    fetchData()
  }, [leagueId])

  return data
}

// Hook for player statistics
export function usePlayerStatistics(teamId: number) {
  const [data, setData] = useState<{
    players: Player[],
    isLoading: boolean
  }>({
    players: [],
    isLoading: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/statistics?type=player&teamId=${teamId}`)
        if (!response.ok) throw new Error('Failed to fetch player statistics')
        
        const data = await response.json()
        setData({
          players: data.playerStatistics || [],
          isLoading: false
        })
      } catch (error) {
        console.error(`Error fetching player statistics for team ${teamId}:`, error)
        setData({ players: [], isLoading: false })
      }
    }

    fetchData()
  }, [teamId])

  return data
} 