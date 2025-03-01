'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, RefreshCw, Play, CheckCircle, Clock, AlertCircle, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { matchDataService } from '@/lib/services/match-data-service'
import { updatePlayerStatsLastUpdated } from '@/components/match/last-updated-indicator'
import { ErrorBoundary } from '@/components/error-boundary'
import { CardLoading } from '@/components/ui/loading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Gameweek {
  id: string
  number: number
  start_date: string
  end_date: string
  status: 'upcoming' | 'in_progress' | 'completed'
}

function GameweekMatchIntegrationContent() {
  const [gameweeks, setGameweeks] = useState<Gameweek[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('current')
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchGameweeks()
  }, [])

  const fetchGameweeks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('gameweeks')
        .select('*')
        .order('number', { ascending: false })
        .limit(5)

      if (error) throw error
      setGameweeks(data || [])
      
      // If no gameweek is in progress and we're on the current tab, switch to recent
      if (data && !data.some(gw => gw.status === 'in_progress') && activeTab === 'current') {
        setActiveTab('recent')
      }
    } catch (error) {
      console.error('Error fetching gameweeks:', error)
      setError('Failed to load gameweeks. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to load gameweeks',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateGameweekStatus = async (gameweekId: string, status: 'upcoming' | 'in_progress' | 'completed') => {
    try {
      setIsUpdating(gameweekId)
      setError(null)
      
      // Update gameweek status
      const { error } = await supabase
        .from('gameweeks')
        .update({ status })
        .eq('id', gameweekId)

      if (error) throw error

      // If setting to in_progress, set all other gameweeks to not in_progress
      if (status === 'in_progress') {
        const { error: batchError } = await supabase
          .from('gameweeks')
          .update({ status: 'upcoming' })
          .neq('id', gameweekId)
          .eq('status', 'in_progress')

        if (batchError) throw batchError
      }

      // Refresh gameweeks
      await fetchGameweeks()
      
      // Show success message
      toast({
        title: 'Status Updated',
        description: `Gameweek status has been updated to ${status.replace('_', ' ')}`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Error updating gameweek status:', error)
      setError(`Failed to update gameweek status to ${status}. Please try again.`)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update gameweek status',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const updateMatchData = async (gameweekId: string) => {
    try {
      setIsUpdating(gameweekId)
      setError(null)
      
      const result = await matchDataService.processMatchData({
        updatePlayerStats: true,
        updateFantasyPoints: true,
        gameweekId
      })
      
      if (result) {
        // Update last updated time
        updatePlayerStatsLastUpdated()
        
        toast({
          title: 'Update Successful',
          description: 'Match data has been successfully updated for this gameweek.',
          variant: 'default',
        })
      } else {
        throw new Error('Update returned no result')
      }
    } catch (error) {
      console.error('Error updating match data:', error)
      setError('Failed to update match data. Please try again.')
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'There was an error updating match data.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="bg-yellow-100"><Clock className="h-3 w-3 mr-1" /> Upcoming</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100"><Play className="h-3 w-3 mr-1" /> In Progress</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-100"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  if (isLoading) {
    return <CardLoading text="Loading gameweeks..." />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Gameweek & Match Data Integration
        </CardTitle>
        <CardDescription>
          Manage gameweeks and update match data for your fantasy football leagues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This dashboard allows you to manage gameweeks and update match data.
                  You can start or complete gameweeks, and update player statistics and fantasy points.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Gameweek</TabsTrigger>
            <TabsTrigger value="recent">Recent Gameweeks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {gameweeks.filter(gw => gw.status === 'in_progress').length > 0 ? (
              gameweeks
                .filter(gw => gw.status === 'in_progress')
                .map(gameweek => (
                  <div key={gameweek.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Gameweek {gameweek.number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(gameweek.start_date)} - {formatDate(gameweek.end_date)}
                        </p>
                      </div>
                      <div>{getStatusBadge(gameweek.status)}</div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateMatchData(gameweek.id)}
                        disabled={!!isUpdating}
                      >
                        {isUpdating === gameweek.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Update Match Data
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateGameweekStatus(gameweek.id, 'completed')}
                        disabled={!!isUpdating}
                      >
                        {isUpdating === gameweek.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Complete Gameweek
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center p-8 border rounded-lg text-muted-foreground">
                No gameweek is currently in progress. Start a gameweek from the Recent Gameweeks tab.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="space-y-4">
              {gameweeks.length === 0 ? (
                <div className="text-center p-8 border rounded-lg text-muted-foreground">
                  No gameweeks found. Please check your database or refresh.
                </div>
              ) : (
                gameweeks.map(gameweek => (
                  <div key={gameweek.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Gameweek {gameweek.number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(gameweek.start_date)} - {formatDate(gameweek.end_date)}
                        </p>
                      </div>
                      <div>{getStatusBadge(gameweek.status)}</div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateMatchData(gameweek.id)}
                        disabled={!!isUpdating}
                      >
                        {isUpdating === gameweek.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Update Match Data
                      </Button>
                      
                      {gameweek.status === 'upcoming' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateGameweekStatus(gameweek.id, 'in_progress')}
                          disabled={!!isUpdating}
                        >
                          {isUpdating === gameweek.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          Start Gameweek
                        </Button>
                      )}
                      
                      {gameweek.status === 'in_progress' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateGameweekStatus(gameweek.id, 'completed')}
                          disabled={!!isUpdating}
                        >
                          {isUpdating === gameweek.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Complete Gameweek
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={fetchGameweeks}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Gameweeks
        </Button>
      </CardFooter>
    </Card>
  )
}

export function GameweekMatchIntegration() {
  return (
    <ErrorBoundary>
      <GameweekMatchIntegrationContent />
    </ErrorBoundary>
  )
} 