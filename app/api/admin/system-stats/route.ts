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
    
    // Get current date and date 30 days ago
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Fetch current stats
    const [
      { count: totalUsers },
      { count: activeTeams },
      { count: totalLeagues },
      { data: currentTransactions }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact' }),
      supabase.from('teams').select('*', { count: 'exact' }).eq('is_active', true),
      supabase.from('leagues').select('*', { count: 'exact' }),
      supabase.from('transactions').select('amount').eq('status', 'completed')
    ])
    
    // Fetch stats from 30 days ago
    const [
      { count: prevUsers },
      { count: prevTeams },
      { count: prevLeagues },
      { data: prevTransactions }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact' }).lt('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('teams').select('*', { count: 'exact' }).eq('is_active', true).lt('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('leagues').select('*', { count: 'exact' }).lt('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('transactions').select('amount').eq('status', 'completed').lt('created_at', thirtyDaysAgo.toISOString())
    ])
    
    // Calculate total revenue
    const revenue = currentTransactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0
    const prevRevenue = prevTransactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0
    
    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return 100
      return Math.round(((current - previous) / previous) * 100)
    }
    
    const stats = {
      totalUsers: totalUsers || 0,
      activeTeams: activeTeams || 0,
      totalLeagues: totalLeagues || 0,
      revenue,
      userGrowth: calculateGrowth(totalUsers || 0, prevUsers || 0),
      teamGrowth: calculateGrowth(activeTeams || 0, prevTeams || 0),
      leagueGrowth: calculateGrowth(totalLeagues || 0, prevLeagues || 0),
      revenueGrowth: calculateGrowth(revenue, prevRevenue)
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching system stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system stats' },
      { status: 500 }
    )
  }
} 