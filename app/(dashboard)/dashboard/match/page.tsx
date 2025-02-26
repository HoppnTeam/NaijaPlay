'use client'

// This component handles the match page functionality
import { useEffect, useState, Suspense } from 'react'
import { LiveMatches } from '@/components/match/live-matches'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSquadData } from '@/hooks/use-squad-data'
import { useTeam } from '@/hooks/use-team'
import { Loader2 } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { MatchSimulator } from '@/components/match/match-simulator'
import { Skeleton } from '@/components/ui/skeleton'

type TeamWithPlayers = Database['public']['Tables']['teams']['Row'] & {
  team_players?: Array<{
    players: Database['public']['Tables']['players']['Row']
  }>
}

/**
 * Match Center Page
 * Shows live matches and match simulation
 */
export default function MatchPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Match Center</h1>
      </div>
      
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Matches</TabsTrigger>
          <TabsTrigger value="simulator">Match Simulator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live" className="space-y-4">
          <Suspense fallback={<MatchesSkeleton />}>
            <LiveMatches />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="simulator" className="space-y-4">
          <MatchSimulator />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MatchesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array(3).fill(0).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 