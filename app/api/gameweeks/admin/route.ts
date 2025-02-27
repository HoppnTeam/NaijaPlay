import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Create a new gameweek
export async function POST(request: Request) {
  try {
    const { number, start_date, end_date, status } = await request.json()
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

    // Validate input
    if (!number || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if gameweek number already exists
    const { data: existingGameweek, error: existingError } = await supabase
      .from('gameweeks')
      .select('id')
      .eq('number', number)
      .single()

    if (existingGameweek) {
      return NextResponse.json(
        { error: `Gameweek ${number} already exists` },
        { status: 409 }
      )
    }

    // Create new gameweek
    const { data, error } = await supabase
      .from('gameweeks')
      .insert({
        number,
        start_date,
        end_date,
        status: status || 'upcoming'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating gameweek:', error)
    return NextResponse.json(
      { error: 'Failed to create gameweek' },
      { status: 500 }
    )
  }
}

// Update an existing gameweek
export async function PATCH(request: Request) {
  try {
    const { id, number, start_date, end_date, status } = await request.json()
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

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Missing gameweek ID' },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updateData: any = {}
    if (number !== undefined) updateData.number = number
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (status !== undefined) updateData.status = status

    // Update gameweek
    const { data, error } = await supabase
      .from('gameweeks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating gameweek:', error)
    return NextResponse.json(
      { error: 'Failed to update gameweek' },
      { status: 500 }
    )
  }
}

// Get all gameweeks (admin view with more details)
export async function GET() {
  try {
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

    // Get all gameweeks with match counts
    const { data: gameweeks, error } = await supabase
      .from('gameweeks')
      .select(`
        *,
        match_history:match_history(count)
      `)
      .order('number', { ascending: true })

    if (error) throw error

    // Format the response
    const formattedGameweeks = gameweeks.map(gameweek => ({
      ...gameweek,
      match_count: gameweek.match_history[0]?.count || 0
    }))

    return NextResponse.json(formattedGameweeks)
  } catch (error) {
    console.error('Error fetching gameweeks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gameweeks' },
      { status: 500 }
    )
  }
}

// Delete a gameweek (admin only)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing gameweek ID' },
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

    // Check if gameweek has matches
    const { data: matches, error: matchesError } = await supabase
      .from('match_history')
      .select('id')
      .eq('gameweek_id', id)
      .limit(1)

    if (matches && matches.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete gameweek with existing matches' },
        { status: 409 }
      )
    }

    // Delete gameweek
    const { error } = await supabase
      .from('gameweeks')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gameweek:', error)
    return NextResponse.json(
      { error: 'Failed to delete gameweek' },
      { status: 500 }
    )
  }
} 