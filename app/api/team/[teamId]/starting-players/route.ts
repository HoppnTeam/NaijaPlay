import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// PUT endpoint to update starting players
export async function PUT(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const teamId = params.teamId

    // Verify user owns the team
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify team ownership
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, user_id')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    if (team.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this team' },
        { status: 403 }
      )
    }

    // Get request body
    const { startingPlayerIds } = await request.json()

    if (!Array.isArray(startingPlayerIds)) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected an array of player IDs.' },
        { status: 400 }
      )
    }

    // Validate that we have exactly 11 starting players
    if (startingPlayerIds.length !== 11) {
      return NextResponse.json(
        { error: 'You must select exactly 11 starting players.' },
        { status: 400 }
      )
    }

    // First, set all players to not starting
    const { error: resetError } = await supabase
      .from('team_players')
      .update({ is_starting: false })
      .eq('team_id', teamId)

    if (resetError) {
      console.error('Error resetting starting players:', resetError)
      return NextResponse.json(
        { error: 'Failed to update starting players' },
        { status: 500 }
      )
    }

    // Then set the selected players as starting
    const { error: updateError } = await supabase
      .from('team_players')
      .update({ is_starting: true })
      .eq('team_id', teamId)
      .in('player_id', startingPlayerIds)

    if (updateError) {
      console.error('Error updating starting players:', updateError)
      return NextResponse.json(
        { error: 'Failed to update starting players' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Starting players updated successfully'
    })
  } catch (error) {
    console.error('Error in starting players endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 