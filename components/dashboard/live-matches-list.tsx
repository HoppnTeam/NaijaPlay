'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Match } from '@/lib/database-schema'
import { useToast } from '@/components/ui/use-toast'
import { matchDataService } from '@/lib/services/match-data-service'
import { updatePlayerStatsLastUpdated } from '@/components/match/last-updated-indicator'

interface LiveMatchesListProps {
  matches: Match[]
}

export default function LiveMatchesList({ matches }: LiveMatchesListProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const router = useRouter()
  const { toast } = useToast()
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date())

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
        // Update last updated time
        updatePlayerStatsLastUpdated()
        
        toast({
          title: 'Match Data Updated',
          description: 'Match data has been successfully updated with the latest information.',
          variant: 'default',
          duration: 3000
        })
        
        // Refresh the page to show updated data
        router.refresh()
      } else {
        toast({
          title: 'Update Failed',
          description: 'There was an error updating match data. Please try again.',
          variant: 'destructive',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Error refreshing match data:', error)
      toast({
        title: 'Update Failed',
        description: 'There was an error updating match data.',
        variant: 'destructive',
        duration: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter matches based on active tab
  const filteredMatches = activeTab === 'all' 
    ? matches 
    : matches.filter(match => {
        if (activeTab === 'npfl') {
          // This is a placeholder - in a real app, you'd have a league property
          return match.home_team?.name.includes('Nigeria') || match.away_team?.name.includes('Nigeria')
        } else if (activeTab === 'epl') {
          return !match.home_team?.name.includes('Nigeria') && !match.away_team?.name.includes('Nigeria')
        }
        return true
      })

  // Helper function to generate a random minute for simulation
  const getRandomMinute = () => {
    return Math.floor(Math.random() * 90) + 1
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="all">All Matches</TabsTrigger>
            <TabsTrigger value="npfl">NPFL</TabsTrigger>
            <TabsTrigger value="epl">EPL</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleString()}
            </span>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {filteredMatches.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No live matches currently in progress.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredMatches.map((match) => (
            <LiveMatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}

function LiveMatchCard({ match }: { match: Match }) {
  // For simulation purposes, generate a random minute
  const matchMinute = getRandomMinute()
  
  // Format the match date
  const matchDate = new Date(match.match_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {matchMinute}'
          </Badge>
          <Badge variant="outline" className="text-xs bg-red-100">
            LIVE
          </Badge>
          <span className="text-xs text-muted-foreground">{matchDate}</span>
        </div>
        
        <div className="grid grid-cols-3 items-center gap-2">
          <div className="text-right">
            <p className="font-medium">{match.home_team?.name}</p>
          </div>
          
          <div className="flex justify-center items-center">
            <div className="text-center px-3 py-1 bg-muted rounded-md font-mono font-bold">
              {match.home_score} - {match.away_score}
            </div>
          </div>
          
          <div className="text-left">
            <p className="font-medium">{match.away_team?.name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to generate a random minute for simulation
function getRandomMinute() {
  return Math.floor(Math.random() * 90) + 1
} 