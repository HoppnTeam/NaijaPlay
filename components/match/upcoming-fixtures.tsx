'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { format, parseISO } from 'date-fns'
import Image from 'next/image'

interface Fixture {
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
}

export function UpcomingFixtures() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [league, setLeague] = useState<string>('all')
  
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/matches/upcoming')
        
        if (!response.ok) {
          throw new Error('Failed to fetch upcoming fixtures')
        }
        
        const data = await response.json()
        setFixtures(data.fixtures || [])
      } catch (error) {
        console.error('Error fetching upcoming fixtures:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchFixtures()
  }, [])
  
  // Group fixtures by date
  const fixturesByDate = fixtures.reduce((acc, fixture) => {
    // Filter by league if needed
    if (league !== 'all' && fixture.league.id.toString() !== league) {
      return acc
    }
    
    const date = format(parseISO(fixture.fixture.date), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(fixture)
    return acc
  }, {} as Record<string, Fixture[]>)
  
  // Sort dates
  const sortedDates = Object.keys(fixturesByDate).sort()
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Upcoming Fixtures</h2>
        <Select value={league} onValueChange={setLeague}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select league" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leagues</SelectItem>
            <SelectItem value="332">Nigerian Premier League</SelectItem>
            <SelectItem value="39">English Premier League</SelectItem>
          </SelectContent>
        </Select>
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
            <p className="text-muted-foreground">No upcoming fixtures found.</p>
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
                {fixturesByDate[date].map((fixture) => (
                  <div 
                    key={fixture.fixture.id} 
                    className="flex items-center justify-between p-3 rounded-md border"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-end min-w-[120px]">
                        <span className="font-medium">{fixture.teams.home.name}</span>
                      </div>
                      <div className="h-8 w-8 relative">
                        <Image 
                          src={fixture.teams.home.logo || '/placeholder-team.png'} 
                          alt={fixture.teams.home.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="text-center px-4">
                      <div className="text-sm font-medium">
                        {format(parseISO(fixture.fixture.date), 'h:mm a')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fixture.fixture.venue.name}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 relative">
                        <Image 
                          src={fixture.teams.away.logo || '/placeholder-team.png'} 
                          alt={fixture.teams.away.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col items-start min-w-[120px]">
                        <span className="font-medium">{fixture.teams.away.name}</span>
                      </div>
                    </div>
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