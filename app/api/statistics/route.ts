import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'
import { MOCK_TEAM_STATISTICS, MOCK_LEAGUE_STANDINGS, MOCK_PLAYER_STATISTICS } from '@/lib/api-football/mock-statistics'

// API Football configuration
const API_FOOTBALL_URL = 'https://v3.football.api-sports.io'
const LEAGUE_IDS = [
  39,  // English Premier League
  332  // Nigerian Premier League
]

// Flag to use mock data (set to true for development)
const USE_MOCK_DATA = true

export async function GET(request: Request) {
  try {
    console.log('GET /api/statistics - Starting request')
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('GET /api/statistics - Unauthorized user')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse query parameters
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'all'
    const teamId = url.searchParams.get('teamId') ? parseInt(url.searchParams.get('teamId')!) : null
    const leagueId = url.searchParams.get('leagueId') ? parseInt(url.searchParams.get('leagueId')!) : null
    
    console.log(`GET /api/statistics - Type: ${type}, TeamID: ${teamId}, LeagueID: ${leagueId}`)
    
    // If using mock data, return it immediately
    if (USE_MOCK_DATA) {
      console.log('GET /api/statistics - Using mock data')
      
      // Return specific data based on query parameters
      if (type === 'team' && teamId) {
        return NextResponse.json({
          teamStatistics: MOCK_TEAM_STATISTICS[teamId] || null
        })
      } else if (type === 'league' && leagueId) {
        return NextResponse.json({
          leagueStandings: MOCK_LEAGUE_STANDINGS[leagueId] || null
        })
      } else if (type === 'player' && teamId) {
        return NextResponse.json({
          playerStatistics: MOCK_PLAYER_STATISTICS[teamId] || []
        })
      } else {
        // Return all data
        return NextResponse.json({
          teamStatistics: MOCK_TEAM_STATISTICS,
          leagueStandings: MOCK_LEAGUE_STANDINGS,
          playerStatistics: MOCK_PLAYER_STATISTICS
        })
      }
    }
    
    // Get API key from environment variables
    const apiKey = process.env.API_FOOTBALL_KEY
    if (!apiKey) {
      console.error('API Football key not found in environment variables')
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }
    
    console.log('GET /api/statistics - Using API key:', apiKey.substring(0, 5) + '...')
    
    // Get current season
    const now = new Date()
    const season = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
    console.log('GET /api/statistics - Using season:', season)
    
    // In a real implementation, we would fetch data from the API
    // For now, we'll just use mock data
    
    // Return specific data based on query parameters
    if (type === 'team' && teamId) {
      return NextResponse.json({
        teamStatistics: MOCK_TEAM_STATISTICS[teamId] || null
      })
    } else if (type === 'league' && leagueId) {
      return NextResponse.json({
        leagueStandings: MOCK_LEAGUE_STANDINGS[leagueId] || null
      })
    } else if (type === 'player' && teamId) {
      return NextResponse.json({
        playerStatistics: MOCK_PLAYER_STATISTICS[teamId] || []
      })
    } else {
      // Return all data
      return NextResponse.json({
        teamStatistics: MOCK_TEAM_STATISTICS,
        leagueStandings: MOCK_LEAGUE_STANDINGS,
        playerStatistics: MOCK_PLAYER_STATISTICS
      })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    
    // Return mock data on any error
    console.log('GET /api/statistics - Unexpected error, using mock data')
    return NextResponse.json({
      teamStatistics: MOCK_TEAM_STATISTICS,
      leagueStandings: MOCK_LEAGUE_STANDINGS,
      playerStatistics: MOCK_PLAYER_STATISTICS
    })
  }
} 