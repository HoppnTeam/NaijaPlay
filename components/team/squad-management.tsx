'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Users, AlertTriangle, ShoppingCart } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransferMarket } from "@/components/transfer-market"

interface Player {
  id: string
  name: string
  position: string
  team: string
  current_price: number
  is_captain?: boolean
  is_vice_captain?: boolean
  for_sale?: boolean
}

interface SquadManagementProps {
  teamId: string
  budget: number
  players: Player[]
}

export function SquadManagement({ teamId, budget, players }: SquadManagementProps) {
  const { toast } = useToast()
  const [squadPlayers, setSquadPlayers] = useState<Player[]>(players)
  const [loading, setLoading] = useState(false)

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const isSquadComplete = () => {
    const positions = squadPlayers.reduce((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return (
      (positions['Goalkeeper'] || 0) >= 2 &&
      (positions['Defender'] || 0) >= 5 &&
      (positions['Midfielder'] || 0) >= 5 &&
      (positions['Forward'] || 0) >= 3 &&
      squadPlayers.length >= 15
    )
  }

  const getSquadStatus = () => {
    const positions = squadPlayers.reduce((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const requirements = [
      { position: 'Goalkeeper', required: 2, current: positions['Goalkeeper'] || 0 },
      { position: 'Defender', required: 5, current: positions['Defender'] || 0 },
      { position: 'Midfielder', required: 5, current: positions['Midfielder'] || 0 },
      { position: 'Forward', required: 3, current: positions['Forward'] || 0 },
    ]

    return requirements.map(req => ({
      ...req,
      needed: Math.max(0, req.required - req.current)
    }))
  }

  const handlePlayerAction = async (playerId: string, action: 'captain' | 'vice-captain' | 'sale') => {
    try {
      setLoading(true)
      const response = await fetch(`/api/team/players/${playerId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      })

      if (!response.ok) throw new Error(`Failed to update player ${action} status`)

      setSquadPlayers(current =>
        current.map(player => {
          if (player.id === playerId) {
            if (action === 'captain') {
              return { ...player, is_captain: true, is_vice_captain: false }
            } else if (action === 'vice-captain') {
              return { ...player, is_captain: false, is_vice_captain: true }
            } else {
              return { ...player, for_sale: !player.for_sale }
            }
          }
          if (action === 'captain' && player.is_captain) {
            return { ...player, is_captain: false }
          }
          if (action === 'vice-captain' && player.is_vice_captain) {
            return { ...player, is_vice_captain: false }
          }
          return player
        })
      )

      toast({
        title: "Success",
        description: `Player ${action} status updated successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update player ${action} status`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerAdded = (newPlayer: Player) => {
    setSquadPlayers(current => [...current, newPlayer])
  }

  const groupedPlayers = squadPlayers.reduce((acc, player) => {
    if (!acc[player.position]) {
      acc[player.position] = []
    }
    acc[player.position].push(player)
    return acc
  }, {} as Record<string, Player[]>)

  return (
    <Tabs defaultValue="squad" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="squad">
          <Users className="h-4 w-4 mr-2" />
          Squad List
        </TabsTrigger>
        <TabsTrigger value="transfer">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Transfer Market
        </TabsTrigger>
      </TabsList>

      <TabsContent value="squad" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Squad Management</h2>
          <Badge variant="secondary" className="text-lg">
            Budget: {formatNaira(budget)}
          </Badge>
        </div>

        {!isSquadComplete() && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your squad is incomplete. You need:
              {getSquadStatus()
                .filter(status => status.needed > 0)
                .map(status => (
                  ` ${status.needed} ${status.position}${status.needed > 1 ? 's' : ''}`
                ))
                .join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {Object.entries(groupedPlayers).map(([position, positionPlayers]) => (
          <Card key={position}>
            <CardHeader>
              <CardTitle>{position}s ({positionPlayers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {positionPlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{formatNaira(player.current_price)}</p>
                    </div>
                    <div className="flex gap-2">
                      {player.is_captain && <Badge>Captain</Badge>}
                      {player.is_vice_captain && <Badge variant="secondary">Vice Captain</Badge>}
                      {player.for_sale && <Badge variant="destructive">For Sale</Badge>}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayerAction(player.id, 'captain')}
                        disabled={loading || player.is_captain}
                      >
                        Make Captain
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayerAction(player.id, 'vice-captain')}
                        disabled={loading || player.is_vice_captain}
                      >
                        Make Vice Captain
                      </Button>
                      <Button
                        variant={player.for_sale ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handlePlayerAction(player.id, 'sale')}
                        disabled={loading}
                      >
                        {player.for_sale ? 'Remove from Sale' : 'List for Sale'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="transfer">
        <TransferMarket
          teamId={teamId}
          budget={budget}
          onPlayerAdded={handlePlayerAdded}
        />
      </TabsContent>
    </Tabs>
  )
} 