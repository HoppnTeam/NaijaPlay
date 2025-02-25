'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Users, AlertTriangle, ShoppingCart, Star, TrendingUp, Shirt, Layout, Tag } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransferMarket } from "@/components/transfer-market"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { FormationVisualizer } from "@/components/team/formation-visualizer"
import { SquadList } from "@/components/team/squad-list"
import { Database } from '@/types/supabase'

interface Player {
  id: string
  name: string
  position: string
  team: string
  league: string
  current_price: number
  base_price: number
  is_captain?: boolean
  is_vice_captain?: boolean
  is_for_sale?: boolean
  minutes_played?: number
  goals_scored?: number
  assists?: number
  clean_sheets?: number
  goals_conceded?: number
  own_goals?: number
  penalties_saved?: number
  penalties_missed?: number
  yellow_cards?: number
  red_cards?: number
  saves?: number
  bonus?: number
  form_rating?: number
  ownership_percent?: number
}

interface TransferMarketPlayer {
  id: string
  name: string
  position: string
  team: string
  current_price: number
}

interface SquadManagementProps {
  teamId: string
  budget: number
  players: Player[]
  onPlayerAdded?: (player: Player) => void
}

export function SquadManagement({ teamId, budget, players, onPlayerAdded }: SquadManagementProps) {
  const { toast } = useToast()
  const [currentBudget, setCurrentBudget] = useState(budget)
  const [loading, setLoading] = useState(false)
  const [showFormation, setShowFormation] = useState(false)
  const [currentFormation, setCurrentFormation] = useState('4-4-2')
  const [currentTactics, setCurrentTactics] = useState<{
    playingStyle: string
    mentality: string
  }>({
    playingStyle: 'possession',
    mentality: 'Balanced'
  })
  const [squadPlayers, setSquadPlayers] = useState<Player[]>(players || [])
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchTeamSettings = async () => {
      try {
        const response = await fetch(`/api/team/${teamId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch team settings')
        }
        const data = await response.json()
        
        // Always use 200M budget
        setCurrentBudget(200000000)
        
        if (data.formation) {
          setCurrentFormation(data.formation)
        }
        if (data.playing_style && data.mentality) {
          setCurrentTactics({
            playingStyle: data.playing_style,
            mentality: data.mentality
          })
        }
      } catch (error) {
        console.error('Error fetching team settings:', error)
        toast({
          title: "Error",
          description: "Failed to load team settings",
          variant: "destructive",
        })
      }
    }

    fetchTeamSettings()
  }, [teamId, toast])

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleFormationChange = async (newFormation: string) => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/team/${teamId}/formation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formation: newFormation }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update formation')
      }

      setCurrentFormation(newFormation)
      toast({
        title: "Formation Updated",
        description: "Your team formation has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating formation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update formation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTacticsChange = async (tactics: { playingStyle: string, mentality: string }) => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/team/${teamId}/tactics`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tactics),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update tactics')
      }

      setCurrentTactics(tactics)
      toast({
        title: "Tactics Updated",
        description: "Your team tactics have been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating tactics:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update tactics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerAdded = async (newPlayer: Player) => {
    try {
      setLoading(true)
      
      // Fetch updated squad data
      const response = await fetch(`/api/team/${teamId}/players`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to refresh squad data')
      }
      
      const data = await response.json()
      
      // Update squad players state with new data
      setSquadPlayers(data.players || [])
      
      // Update budget from the response
      if (data.budget) {
        setCurrentBudget(data.budget)
      }

      // Call the parent's onPlayerAdded if it exists
      if (onPlayerAdded) {
        onPlayerAdded(newPlayer)
      }
      
      toast({
        title: "Success",
        description: `Successfully signed ${newPlayer?.name || 'player'}`,
      })
    } catch (error) {
      console.error('Error handling player addition:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update squad",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetCaptain = async (playerId: string) => {
    setLoading(true)
    try {
      // Update team captain
      const { error: updateError } = await supabase
        .from('teams')
        .update({ captain_id: playerId })
        .eq('id', teamId)

      if (updateError) throw updateError

      // Update local state
      setSquadPlayers(prev => prev.map(p => ({
        ...p,
        is_captain: p.id === playerId,
        is_vice_captain: p.is_vice_captain && p.id !== playerId
      })))

      toast({
        title: "Captain Updated",
        description: "Team captain has been updated successfully",
      })
    } catch (error) {
      console.error('Error setting captain:', error)
      toast({
        title: "Error",
        description: "Failed to update team captain",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetViceCaptain = async (playerId: string) => {
    setLoading(true)
    try {
      // Update team vice captain
      const { error: updateError } = await supabase
        .from('team_players')
        .update({ is_vice_captain: true })
        .eq('team_id', teamId)
        .eq('player_id', playerId)

      if (updateError) throw updateError

      // Update local state
      setSquadPlayers(prev => prev.map(p => ({
        ...p,
        is_vice_captain: p.id === playerId
      })))

      toast({
        title: "Vice Captain Updated",
        description: "Team vice captain has been updated successfully",
      })
    } catch (error) {
      console.error('Error setting vice captain:', error)
      toast({
        title: "Error",
        description: "Failed to update team vice captain",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleListForSale = async (playerId: string) => {
    setLoading(true)
    try {
      // Update player listing status
      const { error: updateError } = await supabase
        .from('team_players')
        .update({ is_for_sale: true })
        .eq('team_id', teamId)
        .eq('player_id', playerId)

      if (updateError) throw updateError

      // Update local state
      setSquadPlayers(prev => prev.map(p => ({
        ...p,
        is_for_sale: p.id === playerId
      })))

      toast({
        title: "Player Listed",
        description: "Player has been listed for sale",
      })
    } catch (error) {
      console.error('Error listing player:', error)
      toast({
        title: "Error",
        description: "Failed to list player for sale",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Squad Management</h2>
          <p className="text-muted-foreground">
            Manage your team, view player stats, and make transfers
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFormation(true)}
            className="gap-2"
            disabled={loading}
          >
            <Layout className="h-4 w-4" />
            View Formation
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Available Budget</p>
            <p className="text-2xl font-bold">{formatNaira(currentBudget)}</p>
          </div>
        </div>
      </div>

      <FormationVisualizer
        open={showFormation}
        onClose={() => setShowFormation(false)}
        players={players}
        formation={currentFormation}
        onFormationChange={handleFormationChange}
        onTacticsChange={handleTacticsChange}
      />

      <Card>
        <CardHeader>
          <CardTitle>Current Squad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {squadPlayers.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{player.position}</span>
                      <span>•</span>
                      <span>{player.team}</span>
                      {player.is_captain && (
                        <Badge variant="secondary">Captain</Badge>
                      )}
                      {player.is_vice_captain && (
                        <Badge variant="secondary">Vice Captain</Badge>
                      )}
                      {player.is_for_sale && (
                        <Badge variant="secondary">For Sale</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetCaptain(player.id)}
                    disabled={loading || player.is_captain}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Make Captain
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetViceCaptain(player.id)}
                    disabled={loading || player.is_vice_captain}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Make Vice Captain
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleListForSale(player.id)}
                    disabled={loading || player.is_for_sale}
                  >
                    <Tag className="h-4 w-4 mr-1" />
                    List for Sale
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="squad" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="squad" className="text-base">
            <Users className="h-4 w-4 mr-2" />
            Squad List
          </TabsTrigger>
          <TabsTrigger value="transfer" className="text-base">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Transfer Market
          </TabsTrigger>
        </TabsList>

        <TabsContent value="squad">
          <SquadList 
            teamId={teamId} 
            onSquadUpdate={() => {
              // Refresh budget and squad data when squad is updated
              const fetchUpdatedData = async () => {
                try {
                  const response = await fetch(`/api/team/${teamId}`)
                  if (!response.ok) throw new Error('Failed to fetch team data')
                  const data = await response.json()
                  setCurrentBudget(data.budget)
                } catch (error) {
                  console.error('Error fetching updated team data:', error)
                }
              }
              fetchUpdatedData()
            }} 
          />
        </TabsContent>

        <TabsContent value="transfer">
          <TransferMarket 
            teamId={teamId} 
            budget={currentBudget}
            onPlayerAdded={handlePlayerAdded}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 