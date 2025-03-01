'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'
import { Alert, AlertDescription } from '@/components/ui/alert'

function LastUpdatedIndicatorContent() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    try {
      // Fetch the last updated time from localStorage if available
      const storedTime = localStorage.getItem('playerStatsLastUpdated')
      if (storedTime) {
        setLastUpdated(new Date(storedTime))
      }
      
      // Subscribe to storage events to update the indicator when data is refreshed
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'playerStatsLastUpdated' && e.newValue) {
          try {
            setLastUpdated(new Date(e.newValue))
          } catch (err) {
            console.error('Error parsing date from storage event:', err)
            setError('Unable to parse last updated time')
          }
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    } catch (err) {
      console.error('Error in LastUpdatedIndicator useEffect:', err)
      setError('Unable to initialize last updated indicator')
    }
  }, [])
  
  // Update localStorage when player data is refreshed
  // This function can be called from other components
  const updateLastUpdatedTime = () => {
    try {
      const now = new Date()
      localStorage.setItem('playerStatsLastUpdated', now.toISOString())
      setLastUpdated(now)
    } catch (err) {
      console.error('Error updating last updated time:', err)
      setError('Unable to update last updated time')
    }
  }
  
  if (error) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-3">
          <Alert variant="destructive" className="p-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  
  if (!lastUpdated) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-3 flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Player statistics not yet updated
          </span>
        </CardContent>
      </Card>
    )
  }
  
  // Format the date for display
  let formattedDate: string
  let formattedTime: string
  let timeAgo: string
  
  try {
    formattedDate = lastUpdated.toLocaleDateString()
    formattedTime = lastUpdated.toLocaleTimeString()
    
    // Calculate how long ago the data was updated
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      timeAgo = 'just now'
    } else if (diffInMinutes < 60) {
      timeAgo = `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      timeAgo = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      timeAgo = `${days} ${days === 1 ? 'day' : 'days'} ago`
    }
  } catch (err) {
    console.error('Error formatting date:', err)
    formattedDate = 'Unknown date'
    formattedTime = 'Unknown time'
    timeAgo = 'Unknown'
  }
  
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-3 flex items-center space-x-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Player statistics last updated: 
        </span>
        <Badge variant="outline" className="text-xs font-normal">
          {formattedDate} at {formattedTime} ({timeAgo})
        </Badge>
      </CardContent>
    </Card>
  )
}

export function LastUpdatedIndicator() {
  return (
    <ErrorBoundary>
      <LastUpdatedIndicatorContent />
    </ErrorBoundary>
  )
}

// Export the update function to be used by other components
export function updatePlayerStatsLastUpdated() {
  try {
    const now = new Date()
    localStorage.setItem('playerStatsLastUpdated', now.toISOString())
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'playerStatsLastUpdated',
      newValue: now.toISOString()
    }))
  } catch (err) {
    console.error('Error in updatePlayerStatsLastUpdated:', err)
  }
} 