'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { matchDataService } from '@/lib/services/match-data-service'
import { updatePlayerStatsLastUpdated } from '@/components/match/last-updated-indicator'

export function MatchDataIntegration() {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleRefreshPlayerData = async () => {
    try {
      setIsUpdating(true)
      
      // Fetch the latest player statistics from the API
      const response = await fetch('/api/players/statistics')
      if (!response.ok) {
        throw new Error('Failed to fetch player statistics')
      }
      
      const data = await response.json()
      
      // Update player statistics in the database
      const result = await matchDataService.updatePlayerStatistics(data.players || [])
      
      if (result) {
        // Update last updated time
        updatePlayerStatsLastUpdated()
        
        toast({
          title: 'Player Data Updated',
          description: 'Player statistics have been successfully updated with the latest match data.',
          variant: 'default',
          duration: 5000
        })
      } else {
        toast({
          title: 'Update Failed',
          description: 'There was an error updating player statistics. Please try again.',
          variant: 'destructive',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error refreshing player data:', error)
      toast({
        title: 'Update Failed',
        description: 'There was an error updating player statistics. Please check the console for details.',
        variant: 'destructive',
        duration: 5000
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Data Integration</CardTitle>
        <CardDescription>
          Refresh player statistics with the latest match data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-blue-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This will update player statistics based on the latest match data. 
                  Use this feature to ensure your simulation data is up-to-date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRefreshPlayerData} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Updating Player Data...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Player Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 