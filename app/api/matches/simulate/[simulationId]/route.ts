import { NextResponse } from 'next/server'
import { MatchEngine } from '@/lib/game/match-engine'

// Reference to the activeSimulations map from the parent route
// This is a workaround since we can't directly import from the parent route
declare global {
  var activeSimulations: Map<string, {
    match: any;
    engine: MatchEngine;
    interval: NodeJS.Timeout | null;
  }>;
}

export async function GET(
  request: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const { simulationId } = params
    
    if (!simulationId) {
      return NextResponse.json(
        { error: 'Simulation ID is required' },
        { status: 400 }
      )
    }
    
    // Access the global activeSimulations map
    const simulation = global.activeSimulations?.get(simulationId)
    
    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      )
    }
    
    // Return current match state
    return NextResponse.json(simulation.match)
  } catch (error) {
    console.error('Error fetching simulation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch simulation' },
      { status: 500 }
    )
  }
} 