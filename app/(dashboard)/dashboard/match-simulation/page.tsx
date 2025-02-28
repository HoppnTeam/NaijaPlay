import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import PlayerPerformanceList from "@/components/dashboard/player-performance-list"
import LiveMatchesList from "@/components/dashboard/live-matches-list"
import UpcomingFixtures from "@/components/dashboard/upcoming-fixtures"
import { 
  SupabasePlayerPerformance, 
  SupabaseMatch, 
  transformPlayerPerformance, 
  transformMatch,
  PlayerPerformance,
  Match
} from "@/lib/database-schema"

export default async function MatchSimulationPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch player performances from player_gameweek_stats table
  const { data: rawPlayerPerformances, error: performancesError } = await supabase
    .from('player_gameweek_stats')
    .select(`
      id,
      player_id,
      gameweek_id,
      team_id,
      minutes_played,
      goals_scored,
      assists,
      clean_sheets,
      goals_conceded,
      yellow_cards,
      red_cards,
      saves,
      points,
      players!player_id (
        id,
        first_name,
        last_name,
        position,
        team_id,
        image_url
      ),
      teams!team_id (
        id,
        name,
        league
      )
    `)
    .order('id', { ascending: false })
    .limit(50)

  // Create player performances array
  const playerPerformances: PlayerPerformance[] = rawPlayerPerformances?.map(perf => {
    const player = perf.players && Array.isArray(perf.players) && perf.players.length > 0 
      ? perf.players[0] 
      : null;
    
    const team = perf.teams && Array.isArray(perf.teams) && perf.teams.length > 0 
      ? perf.teams[0] 
      : null;
    
    return {
      id: perf.id,
      player_id: perf.player_id,
      match_id: '', // Not available in player_gameweek_stats
      gameweek_id: perf.gameweek_id,
      minutes_played: perf.minutes_played || 0,
      goals_scored: perf.goals_scored || 0,
      assists: perf.assists || 0,
      clean_sheets: perf.clean_sheets || 0,
      goals_conceded: perf.goals_conceded || 0,
      yellow_cards: perf.yellow_cards || 0,
      red_cards: perf.red_cards || 0,
      saves: perf.saves || 0,
      points: perf.points || 0,
      player: player ? {
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        position: player.position,
        team_id: player.team_id,
        image_url: player.image_url,
        team: team ? {
          id: team.id,
          name: team.name,
          league: team.league
        } : undefined
      } : undefined
    };
  }) || [];

  // Fetch live matches
  const { data: rawLiveMatches, error: liveMatchesError } = await supabase
    .from('matches')
    .select(`
      id,
      gameweek_id,
      home_team_id,
      away_team_id,
      match_date,
      status,
      home_score,
      away_score,
      home_team: teams!home_team_id (
        id,
        name
      ),
      away_team: teams!away_team_id (
        id,
        name
      )
    `)
    .eq('status', 'in_progress')

  // Transform live matches using our helper function
  const liveMatches: Match[] = rawLiveMatches?.map(match => 
    transformMatch(match as SupabaseMatch)
  ) || [];

  // Fetch upcoming fixtures
  const { data: rawUpcomingFixtures, error: fixturesError } = await supabase
    .from('matches')
    .select(`
      id,
      gameweek_id,
      home_team_id,
      away_team_id,
      match_date,
      status,
      home_score,
      away_score,
      home_team: teams!home_team_id (
        id,
        name
      ),
      away_team: teams!away_team_id (
        id,
        name
      )
    `)
    .eq('status', 'scheduled')
    .gte('match_date', new Date().toISOString())
    .order('match_date', { ascending: true })
    .limit(20)

  // Transform upcoming fixtures using our helper function
  const upcomingFixtures: Match[] = rawUpcomingFixtures?.map(match => 
    transformMatch(match as SupabaseMatch)
  ) || [];

  if (performancesError) {
    console.error('Error fetching player performances:', performancesError);
  }
  
  if (liveMatchesError) {
    console.error('Error fetching live matches:', liveMatchesError);
  }
  
  if (fixturesError) {
    console.error('Error fetching upcoming fixtures:', fixturesError);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Match Simulation</h2>
        <p className="text-muted-foreground">
          View live match data, player performances, and upcoming fixtures.
        </p>
      </div>

      <Tabs defaultValue="player-performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="player-performance">Player Performance</TabsTrigger>
          <TabsTrigger value="live-matches">Live Matches</TabsTrigger>
          <TabsTrigger value="upcoming-fixtures">Upcoming Fixtures</TabsTrigger>
        </TabsList>
        
        <TabsContent value="player-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Player Performance</CardTitle>
              <CardDescription>
                View and filter player performance data from recent matches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerPerformanceList performances={playerPerformances} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="live-matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Matches</CardTitle>
              <CardDescription>
                View live match scores and updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveMatchesList matches={liveMatches} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming-fixtures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Fixtures</CardTitle>
              <CardDescription>
                View upcoming matches and fixtures.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingFixtures matches={upcomingFixtures} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 