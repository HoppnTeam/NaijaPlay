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

    // Handle different actions
    switch (action) {
      case 'captain': {
        // First, remove captain status from any existing captain
        const { error: removeError } = await supabase
          .from('team_players')
          .update({ is_captain: false })
          .eq('team_id', teamId)
          .eq('is_captain', true)

        if (removeError) {
          console.error('Error removing existing captain:', removeError)
          throw removeError
        }

        // Then set new captain
        const { error: updateError } = await supabase
          .from('team_players')
          .update({ 
            is_captain: true,
            is_vice_captain: false // Remove vice-captain if becoming captain
          })
          .eq('team_id', teamId)
          .eq('player_id', playerId)

        if (updateError) {
          console.error('Error setting new captain:', updateError)
          throw updateError
        }
        break
      }

      case 'vice-captain': {
        // First, remove vice-captain status from any existing vice-captain
        const { error: removeError } = await supabase
          .from('team_players')
          .update({ is_vice_captain: false })
          .eq('team_id', teamId)
          .eq('is_vice_captain', true)

        if (removeError) {
          console.error('Error removing existing vice-captain:', removeError)
          throw removeError
        }

        // Then set new vice-captain
        const { error: updateError } = await supabase
          .from('team_players')
          .update({ 
            is_vice_captain: true,
            is_captain: false // Remove captain if becoming vice-captain
          })
          .eq('team_id', teamId)
          .eq('player_id', playerId)

        if (updateError) {
          console.error('Error setting new vice-captain:', updateError)
          throw updateError
        }
        break
      }

      case 'sale':
        // Toggle sale status
        const { data: currentPlayer } = await supabase
          .from('team_players')
          .select('is_for_sale')
          .eq('team_id', teamId)
          .eq('player_id', playerId)
          .single()

        await supabase
          .from('team_players')
          .update({ 
            is_for_sale: !(currentPlayer?.is_for_sale ?? false)
          })
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
    console.error('Error updating player status:', error)
    return NextResponse.json(
      { error: 'Failed to update player status' },
      { status: 500 }
    )
  }
} 