'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface DataRefreshButtonProps {
  onRefreshComplete?: () => void
}

export function DataRefreshButton({ onRefreshComplete }: DataRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    
    try {
      // In a real app, you would call various data refresh functions here
      // For example, refreshing user stats, match data, etc.
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update the last_updated timestamp in the system_settings table
      const now = new Date().toISOString()
      
      // This is a placeholder - in a real app, you would update a real table
      // await supabase
      //   .from('system_settings')
      //   .update({ value: now })
      //   .eq('key', 'last_data_refresh')
      
      toast({
        title: "Data refreshed successfully",
        description: `All dashboard data has been updated as of ${new Date().toLocaleTimeString()}`,
        variant: "default",
      })
      
      if (onRefreshComplete) {
        onRefreshComplete()
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast({
        title: "Error refreshing data",
        description: "There was a problem refreshing the dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefreshComplete, toast])

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      <Activity className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
    </Button>
  )
} 