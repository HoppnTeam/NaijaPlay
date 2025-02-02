import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { playerId: string; action: string } }
) {
  try {
    const { playerId, action } = params
    const { teamId } = await request.json()

    const supabase = createRouteHandlerClient({ cookies })

    // Verify user owns the team
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .eq('user_id', user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 404 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'captain':
        // Remove current captain
        await supabase
          .from('team_players')
          .update({ is_captain: false })
          .eq('team_id', teamId)
          .eq('is_captain', true)

        // Set new captain
        await supabase
          .from('team_players')
          .update({ is_captain: true, is_vice_captain: false })
          .eq('team_id', teamId)
          .eq('player_id', playerId)
        break

      case 'vice-captain':
        // Remove current vice-captain
        await supabase
          .from('team_players')
          .update({ is_vice_captain: false })
          .eq('team_id', teamId)
          .eq('is_vice_captain', true)

        // Set new vice-captain
        await supabase
          .from('team_players')
          .update({ is_vice_captain: true, is_captain: false })
          .eq('team_id', teamId)
          .eq('player_id', playerId)
        break

      case 'sale':
        // Toggle for_sale status
        const { data: currentPlayer } = await supabase
          .from('team_players')
          .select('for_sale')
          .eq('team_id', teamId)
          .eq('player_id', playerId)
          .single()

        await supabase
          .from('team_players')
          .update({ for_sale: !currentPlayer?.for_sale })
          .eq('team_id', teamId)
          .eq('player_id', playerId)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    )
  }
} 