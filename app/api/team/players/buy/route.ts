import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { teamId, playerId } = await request.json()
    
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user owns the team
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get team details
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

    // Check squad size limit
    const { count: squadSize, error: countError } = await supabase
      .from('team_players')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)

    if (countError) {
      return NextResponse.json(
        { error: 'Error checking squad size' },
        { status: 500 }
      )
    }

    if (squadSize && squadSize >= 25) {
      return NextResponse.json(
        { error: 'Squad size limit reached (max: 25 players)' },
        { status: 400 }
      )
    }

    // Check if player is already in the team
    const { data: existingPlayer, error: existingError } = await supabase
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

    // Execute the buy_player function
    const { data: result, error: transferError } = await supabase.rpc('buy_player', {
      p_team_id: teamId,
      p_player_id: playerId,
      p_price: player.current_price
    })

    if (transferError) {
      return NextResponse.json(
        { error: transferError.message },
        { status: 500 }
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Update team's total value
    await supabase
      .from('teams')
      .update({
        total_value: supabase.rpc('calculate_team_value', { p_team_id: teamId })
      })
      .eq('id', teamId)

    return NextResponse.json({
      success: true,
      message: result.message,
      newBudget: result.new_budget
    })

  } catch (error) {
    console.error('Error in buy player endpoint:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete transfer' },
      { status: 500 }
    )
  }
} 