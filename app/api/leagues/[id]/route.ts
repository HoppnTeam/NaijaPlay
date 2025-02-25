import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { apiCache } from '@/lib/server-cache'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leagueId = params.id
    
    // Try to get from cache first
    const cacheKey = `league_${leagueId}`
    const cachedData = apiCache.has(cacheKey)
    if (cachedData) {
      return NextResponse.json(await apiCache.get(cacheKey, async () => ({})))
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    const [leagueResponse, teamsResponse] = await Promise.all([
      supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single(),
      supabase
        .from('league_teams')
        .select(`
          *,
          teams (*)
        `)
        .eq('league_id', leagueId)
    ])

    if (leagueResponse.error) throw leagueResponse.error
    if (teamsResponse.error) throw teamsResponse.error

    // Calculate standings
    const standings = teamsResponse.data.map(lt => ({
      position: 0,
      team_name: lt.teams.name,
      played: lt.matches_played,
      won: lt.matches_won,
      drawn: lt.matches_drawn,
      lost: lt.matches_lost,
      points: (lt.matches_won * 3) + lt.matches_drawn
    }))
    .sort((a, b) => b.points - a.points)
    .map((team, index) => ({ ...team, position: index + 1 }))

    const data = {
      league: leagueResponse.data,
      teams: teamsResponse.data,
      standings
    }

    // Cache the result
    apiCache.set(cacheKey, data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching league:', error)
    return NextResponse.json(
      { error: 'Failed to fetch league data' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leagueId = params.id
    const { name } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase
      .from('leagues')
      .update({ name })
      .eq('id', leagueId)

    if (error) throw error

    // Clear cache to reflect changes
    apiCache.del(`league_${leagueId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating league:', error)
    return NextResponse.json(
      { error: 'Failed to update league' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leagueId = params.id
    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase
      .from('leagues')
      .delete()
      .eq('id', leagueId)

    if (error) throw error

    // Clear cache after deletion
    apiCache.del(`league_${leagueId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting league:', error)
    return NextResponse.json(
      { error: 'Failed to delete league' },
      { status: 500 }
    )
  }
} 