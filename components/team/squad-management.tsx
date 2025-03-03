'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Users, AlertTriangle, ShoppingCart, Star, TrendingUp, Shirt, Layout, Tag, UserCheck, UserX, Save, RefreshCw } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransferMarket } from "@/components/transfer-market"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { FormationVisualizer } from "@/components/team/formation-visualizer"
import { SquadList } from "@/components/team/squad-list"

// Define Database type for Supabase client
type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          [key: string]: any
        }
      }
      players: {
        Row: {
          id: string
          [key: string]: any
        }
      }
      [key: string]: any
    }
  }
}

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
  is_starting?: boolean
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
  league: string
  current_price: number
  base_price: number
  is_available: boolean
  form_rating?: number
  ownership_percent?: number
  minutes_played?: number
  goals_scored?: number
  assists?: number
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
  const [startingPlayerIds, setStartingPlayerIds] = useState<string[]>([])
  const [savingLineup, setSavingLineup] = useState(false)
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

  // Initialize starting players from the loaded squad
  useEffect(() => {
    if (squadPlayers && squadPlayers.length > 0) {
      const startingIds = squadPlayers
        .filter(player => player.is_starting)
        .map(player => player.id)
      
      setStartingPlayerIds(startingIds)
    }
  }, [squadPlayers])

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

  const handlePlayerAdded = async (newPlayer: TransferMarketPlayer) => {
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
        // Convert TransferMarketPlayer to Player if needed
        const playerData: Player = {
          id: newPlayer.id,
          name: newPlayer.name,
          position: newPlayer.position,
          team: newPlayer.team,
          league: newPlayer.league || '',
          current_price: newPlayer.current_price,
          base_price: newPlayer.base_price || newPlayer.current_price,
          minutes_played: 0,
          goals_scored: 0,
          assists: 0,
          clean_sheets: 0,
          goals_conceded: 0,
          own_goals: 0,
          penalties_saved: 0,
          penalties_missed: 0,
          yellow_cards: 0,
          red_cards: 0,
          saves: 0,
          bonus: 0,
          form_rating: 0,
          ownership_percent: 0
        };
        onPlayerAdded(playerData);
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

  const handleToggleStartingPlayer = (playerId: string) => {
    setStartingPlayerIds(prev => {
      // If player is already in starting lineup, remove them
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId)
      }
      
      // If we already have 11 starting players, show an error
      if (prev.length >= 11) {
        toast({
          title: "Starting Lineup Full",
          description: "You can only select 11 starting players. Remove a player before adding another.",
          variant: "destructive"
        })
        return prev
      }
      
      // Add player to starting lineup
      return [...prev, playerId]
    })
  }

  const handleSaveStartingLineup = async () => {
    if (startingPlayerIds.length !== 11) {
      toast({
        title: "Invalid Lineup",
        description: `You must select exactly 11 starting players. Currently selected: ${startingPlayerIds.length}`,
        variant: "destructive"
      })
      return
    }

    setSavingLineup(true)
    try {
      const response = await fetch(`/api/team/${teamId}/starting-players`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startingPlayerIds }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update starting players')
      }

      // Update local state to reflect changes
      setSquadPlayers(prev => prev.map(p => ({
        ...p,
        is_starting: startingPlayerIds.includes(p.id)
      })))

      toast({
        title: "Starting Lineup Saved",
        description: "Your starting 11 players have been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating starting lineup:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update starting lineup",
        variant: "destructive",
      })
    } finally {
      setSavingLineup(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Squad Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your team, view player stats, and make transfers
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFormation(true)}
            className="gap-2 w-full sm:w-auto"
            disabled={loading}
          >
            <Layout className="h-4 w-4" />
            View Formation
          </Button>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <p className="text-sm text-muted-foreground">Available Budget</p>
            <p className="text-xl sm:text-2xl font-bold">{formatNaira(currentBudget)}</p>
          </div>
        </div>
      </div>

      <FormationVisualizer
        open={showFormation}
        onClose={() => setShowFormation(false)}
        players={squadPlayers.map(p => ({
          ...p,
          isSubstitute: !startingPlayerIds.includes(p.id)
        }))}
        formation={currentFormation}
        onFormationChange={handleFormationChange}
        onTacticsChange={handleTacticsChange}
      />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle>Current Squad</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Badge variant="outline" className="sm:ml-2">
              Starting: {startingPlayerIds.length}/11
            </Badge>
            <Button 
              onClick={handleSaveStartingLineup} 
              disabled={savingLineup || startingPlayerIds.length !== 11}
              size="sm"
              className="w-full sm:w-auto"
            >
              {savingLineup ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Starting XI
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {squadPlayers.map((player) => (
              <div key={player.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg">
                <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{player.position}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{player.team}</span>
                      {player.is_captain && (
                        <Badge variant="secondary" className="text-xs">Captain</Badge>
                      )}
                      {player.is_vice_captain && (
                        <Badge variant="secondary" className="text-xs">Vice Captain</Badge>
                      )}
                      {player.is_for_sale && (
                        <Badge variant="secondary" className="text-xs">For Sale</Badge>
                      )}
                      {startingPlayerIds.includes(player.id) ? (
                        <Badge variant="default" className="text-xs">Starting XI</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Substitute</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant={startingPlayerIds.includes(player.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleStartingPlayer(player.id)}
                    disabled={loading}
                    className="h-9"
                  >
                    {startingPlayerIds.includes(player.id) ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Starting</span>
                        <span className="sm:hidden">Start</span>
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Substitute</span>
                        <span className="sm:hidden">Sub</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetCaptain(player.id)}
                    disabled={loading || player.is_captain}
                    className="h-9"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Make Captain</span>
                    <span className="sm:hidden">Captain</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetViceCaptain(player.id)}
                    disabled={loading || player.is_vice_captain}
                    className="h-9"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Make Vice Captain</span>
                    <span className="sm:hidden">Vice</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleListForSale(player.id)}
                    disabled={loading || player.is_for_sale}
                    className="h-9"
                  >
                    <Tag className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">List for Sale</span>
                    <span className="sm:hidden">Sell</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="squad" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="squad" className="text-sm sm:text-base py-3">
            <Users className="h-4 w-4 mr-2" />
            Squad List
          </TabsTrigger>
          <TabsTrigger value="transfer" className="text-sm sm:text-base py-3">
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
            onPlayerAdded={(player) => handlePlayerAdded(player)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 