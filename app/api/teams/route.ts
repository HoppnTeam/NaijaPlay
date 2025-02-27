import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    
    // Build query
    let query = supabase.from('teams').select('id, name')
    
    // Apply search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    // Execute query with ordering
    const { data, error } = await query.order('name', { ascending: true })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
} 