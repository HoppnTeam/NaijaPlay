import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import PlayerPerformanceList from "@/components/dashboard/player-performance-list"
import LiveMatchesList from "@/components/dashboard/live-matches-list"
import UpcomingFixtures from "@/components/dashboard/upcoming-fixtures"
import { MatchDataIntegration } from "@/components/match/match-data-integration"
import { LastUpdatedIndicator } from "@/components/match/last-updated-indicator"
import { GameweekMatchIntegration } from "@/components/match/gameweek-match-integration"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
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

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Initialize error states
  let performancesError = null;
  let liveMatchesError = null;
  let fixturesError = null;

  // Fetch player performances from player_gameweek_stats table
  const { data: rawPlayerPerformances, error: perfError } = await supabase
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

  if (perfError) {
    console.error('Error fetching player performances:', perfError);
    performancesError = perfError.message;
  }

  // Create player performances array
  const playerPerformances: PlayerPerformance[] = !perfError && rawPlayerPerformances ? 
    rawPlayerPerformances.map(perf => {
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
    }) : [];

  // Fetch live matches
  const { data: rawLiveMatches, error: liveError } = await supabase
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

  if (liveError) {
    console.error('Error fetching live matches:', liveError);
    liveMatchesError = liveError.message;
  }

  // Transform live matches using our helper function
  const liveMatches: Match[] = !liveError && rawLiveMatches ? 
    rawLiveMatches.map(match => transformMatch(match as SupabaseMatch)) : [];

  // Fetch upcoming fixtures
  const { data: rawUpcomingFixtures, error: fixturesErr } = await supabase
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

  if (fixturesErr) {
    console.error('Error fetching upcoming fixtures:', fixturesErr);
    fixturesError = fixturesErr.message;
  }

  // Transform upcoming fixtures using our helper function
  const upcomingFixtures: Match[] = !fixturesErr && rawUpcomingFixtures ? 
    rawUpcomingFixtures.map(match => transformMatch(match as SupabaseMatch)) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Match Simulation</h2>
        <p className="text-muted-foreground">
          View live match data, player performances, and upcoming fixtures.
        </p>
      </div>

      {isAdmin && (
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <MatchDataIntegration />
          <GameweekMatchIntegration />
        </div>
      )}
      
      <div className="mb-4">
        <LastUpdatedIndicator />
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
              {performancesError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load player performances: {performancesError}
                  </AlertDescription>
                </Alert>
              ) : playerPerformances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No player performance data available.
                </div>
              ) : (
                <PlayerPerformanceList performances={playerPerformances} />
              )}
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
              {liveMatchesError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load live matches: {liveMatchesError}
                  </AlertDescription>
                </Alert>
              ) : liveMatches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No live matches currently in progress.
                </div>
              ) : (
                <LiveMatchesList matches={liveMatches} />
              )}
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
              {fixturesError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load upcoming fixtures: {fixturesError}
                  </AlertDescription>
                </Alert>
              ) : upcomingFixtures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming fixtures scheduled.
                </div>
              ) : (
                <UpcomingFixtures matches={upcomingFixtures} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 