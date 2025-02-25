import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { teamId, playerId } = await request.json()

    if (!teamId || !playerId) {
      return NextResponse.json(
        { error: 'Team ID and Player ID are required' },
        { status: 400 }
      )
    }

    // Verify user owns the team
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify team ownership
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('user_id', user.id)
      .single()

    if (teamError) {
      console.error('Error fetching team:', teamError)
      return NextResponse.json(
        { error: 'Failed to verify team ownership' },
        { status: 500 }
      )
    }

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if player exists in team
    const { data: player, error: playerError } = await supabase
      .from('team_players')
      .select('*')
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .single()

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Player not found in team' },
        { status: 404 }
      )
    }

    // Check if player is for sale
    if (player.is_for_sale) {
      return NextResponse.json(
        { error: 'Cannot update captaincy for player that is for sale' },
        { status: 400 }
      )
    }

    // First, remove captain from any existing player
    const { error: updateError } = await supabase
      .from('team_players')
      .update({ is_captain: false })
      .eq('team_id', teamId)
      .eq('is_captain', true)

    if (updateError) {
      console.error('Error resetting captain:', updateError)
      return NextResponse.json(
        { error: 'Failed to update team captaincy' },
        { status: 500 }
      )
    }

    // Then set the new captain
    const { error: captainError } = await supabase
      .from('team_players')
      .update({ is_captain: true })
      .eq('team_id', teamId)
      .eq('player_id', playerId)

    if (captainError) {
      console.error('Error setting captain:', captainError)
      return NextResponse.json(
        { error: 'Failed to set team captain' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully updated team captain'
    })

  } catch (error) {
    console.error('Error in captaincy update:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 