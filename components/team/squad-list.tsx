'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  StarHalf, 
  Tag, 
  AlertCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Loader2,
  Timer,
  Goal,
  ShieldCheck,
  Award,
  Percent,
  DollarSign,
  Users,
  UserCheck,
  UserX,
  Crown,
  Ban
} from "lucide-react"
import { useSquadData } from '@/hooks/use-squad-data'
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Player as ImportedPlayer,
  TeamPlayer as ImportedTeamPlayer,
  POSITION_REQUIREMENTS, 
  SQUAD_SIZE_LIMIT,
  getPlayerName,
  isValidPosition
} from '@/types/squad'

interface SquadListProps {
  teamId: string
  onSquadUpdate?: () => void
}

// Extend the imported interfaces to ensure all required properties are available
interface Player extends ImportedPlayer {
  name: string
  position: string
  team: string
  league: string
  current_price: number
  form_rating: number
  ownership_percent: number
  minutes_played: number
  goals_scored: number
  assists: number
}

interface TeamPlayer extends ImportedTeamPlayer {
  id: string
  player: Player
  is_captain?: boolean
  is_vice_captain?: boolean
  is_for_sale?: boolean
  is_starting?: boolean
  purchase_price: number
}

interface PlayerCardProps {
  player: TeamPlayer
  onToggleRole: (id: string, role: string, value: boolean) => void
  onToggleSale: (id: string, value: boolean) => void
  onToggleCaptain: (id: string) => void
  isLoading: boolean
}

interface Squad {
  team: any
  players: TeamPlayer[]
  squadRequirements: {
    isComplete: boolean
    missing: string[]
  }
}

