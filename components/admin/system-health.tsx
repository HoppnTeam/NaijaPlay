'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Server, Database, Globe } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cn } from '@/lib/utils'

interface HealthMetric {
  name: string
  status: 'healthy' | 'warning' | 'error'
  latency?: number
  uptime?: number
}

interface SystemHealthProps {
  className?: string
}

export function SystemHealth({ className }: SystemHealthProps) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkHealth() {
      try {
        setIsLoading(true)
        setError(null)

        // Check database health
        const dbStartTime = Date.now()
        const { error: dbError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
        const dbLatency = Date.now() - dbStartTime

        // Check auth service
        const authStartTime = Date.now()
        const { error: authError } = await supabase.auth.getSession()
        const authLatency = Date.now() - authStartTime

        const healthMetrics: HealthMetric[] = [
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
            status: 'healthy' as const,
            latency: 0
          },
          {
            name: 'Server',
            status: 'healthy' as const,
            latency: 0
          }
        ]

        setMetrics(healthMetrics)
      } catch (err) {
        console.error('Error checking health:', err)
        setError('Failed to check system health')
      } finally {
        setIsLoading(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getIcon = (name: string) => {
    switch (name) {
      case 'API':
        return Globe
      case 'Database':
        return Database
      case 'Server':
        return Server
      default:
        return Activity
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="h-2 w-2 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardHeader>
          <CardTitle className="text-destructive">System Health Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const overallStatus = metrics.some(m => m.status === 'error') ? 'error' 
    : metrics.some(m => m.status === 'warning') ? 'warning' 
    : 'healthy'

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Health</CardTitle>
        <Badge variant={overallStatus === 'healthy' ? 'success' : 'destructive'}>
          {overallStatus.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => {
            const Icon = getIcon(metric.name)
            return (
              <div key={metric.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{metric.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  {metric.latency !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      {metric.latency}ms
                    </span>
                  )}
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(metric.status)}`} />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 