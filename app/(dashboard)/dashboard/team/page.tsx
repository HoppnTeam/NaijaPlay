'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Users, 
  Plus, 
  Trophy,
  Star,
  ChartBar,
  Settings,
  Trash2,
  Edit
} from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { TeamBudgetDisplay } from '@/components/team/team-budget-display'
import { TeamTokens } from '@/components/team/team-tokens'

interface Team {
  id: string
  name: string
  budget: number
  token_balance: number
  performance_score?: number
  team_players?: Array<{
    players: {
      name: string
      team: string
      position: string
    }[]
    is_captain: boolean
  }>
  captain?: {
    name: string
    team: string
    position: string
  }
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Single database call to get all team data
      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          token_balance,
          performance_score,
          team_players (
            players (
              name,
              team,
              position
            ),
            is_captain
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to include captain info with hardcoded budget
      const transformedTeams = teams.map(team => {
        const captainPlayer = team.team_players?.find((tp: { is_captain: boolean; players: any[] }) => tp.is_captain)?.players[0];
        return {
          id: team.id,
          name: team.name,
          budget: 200000000, // Hardcode budget to 200M
          token_balance: team.token_balance,
          performance_score: team.performance_score,
          team_players: team.team_players,
          captain: captainPlayer ? {
            name: captainPlayer.name,
            team: captainPlayer.team,
            position: captainPlayer.position
          } : undefined
        } as Team;
      });

      setTeams(transformedTeams)
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast({
        title: "Error",
        description: "Failed to load your teams",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error

      setTeams(teams.filter(team => team.id !== teamId))
      toast({
        title: "Success",
        description: "Team deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting team:', error)
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Teams</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-[100px] bg-muted" />
              <CardContent className="h-[150px] bg-muted" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Teams</h1>
          <p className="text-muted-foreground mt-1">
            Manage your fantasy football teams
          </p>
        </div>
        <Link href="/dashboard/team/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams?.map((team) => (
          <Card key={team.id} className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{team.name}</span>
                {team.performance_score && (
                  <Badge variant="secondary" className="ml-2">
                    <Trophy className="h-3 w-3 mr-1" />
                    {team.performance_score} pts
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                <TeamBudgetDisplay budget={team.budget} />
                <TeamTokens balance={team.token_balance} />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.captain && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      Captain: {team.captain.name} ({team.captain.team})
                    </span>
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  <Link href={`/dashboard/team/${team.id}/squad`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Squad
                    </Button>
                  </Link>
                  <Link href={`/dashboard/team/${team.id}?tab=overview`}>
                    <Button variant="outline" className="w-full justify-start">
                      <ChartBar className="mr-2 h-4 w-4" />
                      View Stats
                    </Button>
                  </Link>
                  <Link href={`/dashboard/team/${team.id}?tab=settings`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Team Settings
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Team
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!teams?.length && (
          <Card>
            <CardHeader>
              <CardTitle>No Teams Yet</CardTitle>
              <CardDescription>
                Create your first team to start playing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/team/create">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}