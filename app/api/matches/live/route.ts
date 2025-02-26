import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'
import { MOCK_FIXTURES } from '@/lib/api-football/mock-data'

// API Football configuration
const API_FOOTBALL_URL = 'https://v3.football.api-sports.io'
const LEAGUE_IDS = [
  39,  // English Premier League
  332  // Nigerian Premier League
]

// Flag to use mock data (set to true for development)
const USE_MOCK_DATA = true

export async function GET() {
  try {
    console.log('GET /api/matches/live - Starting request')
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('GET /api/matches/live - Unauthorized user')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // If using mock data, return it immediately
    if (USE_MOCK_DATA) {
      console.log('GET /api/matches/live - Using mock data')
      return NextResponse.json({
        matches: MOCK_FIXTURES,
        isLive: false
      })
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
    
    console.log('GET /api/matches/live - Using API key:', apiKey.substring(0, 5) + '...')
    
    // Get current season
    const now = new Date()
    const season = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
    console.log('GET /api/matches/live - Using season:', season)
    
    // First try to get live matches
    const liveMatchesUrl = `${API_FOOTBALL_URL}/fixtures?live=all&season=${season}&league=${LEAGUE_IDS.join('-')}`
    console.log('GET /api/matches/live - Fetching live matches from:', liveMatchesUrl)
    
    const liveMatchesResponse = await fetch(
      liveMatchesUrl,
      {
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    )
    
    if (!liveMatchesResponse.ok) {
      const errorText = await liveMatchesResponse.text()
      console.error('API Football request failed:', errorText)
      
      // Return mock data on API error
      console.log('GET /api/matches/live - API error, using mock data')
      return NextResponse.json({
        matches: MOCK_FIXTURES,
        isLive: false
      })
    }
    
    const liveMatchesData = await liveMatchesResponse.json()
    const liveMatches = liveMatchesData.response || []
    console.log('GET /api/matches/live - Found', liveMatches.length, 'live matches')
    
    // If we have live matches, return them
    if (liveMatches.length > 0) {
      return NextResponse.json({
        matches: liveMatches,
        isLive: true
      })
    }
    
    // If no live matches, get upcoming matches for next 3 days
    const today = new Date()
    const threeDaysLater = new Date(today)
    threeDaysLater.setDate(today.getDate() + 3)
    
    const fromDate = today.toISOString().split('T')[0]
    const toDate = threeDaysLater.toISOString().split('T')[0]
    
    const upcomingMatchesUrl = `${API_FOOTBALL_URL}/fixtures?season=${season}&league=${LEAGUE_IDS.join('-')}&from=${fromDate}&to=${toDate}`
    console.log('GET /api/matches/live - Fetching upcoming matches from:', upcomingMatchesUrl)
    
    const upcomingMatchesResponse = await fetch(
      upcomingMatchesUrl,
      {
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )
    
    if (!upcomingMatchesResponse.ok) {
      const errorText = await upcomingMatchesResponse.text()
      console.error('API Football request failed:', errorText)
      
      // Return mock data on API error
      console.log('GET /api/matches/live - API error, using mock data')
      return NextResponse.json({
        matches: MOCK_FIXTURES,
        isLive: false
      })
    }
    
    const upcomingMatchesData = await upcomingMatchesResponse.json()
    const upcomingMatches = upcomingMatchesData.response || []
    console.log('GET /api/matches/live - Found', upcomingMatches.length, 'upcoming matches')
    
    // If no upcoming matches, return mock data
    if (upcomingMatches.length === 0) {
      console.log('GET /api/matches/live - No upcoming matches, using mock data')
      return NextResponse.json({
        matches: MOCK_FIXTURES,
        isLive: false
      })
    }
    
    return NextResponse.json({
      matches: upcomingMatches,
      isLive: false
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    
    // Return mock data on any error
    console.log('GET /api/matches/live - Unexpected error, using mock data')
    return NextResponse.json({
      matches: MOCK_FIXTURES,
      isLive: false
    })
  }
} 