'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Trophy, DollarSign, TrendingUp } from 'lucide-react'

interface SystemStatsData {
  totalUsers: number
  activeTeams: number
  totalLeagues: number
  revenue: number
  userGrowth: number
  teamGrowth: number
  leagueGrowth: number
  revenueGrowth: number
}

interface SystemStatsProps {
  initialData?: SystemStatsData
}

export function SystemStats({ initialData }: SystemStatsProps) {
  const [stats, setStats] = useState<SystemStatsData | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialData) {
      fetchStats()
    }
  }, [initialData])

  async function fetchStats() {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/system-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch system stats')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching system stats:', err)
      setError('Failed to load system stats')
    } finally {
      setIsLoading(false)
    }
  }

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const items = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      growth: stats.userGrowth
    },
    {
      title: 'Active Teams',
      value: stats.activeTeams.toLocaleString(),
      icon: Trophy,
      growth: stats.teamGrowth
    },
    {
      title: 'Total Leagues',
      value: stats.totalLeagues.toLocaleString(),
      icon: Trophy,
      growth: stats.leagueGrowth
    },
    {
      title: 'Total Revenue',
      value: formatNaira(stats.revenue),
      icon: DollarSign,
      growth: stats.revenueGrowth
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{item.value}</div>
              <Badge variant={item.growth > 0 ? 'success' : 'destructive'}>
                <TrendingUp className="mr-1 h-3 w-3" />
                {item.growth}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 