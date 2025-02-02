'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

type Team = {
  id: string
  name: string
  league_id: string
}

type EditTeamDialogProps = {
  team: Team | null
  isOpen: boolean
  onClose: () => void
  onTeamUpdated: () => void
}

export function EditTeamDialog({ team, isOpen, onClose, onTeamUpdated }: EditTeamDialogProps) {
  const [name, setName] = useState('')
  const [leagueId, setLeagueId] = useState('')
  const [leagues, setLeagues] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (team) {
      setName(team.name)
      setLeagueId(team.league_id)
    }
    fetchLeagues()
  }, [team])

  const fetchLeagues = async () => {
    const { data, error } = await supabase
      .from('leagues')
      .select('id, name')

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leagues. Please try again.",
        variant: "destructive",
      })
    } else {
      setLeagues(data || [])
    }
  }

  const handleUpdateTeam = async () => {
    if (!team) return

    setIsLoading(true)
    const { error } = await supabase
      .from('teams')
      .update({ name, league_id: leagueId })
      .eq('id', team.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Team updated successfully.",
      })
      onTeamUpdated()
      onClose()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name">Team Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="league">League</label>
            <Select value={leagueId} onValueChange={setLeagueId}>
              <SelectTrigger>
                <SelectValue placeholder="Select league" />
              </SelectTrigger>
              <SelectContent>
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.id}>
                    {league.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdateTeam} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

