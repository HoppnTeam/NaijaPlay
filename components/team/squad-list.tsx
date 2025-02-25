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
  Users
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
import { Squad, TeamPlayer, Player, isTeamPlayer, getPlayerName, isValidPosition } from '@/types/squad'

interface SquadListProps {
  teamId: string
  onSquadUpdate?: () => void
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

function PlayerCard({ teamPlayer }: { teamPlayer: TeamPlayer }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {getPlayerName(teamPlayer.player)}
                {teamPlayer.is_captain && (
                  <Star className="h-4 w-4 inline ml-1 text-yellow-500" />
                )}
                {teamPlayer.is_vice_captain && (
                  <StarHalf className="h-4 w-4 inline ml-1 text-yellow-500" />
                )}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="w-24 justify-center">
                  {teamPlayer.player.team}
                </Badge>
                <Badge variant="secondary" className="w-16 justify-center">
                  {teamPlayer.player.league}
                </Badge>
              </div>
            </div>
            <PlayerPrice player={teamPlayer.player} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PlayerStat
              label="Form"
              value={teamPlayer.player.form_rating}
              showProgress
              progressValue={teamPlayer.player.form_rating * 10}
            />
            <PlayerStat
              label="Ownership"
              value={teamPlayer.player.ownership_percent}
              showProgress
              progressValue={teamPlayer.player.ownership_percent}
              suffix="%"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <PlayerStat
              label="Minutes"
              value={teamPlayer.player.minutes_played}
              icon={Timer}
              compact
            />
            <PlayerStat
              label="Goals"
              value={teamPlayer.player.goals_scored}
              icon={Goal}
              compact
            />
            <PlayerStat
              label="Assists"
              value={teamPlayer.player.assists}
              icon={Star}
              compact
            />
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
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
          {players.map((teamPlayer) => (
            <PlayerCard key={teamPlayer.id} teamPlayer={teamPlayer} />
          ))}
        </div>
      </CardContent>
      </Card>
    )
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
    if (!isTeamPlayer(teamPlayer)) return acc
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