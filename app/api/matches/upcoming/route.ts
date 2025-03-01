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

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    
    // Calculate date range for upcoming fixtures (next 14 days)
    const today = new Date()
    const twoWeeksLater = new Date(today)
    twoWeeksLater.setDate(today.getDate() + 14)
    
    const fromDate = today.toISOString().split('T')[0]
    const toDate = twoWeeksLater.toISOString().split('T')[0]
    
    // Get current season
    const currentYear = today.getFullYear()
    const season = today.getMonth() > 6 ? currentYear : currentYear - 1
    
    // Fetch upcoming fixtures
    const fixturesUrl = `${API_FOOTBALL_URL}/fixtures?season=${season}&league=${LEAGUE_IDS.join('-')}&from=${fromDate}&to=${toDate}&status=NS`
    console.log('GET /api/matches/upcoming - Fetching fixtures from:', fixturesUrl)
    
    const fixturesResponse = await fetch(
      fixturesUrl,
      {
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )
    
    if (!fixturesResponse.ok) {
      const errorText = await fixturesResponse.text()
      console.error('API Football request failed:', errorText)
      
      // Return mock data on API error
      console.log('GET /api/matches/upcoming - API error, using mock data')
      return NextResponse.json({
        fixtures: MOCK_FIXTURES
      })
    }
    
    const fixturesData = await fixturesResponse.json()
    const fixtures = fixturesData.response || []
    console.log('GET /api/matches/upcoming - Found', fixtures.length, 'upcoming fixtures')
    
    return NextResponse.json({
      fixtures
    })
  } catch (error) {
    console.error('Error in GET /api/matches/upcoming:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 