'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export function JoinLeagueForm() {
  const [leagueId, setLeagueId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to join a league.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Get the user's team
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (teamError || !teamData) {
      toast({
        title: "Error",
        description: "You must create a team before joining a league.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Check if the league exists
    const { data: leagueData, error: leagueError } = await supabase
      .from('leagues')
      .select('id')
      .eq('id', leagueId)
      .single()

    if (leagueError || !leagueData) {
      toast({
        title: "Error",
        description: "League not found. Please check the league ID and try again.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Join the league
    const { error: joinError } = await supabase
      .from('league_members')
      .insert({ league_id: leagueId, user_id: user.id, team_id: teamData.id })

    if (joinError) {
      if (joinError.code === '23505') { // Unique constraint violation
        toast({
          title: "Error",
          description: "You are already a member of this league.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to join league. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Success",
        description: "You have successfully joined the league!",
      })
      router.push(`/dashboard/leagues/${leagueId}`)
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="leagueId">League ID</Label>
        <Input
          id="leagueId"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Joining...' : 'Join League'}
      </Button>
    </form>
  )
}

