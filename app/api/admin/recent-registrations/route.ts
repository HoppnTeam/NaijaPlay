import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check if user is authenticated and has admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '5')

    // Fetch recent registrations
    const { data: registrations, error: registrationsError } = await supabase
      .from('profiles')
      .select('id, email, full_name, username, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (registrationsError) throw registrationsError

    // For each user, check if they have a team or have joined a league
    const registrationsWithDetails = await Promise.all(
      registrations.map(async (user) => {
        const [
          { count: teamCount },
          { count: leagueCount }
        ] = await Promise.all([
          supabase
            .from('teams')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id),
          supabase
            .from('league_members')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
        ])

        const hasTeam = (teamCount ?? 0) > 0
        const hasJoinedLeague = (leagueCount ?? 0) > 0

        return {
          ...user,
          has_team: hasTeam,
          has_joined_league: hasJoinedLeague,
          status: hasTeam && hasJoinedLeague ? 'active' : hasTeam ? 'pending' : 'inactive'
        }
      })
    )
    
    return NextResponse.json(registrationsWithDetails)
  } catch (error) {
    console.error('Error fetching recent registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent registrations' },
      { status: 500 }
    )
  }
} 