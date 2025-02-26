import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { MatchEngine } from '@/lib/game/match-engine'
import type { Database } from '@/lib/database.types'

// Define a global type for the activeSimulations map
declare global {
  var activeSimulations: Map<string, {
    match: any;
    engine: MatchEngine;
    interval: NodeJS.Timeout | null;
  }>;
}

// Initialize the global map for active simulations
global.activeSimulations = global.activeSimulations || new Map();
const activeSimulations = global.activeSimulations;

export async function POST(request: Request) {
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
    
    // Parse request body
    const body = await request.json()
    const { homeTeamId, awayTeamId } = body
    
    if (!homeTeamId || !awayTeamId) {
      return NextResponse.json(
        { error: 'Home team ID and away team ID are required' },
        { status: 400 }
      )
    }
    
    // Fetch home team with players
    const { data: homeTeam, error: homeTeamError } = await supabase
      .from('teams')
      .select(`
        id, 
        name,
        team_players!inner(
          player_id,
          players(
            id, 
            name, 
            position,
            form_rating
          )
        )
      `)
      .eq('id', homeTeamId)
      .single()
    
    if (homeTeamError || !homeTeam) {
      console.error('Error fetching home team:', homeTeamError)
      return NextResponse.json(
        { error: 'Failed to fetch home team' },
        { status: 500 }
      )
    }
    
    // Fetch away team with players
    const { data: awayTeam, error: awayTeamError } = await supabase
      .from('teams')
      .select(`
        id, 
        name,
        team_players!inner(
          player_id,
          players(
            id, 
            name, 
            position,
            form_rating
          )
        )
      `)
      .eq('id', awayTeamId)
      .single()
    
    if (awayTeamError || !awayTeam) {
      console.error('Error fetching away team:', awayTeamError)
      return NextResponse.json(
        { error: 'Failed to fetch away team' },
        { status: 500 }
      )
    }
    
    // Format teams for the match engine
    const formattedHomeTeam = {
      id: homeTeam.id,
      name: homeTeam.name,
      players: homeTeam.team_players.map((tp: any) => ({
        id: tp.players.id,
        name: tp.players.name,
        position: tp.players.position,
        attributes: {
          pace: Math.floor(Math.random() * 30) + 70, // Random attributes between 70-99
          shooting: Math.floor(Math.random() * 30) + 70,
          passing: Math.floor(Math.random() * 30) + 70,
          dribbling: Math.floor(Math.random() * 30) + 70,
          defending: Math.floor(Math.random() * 30) + 70,
          physical: Math.floor(Math.random() * 30) + 70
        }
      }))
    }
    
    const formattedAwayTeam = {
      id: awayTeam.id,
      name: awayTeam.name,
      players: awayTeam.team_players.map((tp: any) => ({
        id: tp.players.id,
        name: tp.players.name,
        position: tp.players.position,
        attributes: {
          pace: Math.floor(Math.random() * 30) + 70,
          shooting: Math.floor(Math.random() * 30) + 70,
          passing: Math.floor(Math.random() * 30) + 70,
          dribbling: Math.floor(Math.random() * 30) + 70,
          defending: Math.floor(Math.random() * 30) + 70,
          physical: Math.floor(Math.random() * 30) + 70
        }
      }))
    }
    
    // Create a unique ID for this simulation
    const simulationId = uuidv4()
    
    // Initialize the match engine
    const matchEngine = new MatchEngine(formattedHomeTeam, formattedAwayTeam)
    
    // Define initial match state
    const initialMatchState = {
      id: simulationId,
      homeTeam: {
        id: formattedHomeTeam.id,
        name: formattedHomeTeam.name
      },
      awayTeam: {
        id: formattedAwayTeam.id,
        name: formattedAwayTeam.name
      },
      homeScore: 0,
      awayScore: 0,
      status: 'not_started',
      currentMinute: 0,
      events: [],
      playerPerformances: []
    }
    
    // Store the simulation data
    activeSimulations.set(simulationId, {
      match: initialMatchState,
      engine: matchEngine,
      interval: null
    })
    
    // Start the simulation after a short delay
    setTimeout(() => {
      try {
        startSimulation(simulationId)
      } catch (error) {
        console.error('Error starting simulation:', error)
      }
    }, 1000)
    
    // Return the initial match state
    return NextResponse.json(initialMatchState)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

function startSimulation(simulationId: string) {
  const simulation = activeSimulations.get(simulationId)
  if (!simulation) return
  
  // Update match status to in_progress
  simulation.match.status = 'in_progress'
  
  // Set up an interval to simulate the match minute by minute
  simulation.interval = setInterval(() => {
    try {
      // Get the current match state
      const { match, engine } = simulation
      
      // Simulate a minute
      const events = engine.simulateMinute()
      
      // Update match state from engine
      const updatedState = engine.getMatchState()
      match.currentMinute = updatedState.currentMinute
      match.homeScore = updatedState.homeScore
      match.awayScore = updatedState.awayScore
      match.events = updatedState.events
      match.playerPerformances = updatedState.playerPerformances
      
      // Check if match is complete (90 minutes)
      if (match.currentMinute >= 90) {
        // Clear the interval
        if (simulation.interval) {
          clearInterval(simulation.interval)
          simulation.interval = null
        }
        
        // Update match status to completed
        match.status = 'completed'
        
        // Finalize player ratings
        engine.finalizePlayerRatings()
        
        // Update player performances with final ratings
        match.playerPerformances = engine.getMatchState().playerPerformances
        
        // Save match result to database
        saveMatchResult(match)
      }
    } catch (error) {
      console.error('Error simulating match minute:', error)
      
      // Clear the interval on error
      if (simulation.interval) {
        clearInterval(simulation.interval)
        simulation.interval = null
      }
    }
  }, 1000) // Simulate 1 minute per second
}

async function saveMatchResult(match: any) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Save match to match_history table
    const { data, error } = await supabase
      .from('match_history')
      .insert({
        id: match.id,
        home_team_id: match.homeTeam.id,
        away_team_id: match.awayTeam.id,
        home_score: match.homeScore,
        away_score: match.awayScore,
        match_data: match,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error saving match result:', error)
    } else {
      console.log('Match result saved successfully:', match.id)
    }
  } catch (error) {
    console.error('Error saving match result:', error)
  }
}

export async function GET(request: Request) {
  try {
    // Extract simulation ID from the URL
    const url = new URL(request.url)
    const simulationId = url.searchParams.get('id')
    
    if (!simulationId) {
      return NextResponse.json(
        { error: 'Simulation ID is required' },
        { status: 400 }
      )
    }
    
    // Get the simulation data
    const simulation = activeSimulations.get(simulationId)
    
    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      )
    }
    
    // Return the current match state
    return NextResponse.json(simulation.match)
  } catch (error) {
    console.error('Error fetching simulation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch simulation' },
      { status: 500 }
    )
  }
} 