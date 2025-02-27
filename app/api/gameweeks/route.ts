import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  
  // Build query
  let query = supabase.from('gameweeks').select('*')
  
  // Apply filters if provided
  if (status) {
    query = query.eq('status', status)
  }
  
  // Execute query with ordering
  const { data, error } = await query.order('number', { ascending: true })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

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
    if (!body.number || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if gameweek number already exists
    const { data: existingGameweek } = await supabase
      .from('gameweeks')
      .select('id')
      .eq('number', body.number)
      .single()
    
    if (existingGameweek) {
      return NextResponse.json(
        { error: `Gameweek ${body.number} already exists` },
        { status: 409 }
      )
    }
    
    // Insert new gameweek
    const { data, error } = await supabase
      .from('gameweeks')
      .insert({
        number: body.number,
        start_date: body.start_date,
        end_date: body.end_date,
        status: body.status || 'upcoming',
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating gameweek:', error)
    return NextResponse.json(
      { error: 'Failed to create gameweek' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase
      .from('gameweeks')
      .update({ status })
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