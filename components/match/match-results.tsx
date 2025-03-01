'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, parseISO, subDays } from 'date-fns'
import Image from 'next/image'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MatchResult {
  fixture: {
    id: number
    date: string
    timestamp: number
    timezone: string
    status: {
      long: string
      short: string
      elapsed: number | null
    }
    venue: {
      id: number
      name: string
      city: string
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    season: number
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
    away: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: {
      home: number | null
      away: number | null
    }
    fulltime: {
      home: number | null
      away: number | null
    }
  }
  events?: Array<{
    time: {
      elapsed: number
      extra?: number | null
    }
    team: {
      id: number
      name: string
      logo: string
    }
    player: {
      id: number
      name: string
    }
    assist: {
      id: number | null
      name: string | null
    }
    type: string
    detail: string
  }>
}

export function MatchResults() {
  const [results, setResults] = useState<MatchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [league, setLeague] = useState<string>('all')
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null)
  const [timeframe, setTimeframe] = useState<string>('7days')
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        
        // Calculate date range based on timeframe
        const today = new Date()
        let fromDate: Date
        
        switch (timeframe) {
          case '7days':
            fromDate = subDays(today, 7)
            break
          case '14days':
            fromDate = subDays(today, 14)
            break
          case '30days':
            fromDate = subDays(today, 30)
            break
          default:
            fromDate = subDays(today, 7)
        }
        
        const from = format(fromDate, 'yyyy-MM-dd')
        const to = format(today, 'yyyy-MM-dd')
        
        const response = await fetch(`/api/matches/results?from=${from}&to=${to}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch match results')
        }
        
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error('Error fetching match results:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchResults()
  }, [timeframe])
  
  // Filter results by league
  const filteredResults = league === 'all' 
    ? results 
    : results.filter(result => result.league.id.toString() === league)
  
  // Group results by date
  const resultsByDate = filteredResults.reduce((acc, result) => {
    const date = format(parseISO(result.fixture.date), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(result)
    return acc
  }, {} as Record<string, MatchResult[]>)
  
  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(resultsByDate).sort().reverse()
  
  const toggleMatchExpansion = (fixtureId: number) => {
    if (expandedMatch === fixtureId) {
      setExpandedMatch(null)
    } else {
      setExpandedMatch(fixtureId)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl font-semibold">Match Results</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="14days">Last 14 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={league} onValueChange={setLeague}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select league" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              <SelectItem value="332">Nigerian Premier League</SelectItem>
              <SelectItem value="39">English Premier League</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedDates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No match results found for the selected criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resultsByDate[date].map((result) => (
                  <div key={result.fixture.id} className="rounded-md border overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleMatchExpansion(result.fixture.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col items-end min-w-[120px]">
                          <span className="font-medium">{result.teams.home.name}</span>
                        </div>
                        <div className="h-8 w-8 relative">
                          <Image 
                            src={result.teams.home.logo || '/placeholder-team.png'} 
                            alt={result.teams.home.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      
                      <div className="text-center px-4">
                        <div className="text-lg font-bold">
                          {result.goals.home} - {result.goals.away}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Final
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 relative">
                          <Image 
                            src={result.teams.away.logo || '/placeholder-team.png'} 
                            alt={result.teams.away.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-col items-start min-w-[120px]">
                          <span className="font-medium">{result.teams.away.name}</span>
                        </div>
                      </div>
                      
                      <div className="ml-2">
                        {expandedMatch === result.fixture.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    
                    {expandedMatch === result.fixture.id && (
                      <div className="p-3 border-t bg-muted/20">
                        <Tabs defaultValue="events">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="events">Match Events</TabsTrigger>
                            <TabsTrigger value="stats">Player Stats</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="events" className="pt-4">
                            {!result.events || result.events.length === 0 ? (
                              <p className="text-center text-muted-foreground py-2">No events recorded for this match.</p>
                            ) : (
                              <div className="space-y-2">
                                {result.events.map((event, index) => (
                                  <div key={index} className="flex items-start space-x-3 py-1">
                                    <div className="text-sm font-medium w-12 text-right">
                                      {event.time.elapsed}'
                                      {event.time.extra && <span>+{event.time.extra}</span>}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center">
                                        <span className="font-medium">{event.player.name}</span>
                                        {event.assist.name && (
                                          <span className="text-sm text-muted-foreground ml-1">
                                            (assist: {event.assist.name})
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {event.type} - {event.detail}
                                      </div>
                                    </div>
                                    <div className="text-sm">
                                      {event.team.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="stats" className="pt-4">
                            <p className="text-center text-muted-foreground py-2">
                              Player statistics will be available here. This data will be used to update player ratings in the fantasy football game.
                            </p>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 