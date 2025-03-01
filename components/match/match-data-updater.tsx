'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { matchDataService } from '@/lib/services/match-data-service'
import { createClient } from '@/lib/supabase/client'
import { ErrorBoundary } from '@/components/error-boundary'
import { CardLoading } from '@/components/ui/loading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Gameweek {
  id: string
  number: number
  status: string
}

function MatchDataUpdaterContent() {
  const [updatePlayerStats, setUpdatePlayerStats] = useState(true)
  const [updateFantasyPoints, setUpdateFantasyPoints] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [gameweeks, setGameweeks] = useState<Gameweek[]>([])
  const [selectedGameweek, setSelectedGameweek] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchGameweeks()
  }, [])

  const fetchGameweeks = async () => {
    setError(null)
    setIsInitialLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('gameweeks')
        .select('id, number, status')
        .order('number', { ascending: false })
        .limit(10)

      if (error) throw error
      
      setGameweeks(data || [])
      
      // Set the current gameweek (in_progress) as default
      const currentGameweek = data?.find(gw => gw.status === 'in_progress')
      if (currentGameweek) {
        setSelectedGameweek(currentGameweek.id)
      } else if (data && data.length > 0) {
        // Otherwise set the most recent gameweek
        setSelectedGameweek(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching gameweeks:', error)
      setError('Failed to load gameweeks. Please refresh the page and try again.')
      toast({
        title: 'Error Loading Gameweeks',
        description: 'There was a problem loading the gameweeks data.',
        variant: 'destructive',
      })
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!updatePlayerStats && !updateFantasyPoints) {
      toast({
        title: 'Selection Required',
        description: 'Please select at least one update option.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const result = await matchDataService.processMatchData({
        updatePlayerStats,
        updateFantasyPoints,
        gameweekId: selectedGameweek || undefined
      })
      
      if (result) {
        toast({
          title: 'Update Successful',
          description: 'Match data has been successfully updated.',
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
      setIsLoading(false)
    }
  }

  if (isInitialLoading) {
    return <CardLoading text="Loading gameweeks..." />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Data Update</CardTitle>
        <CardDescription>
          Update player statistics and fantasy points based on real match data
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
                  This tool allows you to manually update player statistics and fantasy points
                  based on real match data. Select the options below and click "Update" to process.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameweek">Gameweek</Label>
            <Select
              value={selectedGameweek}
              onValueChange={setSelectedGameweek}
              disabled={gameweeks.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={gameweeks.length === 0 ? "No gameweeks available" : "Select gameweek"} />
              </SelectTrigger>
              <SelectContent>
                {gameweeks.length === 0 ? (
                  <SelectItem value="none" disabled>No gameweeks available</SelectItem>
                ) : (
                  gameweeks.map((gameweek) => (
                    <SelectItem key={gameweek.id} value={gameweek.id}>
                      Gameweek {gameweek.number}
                      {gameweek.status === 'in_progress' ? ' (Current)' : 
                       gameweek.status === 'completed' ? ' (Completed)' : ' (Upcoming)'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="update-player-stats" 
                checked={updatePlayerStats}
                onCheckedChange={(checked) => setUpdatePlayerStats(checked as boolean)}
              />
              <Label htmlFor="update-player-stats">Update Player Statistics</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="update-fantasy-points" 
                checked={updateFantasyPoints}
                onCheckedChange={(checked) => setUpdateFantasyPoints(checked as boolean)}
              />
              <Label htmlFor="update-fantasy-points">Update Fantasy Points</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpdate} 
          disabled={isLoading || (!updatePlayerStats && !updateFantasyPoints) || !selectedGameweek || gameweeks.length === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Match Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function MatchDataUpdater() {
  return (
    <ErrorBoundary>
      <MatchDataUpdaterContent />
    </ErrorBoundary>
  )
} 