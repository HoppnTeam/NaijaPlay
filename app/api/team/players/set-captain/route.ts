import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
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
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('user_id', user.id)
      .single()

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 404 }
      )
    }

    // Start a transaction to update captaincy
    const { data: currentCaptain, error: captainError } = await supabase
      .from('team_players')
      .select('player_id')
      .eq('team_id', teamId)
      .eq('is_captain', true)
      .single()

    if (captainError && captainError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to check current captain' },
        { status: 500 }
      )
    }

    // Remove current captain if exists
    if (currentCaptain) {
      const { error: removeError } = await supabase
        .from('team_players')
        .update({ is_captain: false })
        .eq('team_id', teamId)
        .eq('player_id', currentCaptain.player_id)

      if (removeError) {
        return NextResponse.json(
          { error: 'Failed to remove current captain' },
          { status: 500 }
        )
      }
    }

    // Set new captain
    const { error: updateError } = await supabase
      .from('team_players')
      .update({ is_captain: true })
      .eq('team_id', teamId)
      .eq('player_id', playerId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to set new captain' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting captain:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 