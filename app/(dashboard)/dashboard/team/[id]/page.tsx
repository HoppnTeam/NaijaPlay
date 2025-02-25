'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Wallet, Trophy, Settings, ArrowLeft, Trash, Loader2 } from 'lucide-react'
import { SquadList } from '@/components/team/squad-list'
import { TeamOverview } from '@/components/team/team-overview'
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PlayerData {
  id: string
  name: string
  position: string
  team: string
  current_price: number
  minutes_played: number
  goals_scored: number
  assists: number
  clean_sheets: number
  form_rating: number
  purchase_price: number
  is_captain: boolean
  is_vice_captain: boolean
  total_points: number
}

interface TeamPlayer {
  id: string
  team_id: string
  player_id: string
  is_captain: boolean
  is_vice_captain: boolean
  purchase_price: number
  players: PlayerData
}

interface Team {
  id: string
  name: string
  budget: number
  total_value: number
  formation: string
  playing_style: string
  mentality: string
  team_players: TeamPlayer[]
}

interface RawTeamPlayer {
  id: string
  team_id: string
  player_id: string
  is_captain: boolean
  is_vice_captain: boolean
  purchase_price: number
  players: {
    id: string
    name: string
    position: string
    team: string
    current_price: number
    minutes_played: number
    goals_scored: number
    assists: number
    clean_sheets: number
    form_rating: number
  }
}

function TeamPageContent({ params }: { params: { id: string } }) {
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'squad'
  const router = useRouter()

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const fetchTeam = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view team details.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      console.log('Fetching team with ID:', params.id)
      console.log('User ID:', user.id)

      // First, verify the team exists and belongs to the user
      const { data: teamBasic, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (teamError) {
        console.error('Error fetching basic team data:', teamError)
        toast({
          title: "Error",
          description: teamError.message === 'No rows found' 
            ? "Team not found or you don't have access to it."
            : "Failed to load team data.",
          variant: "destructive",
        })
        setTeam(null)
        return
      }

      // Then fetch team players
      const { data: rawTeamPlayers, error: playersError } = await supabase
        .from('team_players')
        .select(`
          id,
          team_id,
          player_id,
          is_captain,
          is_vice_captain,
          purchase_price,
          players!inner (
            id,
            name,
            position,
            team,
            current_price,
            minutes_played,
            goals_scored,
            assists,
            clean_sheets,
            form_rating
          )
        `)
        .eq('team_id', params.id) as { data: RawTeamPlayer[] | null, error: any }

      if (playersError) {
        console.error('Error fetching team players:', playersError)
        toast({
          title: "Error",
          description: "Failed to load team players.",
          variant: "destructive",
        })
        setTeam(null)
        return
      }

      // Transform the raw data into our expected type
      const teamPlayers = rawTeamPlayers?.map(tp => ({
        id: tp.id,
        team_id: tp.team_id,
        player_id: tp.player_id,
        is_captain: tp.is_captain,
        is_vice_captain: tp.is_vice_captain,
        purchase_price: tp.purchase_price,
        players: {
          id: tp.players.id,
          name: tp.players.name,
          position: tp.players.position,
          team: tp.players.team,
          current_price: tp.players.current_price,
          minutes_played: tp.players.minutes_played,
          goals_scored: tp.players.goals_scored,
          assists: tp.players.assists,
          clean_sheets: tp.players.clean_sheets,
          form_rating: tp.players.form_rating,
          purchase_price: tp.purchase_price,
          is_captain: tp.is_captain,
          is_vice_captain: tp.is_vice_captain,
          total_points: 0 // Will be calculated below
        }
      })) as TeamPlayer[]

      // Combine the data and calculate total points
      const fullTeam: Team = {
        ...teamBasic,
        team_players: teamPlayers.map(tp => {
          const player = tp.players;
          return {
            ...tp,
            players: {
              ...player,
              total_points: (() => {
                let points = 0;
                
                // Minutes played
                if (player.minutes_played >= 60) points += 2;
                else if (player.minutes_played > 0) points += 1;
                
                // Goals scored (varies by position)
                const goalPoints = player.position === 'Goalkeeper' || player.position === 'Defender' 
                  ? 6 : player.position === 'Midfielder' 
                  ? 5 : 4;
                points += (player.goals_scored || 0) * goalPoints;
                
                // Assists
                points += (player.assists || 0) * 3;
                
                // Clean sheets
                if (player.position === 'Goalkeeper' || player.position === 'Defender') {
                  points += (player.clean_sheets || 0) * 4;
                } else if (player.position === 'Midfielder') {
                  points += (player.clean_sheets || 0);
                }
                
                // Double points for captain
                if (tp.is_captain) {
                  points *= 2;
                }
                
                return points;
              })()
            }
          }
        })
      }

      console.log('Full team data:', fullTeam)
      setTeam(fullTeam)
    } catch (error) {
      console.error('Error fetching team:', error)
      toast({
        title: "Error",
        description: "Failed to load team data.",
        variant: "destructive",
      })
      setTeam(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [params.id])

  const handleEdit = async () => {
    if (!isEditing) {
      setEditedName(team?.name || '')
      setIsEditing(true)
      return
    }

    try {
      if (!editedName.trim()) {
        toast({
          title: "Error",
          description: "Team name cannot be empty",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('teams')
        .update({ name: editedName.trim() })
        .eq('id', team?.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Team name updated successfully"
      })
      
      setIsEditing(false)
      fetchTeam()
    } catch (error) {
      console.error('Error updating team:', error)
      toast({
        title: "Error",
        description: "Failed to update team name",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team?.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Team deleted successfully"
      })
      
      router.push('/dashboard/team')
    } catch (error) {
      console.error('Error deleting team:', error)
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading team...</div>
  }

  if (!team) {
    return <div className="text-center py-8">Team not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/team')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{team.name}</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(team.budget)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Squad Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(team.total_value)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formation</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.formation || '4-4-2'}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="squad">Squad</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tactics">Tactics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="squad" className="space-y-4">
          <SquadList teamId={team.id} onSquadUpdate={fetchTeam} />
        </TabsContent>

        <TabsContent value="overview">
          <TeamOverview team={team} />
        </TabsContent>

        <TabsContent value="tactics">
          <Card>
            <CardHeader>
              <CardTitle>Team Tactics</CardTitle>
              <CardDescription>Configure your team's playing style and formation</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Tactics configuration coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>Manage your team's basic settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  {isEditing ? (
                    <Input
                      id="teamName"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Enter team name"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{team.name}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={handleEdit}
              >
                {isEditing ? 'Save Changes' : 'Edit Team'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Team
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your team
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function TeamPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Loading team details...</h2>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <TeamPageContent params={params} />
    </Suspense>
  )
} 