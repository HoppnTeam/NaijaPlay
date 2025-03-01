'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PlayerPerformance } from '@/lib/database-schema'
import { useToast } from '@/components/ui/use-toast'
import { matchDataService } from '@/lib/services/match-data-service'
import { updatePlayerStatsLastUpdated } from '@/components/match/last-updated-indicator'

interface PlayerPerformanceListProps {
  performances: PlayerPerformance[]
}

export default function PlayerPerformanceList({ performances }: PlayerPerformanceListProps) {
  const [filteredPerformances, setFilteredPerformances] = useState<PlayerPerformance[]>(performances)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [leagueFilter, setLeagueFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    filterPerformances()
    // Set initial last updated time
    setLastUpdated(new Date())
  }, [searchQuery, positionFilter, leagueFilter, performances])

  const filterPerformances = () => {
    let filtered = [...performances]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(perf => {
        const playerName = `${perf.player?.first_name} ${perf.player?.last_name}`.toLowerCase()
        return playerName.includes(query)
      })
    }

    // Apply position filter
    if (positionFilter !== 'all') {
      filtered = filtered.filter(perf => perf.player?.position === positionFilter)
    }

    // Apply league filter
    if (leagueFilter !== 'all') {
      filtered = filtered.filter(perf => perf.player?.team?.league === leagueFilter)
    }

    setFilteredPerformances(filtered)
  }

  const refreshData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch the latest player statistics from the API
      const response = await fetch('/api/players/statistics')
      if (!response.ok) {
        throw new Error('Failed to fetch player statistics')
      }
      
      const data = await response.json()
      
      // Update player statistics in the database
      const result = await matchDataService.updatePlayerStatistics(data.players || [])
      
      if (result) {
        toast({
          title: 'Player Data Updated',
          description: 'Player statistics have been successfully updated with the latest match data.',
          variant: 'default',
          duration: 3000
        })
        
        // Update last updated time
        updatePlayerStatsLastUpdated()
        
        // Refresh the page to show updated data
        router.refresh()
      } else {
        toast({
          title: 'Update Failed',
          description: 'There was an error updating player statistics. Please try again.',
          variant: 'destructive',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Error refreshing player data:', error)
      toast({
        title: 'Update Failed',
        description: 'There was an error updating player statistics.',
        variant: 'destructive',
        duration: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPositionBadge = (position: string) => {
    switch (position) {
      case 'GK':
        return <Badge variant="outline" className="bg-yellow-100">GK</Badge>
      case 'DEF':
        return <Badge variant="outline" className="bg-blue-100">DEF</Badge>
      case 'MID':
        return <Badge variant="outline" className="bg-green-100">MID</Badge>
      case 'FWD':
        return <Badge variant="outline" className="bg-red-100">FWD</Badge>
      default:
        return <Badge variant="outline">{position}</Badge>
    }
  }

  const getPointsColor = (points: number) => {
    if (points >= 10) return 'text-green-600 font-bold'
    if (points >= 5) return 'text-green-500'
    if (points <= 0) return 'text-red-500'
    return 'text-gray-700'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search players..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="w-[180px]">
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
        
        <Select value={leagueFilter} onValueChange={setLeagueFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="League" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leagues</SelectItem>
            <SelectItem value="NPFL">NPFL</SelectItem>
            <SelectItem value="EPL">EPL</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={refreshData}
          disabled={isLoading}
          title="Refresh player data"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {lastUpdated && (
        <div className="text-xs text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
      
      {filteredPerformances.length === 0 ? (
        <div className="text-center p-8 border rounded-lg text-muted-foreground">
          No player performances match your filters.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Player</th>
                  <th className="text-center p-3 font-medium">Mins</th>
                  <th className="text-center p-3 font-medium">Goals</th>
                  <th className="text-center p-3 font-medium">Assists</th>
                  <th className="text-center p-3 font-medium">CS</th>
                  <th className="text-center p-3 font-medium">YC</th>
                  <th className="text-center p-3 font-medium">RC</th>
                  <th className="text-center p-3 font-medium">Saves</th>
                  <th className="text-center p-3 font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformances.map((performance) => (
                  <tr key={performance.id} className="border-t hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {performance.player?.image_url && (
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                            <img 
                              src={performance.player.image_url} 
                              alt={`${performance.player.first_name} ${performance.player.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {performance.player?.first_name} {performance.player?.last_name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {performance.player?.position && getPositionBadge(performance.player.position)}
                            <span>{performance.player?.team?.name}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">{performance.minutes_played}</td>
                    <td className="p-3 text-center">{performance.goals_scored}</td>
                    <td className="p-3 text-center">{performance.assists}</td>
                    <td className="p-3 text-center">{performance.clean_sheets}</td>
                    <td className="p-3 text-center">{performance.yellow_cards}</td>
                    <td className="p-3 text-center">{performance.red_cards}</td>
                    <td className="p-3 text-center">{performance.saves}</td>
                    <td className={`p-3 text-center ${getPointsColor(performance.points)}`}>
                      {performance.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
} 