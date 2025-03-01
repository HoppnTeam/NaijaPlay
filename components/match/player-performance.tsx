'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface PlayerStats {
  player: {
    id: number
    name: string
    photo: string
  }
  statistics: Array<{
    team: {
      id: number
      name: string
      logo: string
    }
    league: {
      id: number
      name: string
      country: string
      logo: string
      season: number
    }
    games: {
      minutes: number
      position: string
      rating: string
      captain: boolean
    }
    shots: {
      total: number
      on: number
    }
    goals: {
      total: number
      assists: number
    }
    passes: {
      total: number
      key: number
      accuracy: number
    }
    tackles: {
      total: number
      blocks: number
      interceptions: number
    }
    duels: {
      total: number
      won: number
    }
    dribbles: {
      attempts: number
      success: number
    }
    fouls: {
      drawn: number
      committed: number
    }
    cards: {
      yellow: number
      red: number
    }
  }>
}

export function PlayerPerformance() {
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [position, setPosition] = useState('all')
  const [league, setLeague] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  useEffect(() => {
    fetchPlayerStats()
  }, [])
  
  const fetchPlayerStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/players/statistics')
      
      if (!response.ok) {
        throw new Error('Failed to fetch player statistics')
      }
      
      const data = await response.json()
      setPlayers(data.players || [])
    } catch (error) {
      console.error('Error fetching player statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchPlayerStats()
    setIsRefreshing(false)
  }
  
  // Filter players based on search, position, and league
  const filteredPlayers = players.filter(playerStat => {
    const playerName = playerStat.player.name.toLowerCase()
    const searchMatch = searchQuery === '' || playerName.includes(searchQuery.toLowerCase())
    
    const positionMatch = position === 'all' || 
      playerStat.statistics.some(stat => {
        if (position === 'GK') return stat.games.position === 'Goalkeeper'
        if (position === 'DEF') return stat.games.position === 'Defender'
        if (position === 'MID') return stat.games.position === 'Midfielder'
        if (position === 'FWD') return stat.games.position === 'Attacker'
        return true
      })
    
    const leagueMatch = league === 'all' || 
      playerStat.statistics.some(stat => stat.league.id.toString() === league)
    
    return searchMatch && positionMatch && leagueMatch
  })
  
  // Calculate fantasy points based on player statistics
  const calculateFantasyPoints = (stat: PlayerStats['statistics'][0]) => {
    let points = 0
    
    // Points for minutes played
    if (stat.games.minutes >= 60) points += 2
    else if (stat.games.minutes > 0) points += 1
    
    // Points for goals
    if (stat.games.position === 'Goalkeeper' || stat.games.position === 'Defender') {
      points += stat.goals.total * 6
    } else if (stat.games.position === 'Midfielder') {
      points += stat.goals.total * 5
    } else {
      points += stat.goals.total * 4
    }
    
    // Points for assists
    points += stat.goals.assists * 3
    
    // Points for clean sheets
    if ((stat.games.position === 'Goalkeeper' || stat.games.position === 'Defender') && 
        stat.games.minutes >= 60) {
      // Assuming clean sheet if player has high rating
      if (parseFloat(stat.games.rating) >= 7.0) points += 4
    }
    
    // Negative points for cards
    points -= stat.cards.yellow * 1
    points -= stat.cards.red * 3
    
    return points
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl font-semibold">Player Performance</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-9"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            <SelectItem value="GK">Goalkeeper</SelectItem>
            <SelectItem value="DEF">Defender</SelectItem>
            <SelectItem value="MID">Midfielder</SelectItem>
            <SelectItem value="FWD">Forward</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={league} onValueChange={setLeague}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="League" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leagues</SelectItem>
            <SelectItem value="332">NPFL</SelectItem>
            <SelectItem value="39">EPL</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <div className="p-4">
              <Skeleton className="h-8 w-full mb-4" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredPlayers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No players found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Player</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Pos</TableHead>
                    <TableHead className="text-right">MP</TableHead>
                    <TableHead className="text-right">Goals</TableHead>
                    <TableHead className="text-right">Assists</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">YC</TableHead>
                    <TableHead className="text-right">RC</TableHead>
                    <TableHead className="text-right">FP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((playerStat) => {
                    // Use the first statistic entry for display
                    const stat = playerStat.statistics[0]
                    if (!stat) return null
                    
                    return (
                      <TableRow key={playerStat.player.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 relative rounded-full overflow-hidden">
                              <Image 
                                src={playerStat.player.photo || '/placeholder-player.png'} 
                                alt={playerStat.player.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span>{playerStat.player.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <div className="h-4 w-4 relative">
                              <Image 
                                src={stat.team.logo || '/placeholder-team.png'} 
                                alt={stat.team.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span className="text-sm">{stat.team.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{stat.games.position.substring(0, 3)}</TableCell>
                        <TableCell className="text-right">{stat.games.minutes}</TableCell>
                        <TableCell className="text-right">{stat.goals.total}</TableCell>
                        <TableCell className="text-right">{stat.goals.assists}</TableCell>
                        <TableCell className="text-right">{stat.games.rating}</TableCell>
                        <TableCell className="text-right">{stat.cards.yellow}</TableCell>
                        <TableCell className="text-right">{stat.cards.red}</TableCell>
                        <TableCell className="text-right font-bold">{calculateFantasyPoints(stat)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 