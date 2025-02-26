import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

// API Football configuration
const API_FOOTBALL_URL = 'https://v3.football.api-sports.io'

export async function GET(
  request: Request,
  { params }: { params: { fixtureId: string } }
) {
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
    
    const { fixtureId } = params
    
    if (!fixtureId) {
      return NextResponse.json(
        { error: 'Fixture ID is required' },
        { status: 400 }
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
    
    // Fetch fixture details
    const fixtureResponse = await fetch(
      `${API_FOOTBALL_URL}/fixtures?id=${fixtureId}`,
      {
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    )
    
    if (!fixtureResponse.ok) {
      console.error('API Football request failed:', await fixtureResponse.text())
      return NextResponse.json(
        { error: 'Failed to fetch fixture details from API' },
        { status: 500 }
      )
    }
    
    const fixtureData = await fixtureResponse.json()
    const fixture = fixtureData.response?.[0] || null
    
    if (!fixture) {
      return NextResponse.json(
        { error: 'Fixture not found' },
        { status: 404 }
      )
    }
    
    // Fetch fixture events
    const eventsResponse = await fetch(
      `${API_FOOTBALL_URL}/fixtures/events?fixture=${fixtureId}`,
      {
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    )
    
    if (!eventsResponse.ok) {
      console.error('API Football events request failed:', await eventsResponse.text())
      // Continue without events
    } else {
      const eventsData = await eventsResponse.json()
      fixture.events = eventsData.response || []
    }
    
    // Fetch fixture lineups
    const lineupsResponse = await fetch(
      `${API_FOOTBALL_URL}/fixtures/lineups?fixture=${fixtureId}`,
      {
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    )
    
    if (!lineupsResponse.ok) {
      console.error('API Football lineups request failed:', await lineupsResponse.text())
      // Continue without lineups
    } else {
      const lineupsData = await lineupsResponse.json()
      fixture.lineups = lineupsData.response || []
    }
    
    // Fetch fixture statistics
    const statisticsResponse = await fetch(
      `${API_FOOTBALL_URL}/fixtures/statistics?fixture=${fixtureId}`,
      {
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    )
    
    if (!statisticsResponse.ok) {
      console.error('API Football statistics request failed:', await statisticsResponse.text())
      // Continue without statistics
    } else {
      const statisticsData = await statisticsResponse.json()
      fixture.statistics = statisticsData.response || []
    }
    
    return NextResponse.json(fixture)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 