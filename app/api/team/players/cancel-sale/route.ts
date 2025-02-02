import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { teamId, playerId } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Remove the for sale status and price
    const { error } = await supabase
      .from('team_players')
      .update({
        is_for_sale: false,
        sale_price: null
      })
      .eq('team_id', teamId)
      .eq('player_id', playerId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error canceling player sale:', error)
    return NextResponse.json(
      { error: 'Failed to cancel player sale' },
      { status: 500 }
    )
  }
} 