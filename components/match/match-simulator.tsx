import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Play, RefreshCw } from 'lucide-react'
import { LiveMatchTracker } from '@/components/match/live-match-tracker'
import { useToast } from '@/components/ui/use-toast'

interface Team {
  id: string
  name: string
}

interface MatchEvent {
  minute: number
  type: string
  teamId: string
  playerId: string
  playerName: string
  assistPlayerId?: string
  assistPlayerName?: string
  detail?: string
}

interface PlayerPerformance {
  playerId: string
  playerName: string
  teamId: string
  position: string
  rating: number
  goals: number
  assists: number
  minutesPlayed: number
}

interface SimulatedMatch {
  id: string
  homeTeam: Team
  awayTeam: Team
  homeScore: number
  awayScore: number
  status: 'not_started' | 'in_progress' | 'completed'
  currentMinute: number
  events: MatchEvent[]
  playerPerformances: PlayerPerformance[]
}

export function MatchSimulator() {
  const [teams, setTeams] = useState<Team[]>([])
  const [homeTeamId, setHomeTeamId] = useState<string>('')
  const [awayTeamId, setAwayTeamId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [match, setMatch] = useState<SimulatedMatch | null>(null)
  const { toast } = useToast()

  // Fetch teams when component mounts
  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/teams')
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast({
        title: 'Error',
        description: 'Failed to load teams. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startSimulation = async () => {
    if (!homeTeamId || !awayTeamId) {
      toast({
        title: 'Teams Required',
        description: 'Please select both home and away teams.',
        variant: 'destructive',
      })
      return
    }

    if (homeTeamId === awayTeamId) {
      toast({
        title: 'Invalid Selection',
        description: 'Home and away teams must be different.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSimulating(true)
      
      // Create a new match simulation
      const response = await fetch('/api/matches/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeamId,
          awayTeamId,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to start match simulation')
      }
      
      const simulatedMatch = await response.json()
      setMatch(simulatedMatch)
      
      // Start listening for match updates
      const matchUpdateInterval = setInterval(async () => {
        try {
          const updateResponse = await fetch(`/api/matches/simulate/${simulatedMatch.id}`)
          
          if (!updateResponse.ok) {
            throw new Error('Failed to fetch match updates')
          }
          
          const updatedMatch = await updateResponse.json()
          setMatch(updatedMatch)
          
          if (updatedMatch.status === 'completed') {
            clearInterval(matchUpdateInterval)
            setIsSimulating(false)
            
            toast({
              title: 'Match Completed',
              description: `Final Score: ${updatedMatch.homeTeam.name} ${updatedMatch.homeScore} - ${updatedMatch.awayScore} ${updatedMatch.awayTeam.name}`,
            })
          }
        } catch (error) {
          console.error('Error updating match:', error)
        }
      }, 3000) // Update every 3 seconds
      
      return () => clearInterval(matchUpdateInterval)
      
    } catch (error) {
      console.error('Error simulating match:', error)
      toast({
        title: 'Simulation Failed',
        description: 'Failed to start match simulation. Please try again.',
        variant: 'destructive',
      })
      setIsSimulating(false)
    }
  }

  const resetSimulation = () => {
    setMatch(null)
    setIsSimulating(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Match Simulator</CardTitle>
        <CardDescription>
          Simulate matches between teams to see how they would perform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!match ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Home Team</label>
                <Select
                  value={homeTeamId}
                  onValueChange={setHomeTeamId}
                  disabled={isLoading || isSimulating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select home team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Away Team</label>
                <Select
                  value={awayTeamId}
                  onValueChange={setAwayTeamId}
                  disabled={isLoading || isSimulating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select away team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={startSimulation} 
              disabled={isLoading || isSimulating || !homeTeamId || !awayTeamId}
              className="w-full"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Simulation
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {match.status === 'not_started' && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Preparing match simulation...</p>
              </div>
            )}
            
            {(match.status === 'in_progress' || match.status === 'completed') && (
              <LiveMatchTracker match={match} />
            )}
          </div>
        )}
      </CardContent>
      {match && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={resetSimulation}
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Simulation
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 