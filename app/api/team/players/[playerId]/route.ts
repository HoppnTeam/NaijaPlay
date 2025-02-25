import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { playerId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { teamId } = await request.json()
    const playerId = params.playerId
    const path = request.url
    const action = path.split('/').pop()

    // Verify team ownership
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('user_id', user.id)
      .single()

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found or unauthorized' },
        { status: 404 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'captain': {
        // First, remove captain status from any existing captain
        await supabase
          .from('team_players')
          .update({ is_captain: false })
          .eq('team_id', teamId)
          .eq('is_captain', true)

        // Then set the new captain
        const { error } = await supabase
          .from('team_players')
          .update({ 
            is_captain: true,
            is_vice_captain: false // Remove vice-captain if becoming captain
          })
          .eq('team_id', teamId)
          .eq('player_id', playerId)

        if (error) throw error
        break
      }

      case 'vice-captain': {
        // First, remove vice-captain status from any existing vice-captain
        await supabase
          .from('team_players')
          .update({ is_vice_captain: false })
          .eq('team_id', teamId)
          .eq('is_vice_captain', true)

        // Then set the new vice-captain
        const { error } = await supabase
          .from('team_players')
          .update({ 
            is_vice_captain: true,
            is_captain: false // Remove captain if becoming vice-captain
          })
          .eq('team_id', teamId)
          .eq('player_id', playerId)

        if (error) throw error
        break
      }

      case 'sale': {
        // Toggle sale status
        const { data: currentPlayer } = await supabase
          .from('team_players')
          .select('is_for_sale')
          .eq('team_id', teamId)
          .eq('player_id', playerId)
          .single()

        const { error } = await supabase
          .from('team_players')
          .update({ is_for_sale: !currentPlayer?.is_for_sale })
          .eq('team_id', teamId)
          .eq('player_id', playerId)

        if (error) throw error
        break
      }

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ message: 'Success' })
  } catch (error) {
    console.error('Error handling player action:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 