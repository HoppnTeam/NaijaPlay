import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get all players
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('*')

    if (playersError) {
      console.error('Error fetching players:', playersError)
      return NextResponse.json(
        { error: 'Failed to fetch players' },
        { status: 500 }
      )
    }

    // Get count by position
    const positionCounts = allPlayers?.reduce((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      total: allPlayers?.length || 0,
      byPosition: positionCounts,
      players: allPlayers
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 