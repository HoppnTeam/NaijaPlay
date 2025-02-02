import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useTransferMarket, POSITIONS } from "@/hooks/use-transfer-market"

interface AddPlayerDialogProps {
  teamId: string
  onPlayerAdded?: () => void
  budget: number
}

export function AddPlayerDialog({ teamId, onPlayerAdded, budget }: AddPlayerDialogProps) {
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const {
    players,
    loading,
    error,
    fetchPlayers,
    addPlayer
  } = useTransferMarket(teamId, budget, onPlayerAdded)

  useEffect(() => {
    fetchPlayers(selectedPosition)
  }, [selectedPosition])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transfer Market</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select
              value={selectedPosition}
              onValueChange={setSelectedPosition}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Badge variant="outline">
                Budget: {formatCurrency(budget)}
              </Badge>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center text-sm text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && players.length > 0 && (
            <div className="space-y-2">
              {players.map((player) => (
                <Card key={player.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{player.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{player.position}</Badge>
                        <span>{player.team}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {formatCurrency(player.current_price)}
                      </Badge>
                      <Button
                        onClick={() => addPlayer(player)}
                        disabled={loading || player.current_price > budget}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 