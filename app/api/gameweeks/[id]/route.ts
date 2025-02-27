import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Fetch gameweek details
  const { data: gameweek, error } = await supabase
    .from('gameweeks')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  if (!gameweek) {
    return NextResponse.json({ error: 'Gameweek not found' }, { status: 404 })
  }
  
  return NextResponse.json(gameweek)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!body.number || !body.start_date || !body.end_date || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if gameweek exists
    const { data: existingGameweek, error: fetchError } = await supabase
      .from('gameweeks')
      .select('id')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !existingGameweek) {
      return NextResponse.json(
        { error: 'Gameweek not found' },
        { status: 404 }
      )
    }
    
    // Check if number is already used by another gameweek
    if (body.number) {
      const { data: duplicateNumber } = await supabase
        .from('gameweeks')
        .select('id')
        .eq('number', body.number)
        .neq('id', params.id)
        .single()
      
      if (duplicateNumber) {
        return NextResponse.json(
          { error: `Gameweek number ${body.number} is already in use` },
          { status: 409 }
        )
      }
    }
    
    // Update gameweek
    const { data, error } = await supabase
      .from('gameweeks')
      .update({
        number: body.number,
        start_date: body.start_date,
        end_date: body.end_date,
        status: body.status,
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating gameweek:', error)
    return NextResponse.json(
      { error: 'Failed to update gameweek' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // Check if gameweek has associated matches
    const { count, error: countError } = await supabase
      .from('match_history')
      .select('id', { count: 'exact', head: true })
      .eq('gameweek_id', params.id)
    
    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }
    
    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete gameweek with associated matches' },
        { status: 409 }
      )
    }
    
    // Delete gameweek
    const { error } = await supabase
      .from('gameweeks')
      .delete()
      .eq('id', params.id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gameweek:', error)
    return NextResponse.json(
      { error: 'Failed to delete gameweek' },
      { status: 500 }
    )
  }
} 