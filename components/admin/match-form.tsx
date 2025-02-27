import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Team {
  id: string
  name: string
}

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

interface MatchFormProps {
  gameweekId: string
  match?: Match
  onSuccess?: () => void
  onCancel?: () => void
  open?: boolean
}

export default function MatchForm({ gameweekId, match, onSuccess, onCancel, open: initialOpen }: MatchFormProps) {
  const [open, setOpen] = useState(initialOpen || false)
  const [isLoading, setIsLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchTeams()
    }
  }, [open])

  useEffect(() => {
    if (initialOpen !== undefined) {
      setOpen(initialOpen)
    }
  }, [initialOpen])

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true)
      const response = await fetch('/api/teams')
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }
      
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch teams',
        variant: 'destructive',
      })
    } finally {
      setLoadingTeams(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const homeTeamId = formData.get('homeTeamId') as string
    const awayTeamId = formData.get('awayTeamId') as string
    const matchDate = formData.get('matchDate') as string
    const matchTime = formData.get('matchTime') as string
    const status = formData.get('status') as string
    const homeScore = formData.get('homeScore') as string
    const awayScore = formData.get('awayScore') as string

    // Combine date and time
    const matchDateTime = new Date(`${matchDate}T${matchTime}`)

    try {
      const endpoint = '/api/gameweeks/matches'
      const method = match ? 'PATCH' : 'POST'
      
      const payload = match 
        ? { 
            id: match.id,
            homeScore: parseInt(homeScore || '0'),
            awayScore: parseInt(awayScore || '0'),
            status,
            matchDate: matchDateTime.toISOString()
          }
        : {
            gameweekId,
            homeTeamId,
            awayTeamId,
            matchDate: matchDateTime.toISOString(),
            status: status || 'scheduled'
          }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save match')
      }

      toast({
        title: match ? 'Match updated' : 'Match created',
        description: match 
          ? 'The match has been updated successfully.'
          : 'The match has been created successfully.',
      })

      setOpen(false)
      router.refresh()
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving match:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save match',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen && onCancel) {
      onCancel()
    }
  }

  // Format date and time for input fields
  const getFormattedDate = () => {
    if (!match) return ''
    const date = new Date(match.match_date)
    return date.toISOString().split('T')[0]
  }

  const getFormattedTime = () => {
    if (!match) return ''
    const date = new Date(match.match_date)
    return date.toISOString().split('T')[1].substring(0, 5)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!initialOpen && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {match ? 'Edit Match' : 'Add Match'}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{match ? 'Edit Match' : 'Add New Match'}</DialogTitle>
          <DialogDescription>
            {match 
              ? 'Update the details for this match.' 
              : 'Schedule a new match for this gameweek.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!match && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="homeTeamId" className="text-right">
                    Home Team
                  </Label>
                  <Select name="homeTeamId" required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingTeams ? (
                        <SelectItem value="loading" disabled>Loading teams...</SelectItem>
                      ) : (
                        teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="awayTeamId" className="text-right">
                    Away Team
                  </Label>
                  <Select name="awayTeamId" required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingTeams ? (
                        <SelectItem value="loading" disabled>Loading teams...</SelectItem>
                      ) : (
                        teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="matchDate" className="text-right">
                Match Date
              </Label>
              <Input
                id="matchDate"
                name="matchDate"
                type="date"
                defaultValue={getFormattedDate()}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="matchTime" className="text-right">
                Match Time
              </Label>
              <Input
                id="matchTime"
                name="matchTime"
                type="time"
                defaultValue={getFormattedTime()}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select name="status" defaultValue={match?.status || 'scheduled'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {match && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="homeScore" className="text-right">
                    Home Score
                  </Label>
                  <Input
                    id="homeScore"
                    name="homeScore"
                    type="number"
                    min="0"
                    defaultValue={match.home_score}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="awayScore" className="text-right">
                    Away Score
                  </Label>
                  <Input
                    id="awayScore"
                    name="awayScore"
                    type="number"
                    min="0"
                    defaultValue={match.away_score}
                    className="col-span-3"
                    required
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : match ? 'Update Match' : 'Create Match'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 