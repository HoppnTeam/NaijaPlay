import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MatchDataHeader } from '@/components/match/match-data-header'
import { UpcomingFixtures } from '@/components/match/upcoming-fixtures'
import { MatchResults } from '@/components/match/match-results'
import { PlayerPerformance } from '@/components/match/player-performance'

export const metadata: Metadata = {
  title: 'Match Data | NaijaPlay Fantasy Football',
  description: 'View upcoming fixtures, match results, and player performance data',
}

export default async function MatchDataPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <MatchDataHeader />
      
      <Tabs defaultValue="player-performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="player-performance">Player Performance</TabsTrigger>
          <TabsTrigger value="upcoming-fixtures">Upcoming Fixtures</TabsTrigger>
          <TabsTrigger value="match-results">Match Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="player-performance" className="space-y-4">
          <PlayerPerformance />
        </TabsContent>
        
        <TabsContent value="upcoming-fixtures" className="space-y-4">
          <UpcomingFixtures />
        </TabsContent>
        
        <TabsContent value="match-results" className="space-y-4">
          <MatchResults />
        </TabsContent>
      </Tabs>
    </div>
  )
} 