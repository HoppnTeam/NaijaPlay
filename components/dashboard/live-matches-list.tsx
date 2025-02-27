'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Match } from '@/lib/database-schema'

interface LiveMatchesListProps {
  matches: Match[]
}

export default function LiveMatchesList({ matches }: LiveMatchesListProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const router = useRouter()

  const refreshData = async () => {
    setIsLoading(true)
    // In a real implementation, this would fetch fresh data from the API
    // For now, we'll just simulate a refresh
    setTimeout(() => {
      router.refresh()
      setIsLoading(false)
    }, 1000)
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