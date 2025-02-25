'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  StarHalf,
  Tag,
  AlertCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from '@/lib/supabase/client'

interface Player {
  id: string
  name: string
  position: string
  team: string
  league: string
  current_price: number
  base_price: number
  purchase_price: number
  is_captain: boolean
  is_vice_captain: boolean
  is_for_sale: boolean
  minutes_played: number
  goals_scored: number
  assists: number
  clean_sheets: number
  goals_conceded: number
  own_goals: number
  penalties_saved: number
  penalties_missed: number
  yellow_cards: number
  red_cards: number
  saves: number
  bonus: number
  form_rating: number
  ownership_percent: number
}

interface SquadRequirements {
  isComplete: boolean
  missing: string[]
}

interface SquadListProps {
  teamId: string
  onSquadUpdate?: () => void
}

export function SquadList({ teamId, onSquadUpdate }: SquadListProps) {
  const { toast } = useToast()
  const [players, setPlayers] = useState<Player[]>([])
  const [squadRequirements, setSquadRequirements] = useState<SquadRequirements>({ isComplete: false, missing: [] })
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [salePrice, setSalePrice] = useState('')
  const [showSaleDialog, setShowSaleDialog] = useState(false)
  const supabase = createClient()

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const fetchSquad = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/team/${teamId}/players`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch squad');
      }

      const data = await response.json();
      
      // Sort players by position for consistent display
      const sortedPlayers = (data.players || []).sort((a: Player, b: Player) => {
        const positionOrder = {
          'Goalkeeper': 1,
          'Defender': 2,
          'Midfielder': 3,
          'Forward': 4
        };
        return positionOrder[a.position as keyof typeof positionOrder] - 
               positionOrder[b.position as keyof typeof positionOrder];
      });
      
      setPlayers(sortedPlayers);
      setSquadRequirements(data.squadRequirements);
    } catch (error) {
      console.error('Error fetching squad:', error);
      toast({
        title: "Error",
        description: "Failed to load squad players",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const refreshSquad = async () => {
      await fetchSquad();
    };

    // Initial fetch
    refreshSquad();

    // Set up WebSocket subscription for real-time updates
    const channel = supabase
      .channel('squad_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_players',
          filter: `team_id=eq.${teamId}`
        },
        () => {
          refreshSquad();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, [teamId, fetchSquad]);

  const handleCaptaincy = async (playerId: string, type: 'captain' | 'vice-captain') => {
    try {
      setLoading(true)
      console.log(`SquadList: Setting ${type} for player:`, playerId)
      
      const response = await fetch(`/api/team/players/set-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, playerId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to set ${type}`)
      }

      toast({
        title: "Success",
        description: `Successfully updated ${type}`,
      })

      fetchSquad()
      onSquadUpdate?.()
    } catch (error) {
      console.error(`SquadList: Error setting ${type}:`, error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to update ${type}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSale = async (player: Player) => {
    setSelectedPlayer(player)
    setSalePrice(player.current_price.toString())
    setShowSaleDialog(true)
  }

  const confirmSale = async () => {
    if (!selectedPlayer) return

    try {
      setLoading(true)
      const response = await fetch(`/api/team/players/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          playerId: selectedPlayer.id,
          price: parseInt(salePrice)
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to list player for sale')
      }

      toast({
        title: "Success",
        description: `${selectedPlayer.name} listed for sale at ${formatNaira(parseInt(salePrice))}`,
      })

      setShowSaleDialog(false)
      fetchSquad()
      onSquadUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to list player for sale",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelSale = async (playerId: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/team/players/cancel-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, playerId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel sale')
      }

      toast({
        title: "Success",
        description: "Player removed from transfer list",
      })

      fetchSquad()
      onSquadUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel sale",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Goalkeeper': return 'bg-yellow-500 text-black'
      case 'Defender': return 'bg-blue-500 text-white'
      case 'Midfielder': return 'bg-green-500 text-white'
      case 'Forward': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading squad...</div>
  }

  return (
    <div className="space-y-6">
      {!squadRequirements.isComplete && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your squad is incomplete. You need: {squadRequirements.missing.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map(position => {
        const positionPlayers = players.filter(p => p.position === position)
        return (
          <div key={position}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{position}s</h3>
              <Badge variant="outline">
                {positionPlayers.length} / {
                  position === 'Goalkeeper' ? 2 :
                  position === 'Forward' ? 3 : 5
                }
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {positionPlayers.map((player) => (
                <Card key={player.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{player.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPositionColor(player.position)}>
                              {player.position}
                            </Badge>
                            {player.is_captain && (
                              <Badge variant="outline" className="border-yellow-500">
                                <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                                Captain
                              </Badge>
                            )}
                            {player.is_vice_captain && (
                              <Badge variant="outline" className="border-blue-500">
                                <StarHalf className="h-3 w-3 mr-1 fill-blue-500" />
                                Vice
                              </Badge>
                            )}
                          </div>
                        </div>
                        {player.is_for_sale && (
                          <Badge variant="destructive">
                            <Tag className="h-3 w-3 mr-1" />
                            For Sale
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {player.team} • {player.league}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold">{formatNaira(player.current_price)}</p>
                          <div className="flex items-center gap-1">
                            {player.current_price > player.purchase_price ? (
                              <ChevronUp className="h-4 w-4 text-green-500" />
                            ) : player.current_price < player.purchase_price ? (
                              <ChevronDown className="h-4 w-4 text-red-500" />
                            ) : null}
                            <p className="text-sm text-muted-foreground">
                              {((player.current_price - player.purchase_price) / player.purchase_price * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Bought for: {formatNaira(player.purchase_price)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-muted rounded p-2">
                          <p className="text-xs text-muted-foreground">Form</p>
                          <p className="font-semibold">{player.form_rating?.toFixed(1) || 'N/A'}</p>
                        </div>
                        <div className="bg-muted rounded p-2">
                          <p className="text-xs text-muted-foreground">Ownership</p>
                          <p className="font-semibold">{player.ownership_percent?.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                        <p>Goals: {player.goals_scored}</p>
                        <p>Assists: {player.assists}</p>
                        {player.position === 'Goalkeeper' ? (
                          <>
                            <p>Clean Sheets: {player.clean_sheets}</p>
                            <p>Saves: {player.saves}</p>
                          </>
                        ) : (
                          <>
                            <p>Minutes: {player.minutes_played}</p>
                            <p>Clean Sheets: {player.clean_sheets}</p>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCaptaincy(player.id, 'captain')}
                          disabled={loading || player.is_captain}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Captain
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCaptaincy(player.id, 'vice-captain')}
                          disabled={loading || player.is_vice_captain}
                        >
                          <StarHalf className="h-4 w-4 mr-1" />
                          Vice
                        </Button>
                      </div>

                      {player.is_for_sale ? (
                        <Button
                          variant="destructive"
                          onClick={() => cancelSale(player.id)}
                          disabled={loading}
                        >
                          Cancel Sale
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => handleSale(player)}
                          disabled={loading}
                        >
                          List For Sale
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List Player For Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Value</Label>
              <p className="text-lg font-bold">
                {selectedPlayer && formatNaira(selectedPlayer.current_price)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-price">Sale Price</Label>
              <Input
                id="sale-price"
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="Enter sale price..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSale} disabled={loading}>
              List For Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 