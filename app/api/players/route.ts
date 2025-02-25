import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    const supabase = createRouteHandlerClient({ cookies })

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('players')
      .select('*', { count: 'exact' })
      .eq('is_available', true)
      .order('current_price', { ascending: false })

    if (position && position !== 'all') {
      query = query.eq('position', position)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Add pagination
    query = query.range(offset, offset + pageSize - 1)

    const { data: players, error, count } = await query

    if (error) {
      throw error
    }

    // Transform data to ensure all fields have default values
    const transformedPlayers = players?.map(player => ({
      ...player,
      league: player.league || 'NPFL',
      base_price: player.base_price || player.current_price,
      is_available: player.is_available ?? true,
      minutes_played: player.minutes_played || 0,
      goals_scored: player.goals_scored || 0,
      assists: player.assists || 0,
      clean_sheets: player.clean_sheets || 0,
      goals_conceded: player.goals_conceded || 0,
      own_goals: player.own_goals || 0,
      penalties_saved: player.penalties_saved || 0,
      penalties_missed: player.penalties_missed || 0,
      yellow_cards: player.yellow_cards || 0,
      red_cards: player.red_cards || 0,
      saves: player.saves || 0,
      bonus: player.bonus || 0,
      form_rating: player.form_rating || 0,
      ownership_percent: player.ownership_percent || 0
    }))

    return NextResponse.json({
      players: transformedPlayers,
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page,
      totalPlayers: count
    })
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
} 