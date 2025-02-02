import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { teamId, playerId } = await request.json()

    const supabase = createRouteHandlerClient({ cookies })

    // Verify user owns the team
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Start a transaction
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

    // Get player details
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .eq('is_available', true)
      .single()

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Player not found or not available' },
        { status: 404 }
      )
    }

    // Check if team can afford the player
    if (team.budget < player.current_price) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      )
    }

    // Get current squad size
    const { count: squadSize, error: countError } = await supabase
      .from('team_players')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)

    if (countError) {
      throw countError
    }

    if (squadSize && squadSize >= 25) {
      return NextResponse.json(
        { error: 'Squad size limit reached (max: 25 players)' },
        { status: 400 }
      )
    }

    // Check if player is already in the team
    const { data: existingPlayer } = await supabase
      .from('team_players')
      .select('*')
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .single()

    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Player already in squad' },
        { status: 400 }
      )
    }

    // Perform the transfer
    const { error: transferError } = await supabase.rpc('buy_player', {
      p_team_id: teamId,
      p_player_id: playerId,
      p_price: player.current_price
    })

    if (transferError) {
      throw transferError
    }

    return NextResponse.json({
      success: true,
      message: 'Player successfully added to squad'
    })
  } catch (error) {
    console.error('Error buying player:', error)
    return NextResponse.json(
      { error: 'Failed to complete transfer' },
      { status: 500 }
    )
  }
} 