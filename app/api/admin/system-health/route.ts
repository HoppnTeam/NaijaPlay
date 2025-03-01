import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check database health
    const dbStartTime = Date.now()
    const { data: dbCheck, error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    const dbLatency = Date.now() - dbStartTime

    // Check auth service health
    const authStartTime = Date.now()
    const { data: authCheck, error: authError } = await supabase.auth.getSession()
    const authLatency = Date.now() - authStartTime

    const healthData = {
      metrics: [
        {
          name: 'Database',
          status: dbError ? 'error' : dbLatency > 1000 ? 'warning' : 'healthy',
          latency: dbLatency
        },
        {
          name: 'Auth Service',
          status: authError ? 'error' : authLatency > 1000 ? 'warning' : 'healthy',
          latency: authLatency
        },
        {
          name: 'API',
          status: 'healthy',
          latency: 0
        },
        {
          name: 'Server',
          status: 'healthy',
          latency: 0
        }
      ],
      overallStatus: determineSystemStatus({
        dbStatus: dbError ? 'error' : dbLatency > 1000 ? 'warning' : 'healthy',
        authStatus: authError ? 'error' : authLatency > 1000 ? 'warning' : 'healthy',
        apiStatus: 'healthy',
        serverStatus: 'healthy'
      }),
      lastChecked: new Date().toISOString()
    }

    return NextResponse.json(healthData)
  } catch (error) {
    console.error('Error checking system health:', error)
    return NextResponse.json(
      { error: 'Failed to check system health' },
      { status: 500 }
    )
  }
}

function determineSystemStatus({ 
  dbStatus, 
  authStatus, 
  apiStatus, 
  serverStatus 
}: { 
  dbStatus: string
  authStatus: string
  apiStatus: string
  serverStatus: string
}) {
  const statuses = [dbStatus, authStatus, apiStatus, serverStatus]
  
  if (statuses.some(status => status === 'error')) {
    return 'error'
  }
  
  if (statuses.some(status => status === 'warning')) {
    return 'warning'
  }
  
  return 'healthy'
} 