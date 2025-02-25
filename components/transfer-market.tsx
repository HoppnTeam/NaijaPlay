'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  TrendingUp,
  TrendingDown,
  Star,
  Filter,
  ShieldCheck,
  Goal,
  Timer,
  Award,
  Percent,
  DollarSign,
  AlertTriangle,
  Plus
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { cn } from "@/lib/utils"
import { 
  TransferMarketPlayer, 
  POSITION_REQUIREMENTS, 
  isValidPosition,
  getPlayerName,
  SQUAD_SIZE_LIMIT
} from '@/types/squad'
import { supabase } from '@/lib/supabase/client'
import { useSquadData } from '@/hooks/use-squad-data'

// Utility functions
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getPositionColor = (position: string) => {
  switch (position) {
    case 'Goalkeeper': return 'bg-yellow-500'
    case 'Defender': return 'bg-blue-500'
    case 'Midfielder': return 'bg-green-500'
    case 'Forward': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const ITEMS_PER_PAGE = 15
const POSITIONS = ['All', ...Object.keys(POSITION_REQUIREMENTS)] as const
const LEAGUES = ['All', 'EPL', 'NPFL'] as const

interface TransferMarketProps {
  teamId: string
  budget: number
  onPlayerAdded?: (player: TransferMarketPlayer) => void
}

// Extract PlayerCard component
function PlayerCard({ 
  player, 
  onSign, 
  isLoading, 
  insufficientBudget 
}: { 
  player: TransferMarketPlayer
  onSign: () => void
  isLoading: boolean
  insufficientBudget: boolean
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {getPlayerName(player)}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge className={cn(
                  getPositionColor(player.position),
                  "w-24 justify-center"
                )}>
                  {player.position}
                </Badge>
                <Badge variant="outline" className="w-24 justify-center">
                  {player.team}
                </Badge>
                <Badge variant="secondary" className="w-16 justify-center">
                  {player.league}
                </Badge>
              </div>
            </div>
            <PlayerPrice player={player} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PlayerStat
              label="Form"
              value={player.form_rating}
              showProgress
              progressValue={player.form_rating * 10}
            />
            <PlayerStat
              label="Ownership"
              value={player.ownership_percent}
              showProgress
              progressValue={player.ownership_percent}
              suffix="%"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <PlayerStat
              label="Minutes"
              value={player.minutes_played}
              icon={Timer}
              compact
            />
            <PlayerStat
              label="Goals"
              value={player.goals_scored}
              icon={Goal}
              compact
            />
            <PlayerStat
              label="Assists"
              value={player.assists}
              icon={Star}
              compact
            />
          </div>

          <Button 
            className="w-full" 
            onClick={onSign}
            disabled={isLoading || insufficientBudget}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Sign Player
            {insufficientBudget && (
              <AlertTriangle className="h-4 w-4 ml-2 text-yellow-500" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Extract PlayerPrice component
function PlayerPrice({ player }: { player: TransferMarketPlayer }) {
  return (
    <div className="text-right shrink-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <div className="text-lg font-bold whitespace-nowrap">
              {formatNaira(player.current_price)}
            </div>
            {player.current_price !== player.base_price && (
              <div className="flex items-center justify-end gap-1 text-sm whitespace-nowrap">
                {player.current_price > player.base_price ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-green-500">
                      +{((player.current_price - player.base_price) / player.base_price * 100).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
                    <span className="text-red-500">
                      {((player.current_price - player.base_price) / player.base_price * 100).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Base Price: {formatNaira(player.base_price)}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

// Extract PlayerStat component
function PlayerStat({ 
  label, 
  value, 
  icon: Icon, 
  showProgress, 
  progressValue,
  suffix = '',
  compact = false
}: { 
  label: string
  value: number
  icon?: React.ComponentType<{ className?: string }>
  showProgress?: boolean
  progressValue?: number
  suffix?: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <div className="bg-muted rounded p-2">
        <div className="text-muted-foreground flex items-center gap-1">
          {Icon && <Icon className="h-3 w-3" />}
          {label}
        </div>
        <div className="font-medium">{value}</div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        {showProgress && (
          <Progress value={progressValue} className="h-2" />
        )}
        <span className="text-sm font-medium">
          {value?.toFixed(1)}{suffix}
        </span>
      </div>
    </div>
  )
}

// Extract SearchFilters component
function SearchFilters({
  searchQuery,
  onSearchChange,
  position,
  onPositionChange,
  league,
  onLeagueChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
  position: string
  onPositionChange: (value: string) => void
  league: string
  onLeagueChange: (value: string) => void
  sortBy: 'price' | 'form' | 'ownership'
  onSortByChange: (value: 'price' | 'form' | 'ownership') => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (value: 'asc' | 'desc') => void
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Select value={position} onValueChange={onPositionChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            {POSITIONS.map((pos) => (
              <SelectItem key={pos} value={pos}>
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={league} onValueChange={onLeagueChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="League" />
          </SelectTrigger>
          <SelectContent>
            {LEAGUES.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => onSortByChange(value as 'price' | 'form' | 'ownership')}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="form">Form</SelectItem>
            <SelectItem value="ownership">Ownership</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

// Main TransferMarket component
export function TransferMarket({ teamId, budget: initialBudget, onPlayerAdded }: TransferMarketProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [position, setPosition] = useState('All')
  const [league, setLeague] = useState('All')
  const [players, setPlayers] = useState<TransferMarketPlayer[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [sortBy, setSortBy] = useState<'price' | 'form' | 'ownership'>('price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loadingPlayerId, setLoadingPlayerId] = useState<string | null>(null)
  const [budget, setBudget] = useState(initialBudget)
  const supabase = createClientComponentClient<Database>()
  const { mutate: mutateSquad } = useSquadData(teamId)

  const totalPages = Math.ceil(totalPlayers / ITEMS_PER_PAGE)

  // Map frontend sort fields to database columns
  const getSortColumn = (sort: 'price' | 'form' | 'ownership') => {
    switch (sort) {
      case 'price':
        return 'current_price'
      case 'form':
        return 'form_rating'
      case 'ownership':
        return 'ownership_percent'
      default:
        return 'current_price'
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('players')
        .select('*', { count: 'exact' })
        .eq('is_available', true)  // Only show available players

      // Apply filters
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }

      if (position !== 'All' && isValidPosition(position)) {
        query = query.eq('position', position)
      }

      if (league !== 'All') {
        query = query.eq('league', league)
      }

      // Apply sorting with correct column name
      query = query.order(getSortColumn(sortBy), { ascending: sortOrder === 'asc' })
      
      // Apply pagination
      query = query.range(
        (currentPage - 1) * ITEMS_PER_PAGE, 
        currentPage * ITEMS_PER_PAGE - 1
      )

      const { data: players, count, error } = await query

      if (error) throw error

      setPlayers(players || [])
      setTotalPlayers(count || 0)
    } catch (error) {
      console.error('Error searching players:', error)
      toast({
        title: "Error",
        description: "Failed to search players",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Debounce the search to prevent too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
    handleSearch()
    }, 300) // Wait 300ms after last change before searching

    return () => clearTimeout(timer)
  }, [currentPage, sortBy, sortOrder, position, league, searchQuery])

  const handleSignPlayer = async (player: TransferMarketPlayer) => {
    if (player.current_price > budget) {
      toast({
        title: "Insufficient Budget",
        description: `You need ${formatNaira(player.current_price - budget)} more to sign ${player.name}`,
        variant: "destructive"
      })
      return
    }

    setLoadingPlayerId(player.id)

    try {
      console.log('Starting player signing process...', {
        teamId,
        playerId: player.id,
        price: player.current_price,
        timestamp: new Date().toISOString()
      })
      
      // First, verify the player is still available
      const { data: playerCheck, error: checkError } = await supabase
        .from('players')
        .select('is_available, current_price')
        .eq('id', player.id)
        .single()

      if (checkError) {
        console.error('Player check error:', checkError)
        throw new Error('Failed to verify player availability')
      }

      console.log('Player check result:', playerCheck)

      if (!playerCheck?.is_available) {
        // Remove player from local state if they're no longer available
        setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== player.id))
        toast({
          title: "Player Unavailable",
          description: "This player has already been signed by another team",
          variant: "destructive"
        })
        return
      }

      if (playerCheck.current_price !== player.current_price) {
        toast({
          title: "Price Changed",
          description: "The player's price has changed. Please try again.",
          variant: "destructive"
        })
        return
      }

      // Attempt to sign the player
      const { data: result, error } = await supabase.rpc('buy_player', {
          p_team_id: teamId,
          p_player_id: player.id,
          p_price: player.current_price
        })

      console.log('Buy player response:', { result, error })

      if (error) {
        console.error('Buy player error:', error)
        throw error
      }

      if (!result || !result.success) {
        console.error('Buy player failed:', result)
      toast({
          title: "Error",
          description: (result && result.error) || "Failed to sign player",
          variant: "destructive"
        })
        return
      }

      // Update the budget
      setBudget(result.new_budget)

      // Remove player from the list immediately
      setPlayers(prevPlayers => {
        const updatedPlayers = prevPlayers.filter(p => p.id !== player.id)
        console.log('Updated players list:', updatedPlayers.length)
        return updatedPlayers
      })

      // Notify parent component
      if (onPlayerAdded) {
        onPlayerAdded(player)
      }

      // Force immediate revalidation of squad data
      await mutateSquad()

      // Dispatch squad update event
      window.dispatchEvent(new CustomEvent('squadUpdate'))

      // Trigger a search refresh to ensure our list is up to date
      await handleSearch()

      toast({
        title: "Success",
        description: `${player.name} has been added to your squad`,
        variant: "default"
      })

      console.log('Player signed successfully:', {
        result,
        teamId,
        playerId: player.id,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error signing player:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign player. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingPlayerId(null)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Market</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              position={position}
              onPositionChange={setPosition}
              league={league}
              onLeagueChange={setLeague}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No players found</p>
              </div>
            ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onSign={() => handleSignPlayer(player)}
                    isLoading={loadingPlayerId === player.id}
                    insufficientBudget={player.current_price > budget}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                <span className="text-sm">
                    Page {currentPage} of {totalPages}
                </span>
                  <Button
                    variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
} 