function SquadRequirements({ requirements }: { requirements: Squad['squadRequirements'] }) {
  if (requirements.isComplete) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Incomplete Squad
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Your squad needs:</p>
            <ul className="list-disc list-inside mt-1">
              {requirements.missing.map((requirement: string) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerPrice({ player }: { player: Player }) {
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

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

function PlayerCard({ 
  player, 
  onToggleRole, 
  onToggleSale, 
  onToggleCaptain, 
  isLoading 
}: PlayerCardProps) {
  const { player: playerData, is_captain, is_vice_captain, is_for_sale, purchase_price } = player
  const isCaptain = is_captain || false
  const isViceCaptain = is_vice_captain || false
  const isForSale = is_for_sale || false
  const isStarting = player.is_starting !== false // Default to true if undefined

  return (
    <Card className={cn(
      "transition-all duration-200",
      isStarting ? "border-primary" : "border-muted",
      isLoading && "opacity-50 pointer-events-none"
    )}>
      <CardContent className="p-2 xs:p-3 sm:p-4">
        <div className="space-y-2 xs:space-y-3 sm:space-y-4">
          <div className="flex items-start justify-between gap-1 xs:gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm xs:text-base sm:text-lg truncate">
                {playerData.name}
              </h3>
              <div className="flex flex-wrap items-center gap-0.5 xs:gap-1 sm:gap-2 mt-0.5 xs:mt-1">
                <Badge className={cn(
                  getPositionColor(playerData.position),
                  "text-[10px] xs:text-xs sm:text-sm px-1 py-0 xs:py-0.5"
                )}>
                  {playerData.position}
                </Badge>
                <Badge variant="outline" className="text-[10px] xs:text-xs sm:text-sm px-1 py-0 xs:py-0.5">
                  {playerData.team}
                </Badge>
                <Badge variant="secondary" className="text-[10px] xs:text-xs sm:text-sm px-1 py-0 xs:py-0.5">
                  {playerData.league}
                </Badge>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm xs:text-base sm:text-lg font-bold whitespace-nowrap">
                {formatNaira(playerData.current_price)}
              </div>
              {playerData.current_price !== purchase_price && (
                <div className="flex items-center justify-end gap-0.5 xs:gap-1 text-[10px] xs:text-xs sm:text-sm whitespace-nowrap">
                  {playerData.current_price > purchase_price ? (
                    <>
                      <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4 text-green-500 shrink-0" />
                      <span className="text-green-500">
                        +{((playerData.current_price - purchase_price) / purchase_price * 100).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 xs:h-4 xs:w-4 text-red-500 shrink-0" />
                      <span className="text-red-500">
                        {((playerData.current_price - purchase_price) / purchase_price * 100).toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
            <div>
              <p className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground">Form</p>
              <div className="flex items-center gap-1 xs:gap-2">
                <Progress value={playerData.form_rating * 10} className="h-1.5 xs:h-2" />
                <span className="text-[10px] xs:text-xs sm:text-sm font-medium">
                  {playerData.form_rating?.toFixed(1)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground">Ownership</p>
              <div className="flex items-center gap-1 xs:gap-2">
                <Progress value={playerData.ownership_percent} className="h-1.5 xs:h-2" />
                <span className="text-[10px] xs:text-xs sm:text-sm font-medium">
                  {playerData.ownership_percent?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-[10px] xs:text-xs">
            <div className="bg-muted rounded p-1 xs:p-1.5 sm:p-2">
              <div className="text-muted-foreground flex items-center gap-0.5 xs:gap-1 text-[9px] xs:text-[10px] sm:text-xs">
                <Timer className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3" />
                Minutes
              </div>
              <div className="font-medium text-[10px] xs:text-xs sm:text-sm">{playerData.minutes_played}</div>
            </div>
            <div className="bg-muted rounded p-1 xs:p-1.5 sm:p-2">
              <div className="text-muted-foreground flex items-center gap-0.5 xs:gap-1 text-[9px] xs:text-[10px] sm:text-xs">
                <Goal className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3" />
                Goals
              </div>
              <div className="font-medium text-[10px] xs:text-xs sm:text-sm">{playerData.goals_scored}</div>
            </div>
            <div className="bg-muted rounded p-1 xs:p-1.5 sm:p-2">
              <div className="text-muted-foreground flex items-center gap-0.5 xs:gap-1 text-[9px] xs:text-[10px] sm:text-xs">
                <Star className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3" />
                Assists
              </div>
              <div className="font-medium text-[10px] xs:text-xs sm:text-sm">{playerData.assists}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-2">
            <Button 
              variant={isStarting ? "default" : "outline"} 
              size="sm"
              className="h-7 xs:h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm flex-1"
              onClick={() => onToggleRole(player.id, 'starting', !isStarting)}
            >
              {isStarting ? (
                <>
                  <UserCheck className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 mr-1 xs:mr-1.5 sm:mr-2" />
                  Starting
                </>
              ) : (
                <>
                  <UserX className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 mr-1 xs:mr-1.5 sm:mr-2" />
                  Substitute
                </>
              )}
            </Button>
            <Button 
              variant={isCaptain ? "default" : (isViceCaptain ? "secondary" : "outline")} 
              size="sm"
              className="h-7 xs:h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm flex-1"
              onClick={() => onToggleCaptain(player.id)}
            >
              <Crown className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 mr-1 xs:mr-1.5 sm:mr-2" />
              {isCaptain ? 'Captain' : (isViceCaptain ? 'Vice' : 'Make C/VC')}
            </Button>
            <Button 
              variant={isForSale ? "destructive" : "outline"} 
              size="sm"
              className="h-7 xs:h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm flex-1"
              onClick={() => onToggleSale(player.id, !isForSale)}
            >
              {isForSale ? (
                <>
                  <Ban className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 mr-1 xs:mr-1.5 sm:mr-2" />
                  Cancel Sale
                </>
              ) : (
                <>
                  <DollarSign className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 mr-1 xs:mr-1.5 sm:mr-2" />
                  List for Sale
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PositionGroup({ position, players }: { position: string, players: TeamPlayer[] }) {
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Goalkeeper': return 'bg-yellow-500'
      case 'Defender': return 'bg-blue-500'
      case 'Midfielder': return 'bg-green-500'
      case 'Forward': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center justify-between">
          <Badge className={cn(
            getPositionColor(position),
            "w-24 justify-center"
          )}>
            {position}s
          </Badge>
          <span className="text-sm text-muted-foreground">
            ({players.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <PlayerCard 
              key={player.id} 
              player={player}
              onToggleRole={() => {}}
              onToggleSale={() => {}}
              onToggleCaptain={() => {}}
              isLoading={false}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

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

// Type guard for our extended TeamPlayer interface
function isExtendedTeamPlayer(value: any): value is TeamPlayer {
  return value && 
    typeof value.id === 'string' &&
    typeof value.player === 'object' &&
    typeof value.player.name === 'string'
}

export function SquadList({ teamId, onSquadUpdate }: SquadListProps) {
  const { data: squadData, error, mutate } = useSquadData(teamId)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (error) {
      console.error('Squad data error:', error)
      toast({
        title: "Error",
        description: "Failed to load squad data",
        variant: "destructive"
      })
    }
  }, [error, toast])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        await mutate()
        console.log('Squad data refreshed')
      } catch (error) {
        console.error('Error refreshing squad data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [mutate])

  // Listen for squad updates
  useEffect(() => {
    const handleSquadUpdate = async () => {
      console.log('Squad update detected, refreshing data...')
      setIsLoading(true)
      try {
        await mutate()
        console.log('Squad data refreshed after update')
        if (onSquadUpdate) {
          onSquadUpdate()
        }
      } catch (error) {
        console.error('Error refreshing squad data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    window.addEventListener('squadUpdate', handleSquadUpdate)
    return () => window.removeEventListener('squadUpdate', handleSquadUpdate)
  }, [mutate, onSquadUpdate])

  if (isLoading || !squadData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  const { players, squadRequirements } = squadData

  if (!players || players.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No players in squad</p>
        <p className="text-sm text-muted-foreground mt-2">
          Use the transfer market to sign players
            </p>
          </div>
    )
  }

  console.log('Rendering squad list with players:', players.length)

  const groupedPlayers = players.reduce<Record<string, TeamPlayer[]>>((acc, teamPlayer) => {
    if (!isExtendedTeamPlayer(teamPlayer)) return acc
    const position = teamPlayer.player?.position
    if (position && isValidPosition(position)) {
      if (!acc[position]) {
        acc[position] = []
      }
      acc[position].push(teamPlayer)
    }
    return acc
  }, {})

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <SquadRequirements requirements={squadRequirements} />
        {positions.map((position) => (
          <PositionGroup
            key={position}
            position={position}
            players={groupedPlayers[position] || []}
          />
        ))}
      </div>
    </TooltipProvider>
  )
} 