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

    return NextResponse.json({
      players,
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