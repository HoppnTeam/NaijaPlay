import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PointsService } from '@/lib/services/points-service'
import { Database } from '@/lib/database.types'

export async function POST(request: Request) {
  try {
    const { gameweekId, teamId } = await request.json()
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Verify user has permission to update points
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify team belongs to user
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('user_id', user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 404 }
      )
    }

    const pointsService = new PointsService()
    await pointsService.updateTeamGameweekPoints(teamId, gameweekId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating points:', error)
    return NextResponse.json(
      { error: 'Failed to update points' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameweekId = searchParams.get('gameweekId')
    const teamId = searchParams.get('teamId')

    if (!gameweekId || !teamId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const pointsService = new PointsService()
    const points = await pointsService.calculateTeamGameweekPoints(teamId, gameweekId)

    return NextResponse.json({ points })
  } catch (error) {
    console.error('Error fetching points:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points' },
      { status: 500 }
    )
  }
} 