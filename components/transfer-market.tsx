'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Player {
  id: string
  name: string
  position: string
  team: string
  current_price: number
}

interface TransferMarketProps {
  teamId: string
  budget: number
  onPlayerAdded: (player: Player) => void
}

export function TransferMarket({ teamId, budget, onPlayerAdded }: TransferMarketProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPlayers, setTotalPlayers] = useState(0)

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const fetchPlayers = async (page = currentPage) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/players?position=${selectedPosition}&search=${searchQuery}&page=${page}&pageSize=12`
      )
      if (!response.ok) throw new Error('Failed to fetch players')
      const data = await response.json()
      setAvailablePlayers(data.players)
      setTotalPages(data.totalPages)
      setCurrentPage(data.currentPage)
      setTotalPlayers(data.totalPlayers)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available players.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers(1)
  }, [selectedPosition, searchQuery])

  const handleBuyPlayer = async (player: Player) => {
    try {
      setLoading(true)
      const response = await fetch('/api/team/players/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, playerId: player.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to buy player')
      }

      toast({
        title: "Success",
        description: `Successfully signed ${player.name}`,
      })

      onPlayerAdded(player)
      fetchPlayers() // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete transfer",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      fetchPlayers(newPage)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Players</Label>
          <div className="flex w-full items-center space-x-2">
            <Input
              id="search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="secondary" size="icon" disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="w-[200px]">
          <Label>Position</Label>
          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger>
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="Goalkeeper">Goalkeepers</SelectItem>
              <SelectItem value="Defender">Defenders</SelectItem>
              <SelectItem value="Midfielder">Midfielders</SelectItem>
              <SelectItem value="Forward">Forwards</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {totalPlayers > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {availablePlayers.length} of {totalPlayers} players
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availablePlayers.map((player) => (
          <Card key={player.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="font-semibold">{player.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {player.team} • {player.position}
                  </p>
                  <p className="mt-1 text-lg font-bold">{formatNaira(player.current_price)}</p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleBuyPlayer(player)}
                  disabled={loading || player.current_price > budget}
                >
                  {player.current_price > budget ? "Can't Afford" : "Buy Player"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && availablePlayers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No players found. Try adjusting your search or filters.
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          Loading players...
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
} 