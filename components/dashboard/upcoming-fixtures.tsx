'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Match } from '@/lib/database-schema'

interface UpcomingFixturesProps {
  matches: Match[]
}

export default function UpcomingFixtures({ matches }: UpcomingFixturesProps) {
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

  // Group matches by date
  const groupedMatches = filteredMatches.reduce((groups, match) => {
    const date = new Date(match.match_date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    
    if (!groups[date]) {
      groups[date] = []
    }
    
    groups[date].push(match)
    return groups
  }, {} as Record<string, Match[]>)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="all">All Fixtures</TabsTrigger>
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
          No upcoming fixtures scheduled.
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMatches).map(([date, dateMatches]) => (
            <div key={date} className="space-y-2">
              <h3 className="flex items-center gap-2 font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {date}
              </h3>
              
              <div className="grid gap-3">
                {dateMatches.map((match) => (
                  <FixtureCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FixtureCard({ match }: { match: Match }) {
  const matchTime = new Date(match.match_date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">{match.home_team?.name}</p>
          </div>
          
          <div className="mx-4 text-center">
            <Badge variant="outline" className="font-mono">
              {matchTime}
            </Badge>
          </div>
          
          <div className="flex-1 text-right">
            <p className="font-medium">{match.away_team?.name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 