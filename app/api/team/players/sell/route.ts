import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface PlayerDetails {
  player_id: string
  is_captain: boolean
  is_vice_captain: boolean
  players: {
    current_price: number
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { teamId, playerId, price } = await request.json()

    if (!teamId || !playerId || !price) {
      return NextResponse.json(
        { error: 'Team ID, Player ID, and price are required' },
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

    // Get player details
    const { data: player, error: playerError } = await supabase
      .from('team_players')
      .select(`
        player_id,
        is_captain,
        is_vice_captain,
        players (current_price)
      `)
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .single()

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    const playerDetails = player as unknown as PlayerDetails

    // Don't allow selling captain or vice-captain
    if (playerDetails.is_captain || playerDetails.is_vice_captain) {
      return NextResponse.json(
        { error: 'Cannot sell team captain or vice-captain' },
        { status: 400 }
      )
    }

    // Validate sale price
    const minPrice = Math.floor(playerDetails.players.current_price * 0.5)
    const maxPrice = Math.ceil(playerDetails.players.current_price * 2)

    if (price < minPrice || price > maxPrice) {
      return NextResponse.json(
        { error: `Sale price must be between ${minPrice} and ${maxPrice}` },
        { status: 400 }
      )
    }

    // List player for sale
    const { error: updateError } = await supabase
      .from('team_players')
      .update({
        is_for_sale: true,
        sale_price: price
      })
      .eq('team_id', teamId)
      .eq('player_id', playerId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to list player for sale' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error listing player for sale:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 