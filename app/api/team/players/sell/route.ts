import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface PlayerData {
  player: {
    current_price: number
  }
}

export async function POST(request: Request) {
  try {
    const { teamId, playerId, price } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Verify the player belongs to the team and get current price
    const { data: rawPlayerData, error: playerError } = await supabase
      .from('team_players')
      .select('player:players(current_price)')
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .single()

    if (playerError || !rawPlayerData) {
      return NextResponse.json(
        { error: 'Player not found in team' },
        { status: 404 }
      )
    }

    // Cast the data to our known type
    const playerData = {
      player: {
        current_price: (rawPlayerData.player as any).current_price as number
      }
    }

    // Ensure sale price is not less than current market value
    if (price < playerData.player.current_price) {
      return NextResponse.json(
        { error: 'Sale price cannot be less than current market value' },
        { status: 400 }
      )
    }

    // Update player status to for sale
    const { error } = await supabase
      .from('team_players')
      .update({
        is_for_sale: true,
        sale_price: price
      })
      .eq('team_id', teamId)
      .eq('player_id', playerId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error putting player for sale:', error)
    return NextResponse.json(
      { error: 'Failed to put player for sale' },
      { status: 500 }
    )
  }
} 