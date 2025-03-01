import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // Check if user is authenticated and has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError) throw profileError
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    // Fetch system notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('system_notifications')
      .select(`
        id,
        title,
        message,
        type,
        priority,
        created_at,
        read_at,
        action_url
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (notificationsError) throw notificationsError
    
    // Format the response data
    const formattedNotifications = notifications?.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      createdAt: notification.created_at,
      readAt: notification.read_at,
      actionUrl: notification.action_url
    })) || []
    
    return NextResponse.json(formattedNotifications)
  } catch (error) {
    console.error('Error fetching system notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // Check if user is authenticated and has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError) throw profileError
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.message || !body.type || !body.priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create new notification
    const { data: notification, error: createError } = await supabase
      .from('system_notifications')
      .insert([
        {
          title: body.title,
          message: body.message,
          type: body.type,
          priority: body.priority,
          action_url: body.actionUrl
        }
      ])
      .select()
      .single()
    
    if (createError) throw createError
    
    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error creating system notification:', error)
    return NextResponse.json(
      { error: 'Failed to create system notification' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // Check if user is authenticated and has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError) throw profileError
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get request body
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      )
    }
    
    // Update notification (mark as read)
    const { data: notification, error: updateError } = await supabase
      .from('system_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', body.id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating system notification:', error)
    return NextResponse.json(
      { error: 'Failed to update system notification' },
      { status: 500 }
    )
  }
} 