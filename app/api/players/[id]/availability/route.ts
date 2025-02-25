import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const playerId = params.id

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    // Get player availability status
    const { data: player, error } = await supabase
      .from('players')
      .select('is_available')
      .eq('id', playerId)
      .single()

    if (error) {
      console.error('Error checking player availability:', error)
      return NextResponse.json(
        { error: 'Failed to check player availability' },
        { status: 500 }
      )
    }

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      is_available: player.is_available
    })
  } catch (error) {
    console.error('Error in player availability endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 