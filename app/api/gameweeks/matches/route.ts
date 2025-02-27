import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Get matches for a specific gameweek
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const gameweekId = searchParams.get('gameweek_id')
  
  if (!gameweekId) {
    return NextResponse.json(
      { error: 'Gameweek ID is required' },
      { status: 400 }
    )
  }
  
  // Fetch matches for the gameweek
  const { data, error } = await supabase
    .from('match_history')
    .select(`
      *,
      home_team:teams!match_history_home_team_id_fkey (id, name),
      away_team:teams!match_history_away_team_id_fkey (id, name)
    `)
    .eq('gameweek_id', gameweekId)
    .order('match_date', { ascending: true })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

// Create a new match for a gameweek
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check if user is authenticated and has admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.gameweek_id || !body.home_team_id || !body.away_team_id || !body.match_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if teams are different
    if (body.home_team_id === body.away_team_id) {
      return NextResponse.json(
        { error: 'Home team and away team must be different' },
        { status: 400 }
      )
    }
    
    // Check if gameweek exists
    const { data: gameweek, error: gameweekError } = await supabase
      .from('gameweeks')
      .select('id')
      .eq('id', body.gameweek_id)
      .single()
    
    if (gameweekError || !gameweek) {
      return NextResponse.json(
        { error: 'Gameweek not found' },
        { status: 404 }
      )
    }
    
    // Insert new match
    const { data, error } = await supabase
      .from('match_history')
      .insert({
        gameweek_id: body.gameweek_id,
        home_team_id: body.home_team_id,
        away_team_id: body.away_team_id,
        match_date: body.match_date,
        status: body.status || 'scheduled',
        home_score: body.home_score || 0,
        away_score: body.away_score || 0,
      })
      .select(`
        *,
        home_team:teams!match_history_home_team_id_fkey (id, name),
        away_team:teams!match_history_away_team_id_fkey (id, name)
      `)
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    )
  }
}

// Update a match
export async function PATCH(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check if user is authenticated and has admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.id || !body.gameweek_id || !body.home_team_id || !body.away_team_id || !body.match_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if teams are different
    if (body.home_team_id === body.away_team_id) {
      return NextResponse.json(
        { error: 'Home team and away team must be different' },
        { status: 400 }
      )
    }
    
    // Check if match exists
    const { data: match, error: matchError } = await supabase
      .from('match_history')
      .select('id')
      .eq('id', body.id)
      .single()
    
    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }
    
    // Update match
    const { data, error } = await supabase
      .from('match_history')
      .update({
        gameweek_id: body.gameweek_id,
        home_team_id: body.home_team_id,
        away_team_id: body.away_team_id,
        match_date: body.match_date,
        status: body.status,
        home_score: body.home_score || 0,
        away_score: body.away_score || 0,
      })
      .eq('id', body.id)
      .select(`
        *,
        home_team:teams!match_history_home_team_id_fkey (id, name),
        away_team:teams!match_history_away_team_id_fkey (id, name)
      `)
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    )
  }
}

// Delete a match
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing match ID' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Check if match is in progress or completed
    const { data: match, error: matchError } = await supabase
      .from('match_history')
      .select('status')
      .eq('id', id)
      .single()

    if (match && (match.status === 'in_progress' || match.status === 'completed')) {
      return NextResponse.json(
        { error: 'Cannot delete matches that are in progress or completed' },
        { status: 409 }
      )
    }

    // Delete match
    const { error } = await supabase
      .from('match_history')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json(
      { error: 'Failed to delete match' },
      { status: 500 }
    )
  }
} 