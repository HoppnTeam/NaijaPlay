'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Activity, UserPlus, Settings, ShoppingCart } from 'lucide-react'

interface ActivityItem {
  id: string
  user_id: string
  action: string
  details: any
  created_at: string
}

interface AdminActivityTrackerProps {
  initialData?: ActivityItem[]
  className?: string
}

export function AdminActivityTracker({ initialData, className }: AdminActivityTrackerProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!initialData) {
      fetchActivities()
    }
  }, [initialData])

  async function fetchActivities() {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setActivities(data)
    } catch (err: any) {
      console.error('Error fetching activities:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function getActivityIcon(action: string) {
    switch (action) {
      case 'account_created':
        return <UserPlus className="h-4 w-4" />
      case 'settings_updated':
        return <Settings className="h-4 w-4" />
      case 'purchase_made':
        return <ShoppingCart className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  function formatTimeAgo(timestamp: string) {
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activities</h3>
        <button 
          onClick={() => fetchActivities()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      {!loading && !error && activities.length === 0 && (
        <div className="text-gray-500 text-center py-4">
          No recent activities
        </div>
      )}

      {!loading && !error && activities.length > 0 && (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Badge variant="outline" className="p-1">
                {getActivityIcon(activity.action)}
              </Badge>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {activity.action.split('_').join(' ')}
                </p>
                {activity.details && (
                  <p className="text-sm text-gray-500">
                    {JSON.stringify(activity.details)}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {formatTimeAgo(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
} 