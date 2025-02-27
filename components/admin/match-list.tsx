import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import MatchForm from './match-form'

interface Match {
  id: string
  gameweek_id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  status: 'scheduled' | 'in_progress' | 'completed'
  home_score: number
  away_score: number
  home_team: {
    id: string
    name: string
  }
  away_team: {
    id: string
    name: string
  }
}

interface MatchListProps {
  gameweekId: string
}

export default function MatchList({ gameweekId }: MatchListProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchMatches()
  }, [gameweekId])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gameweeks/matches?gameweekId=${gameweekId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch matches')
      }
      
      const data = await response.json()
      setMatches(data)
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch matches')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch matches',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to delete this match?')) {
      return
    }

    try {
      const response = await fetch(`/api/gameweeks/matches?id=${matchId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete match')
      }

      toast({
        title: 'Match deleted',
        description: 'The match has been deleted successfully.',
      })

      // Refresh matches
      fetchMatches()
      router.refresh()
    } catch (err) {
      console.error('Error deleting match:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete match',
        variant: 'destructive',
      })
    }
  }

  const handleMatchSaved = () => {
    fetchMatches()
    setSelectedMatch(null)
    router.refresh()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>
      case 'in_progress':
        return <Badge variant="success">In Progress</Badge>
      case 'completed':
        return <Badge>Completed</Badge>
      default:
        return null
    }
  }

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading matches...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Matches</h2>
        <MatchForm gameweekId={gameweekId} onSuccess={handleMatchSaved} />
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No matches have been scheduled for this gameweek yet.
            </p>
            <MatchForm gameweekId={gameweekId} onSuccess={handleMatchSaved} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(match.status)}
                      <span className="text-sm text-muted-foreground">
                        {formatMatchDate(match.match_date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-right flex-1">
                        <p className="font-medium">{match.home_team.name}</p>
                        {match.status !== 'scheduled' && (
                          <p className="text-2xl font-bold">{match.home_score}</p>
                        )}
                      </div>
                      
                      <div className="mx-4 text-center">
                        <span className="text-sm font-medium text-muted-foreground">vs</span>
                      </div>
                      
                      <div className="text-left flex-1">
                        <p className="font-medium">{match.away_team.name}</p>
                        {match.status !== 'scheduled' && (
                          <p className="text-2xl font-bold">{match.away_score}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedMatch(match)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    {match.status === 'scheduled' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteMatch(match.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedMatch && (
        <MatchForm 
          gameweekId={gameweekId} 
          match={selectedMatch} 
          onSuccess={handleMatchSaved} 
          onCancel={() => setSelectedMatch(null)}
          open={true}
        />
      )}
    </div>
  )
}