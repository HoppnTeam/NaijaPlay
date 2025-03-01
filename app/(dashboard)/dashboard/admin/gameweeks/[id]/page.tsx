import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Play, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

interface GameweekDetailsPageProps {
  params: {
    id: string
  }
}

export default async function GameweekDetailsPage({ params }: GameweekDetailsPageProps) {
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

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch gameweek details
  const { data: gameweek, error } = await supabase
    .from('gameweeks')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !gameweek) {
    redirect('/dashboard/admin/gameweeks')
  }

  // Fetch matches for this gameweek
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id,
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
    .eq('gameweek_id', params.id)
    .order('match_date', { ascending: true })

  // Fetch player stats for this gameweek
  const { data: playerStats } = await supabase
    .from('player_gameweek_stats')
    .select(`
      id,
      player_id,
      minutes_played,
      goals_scored,
      assists,
      clean_sheets,
      goals_conceded,
      yellow_cards,
      red_cards,
      saves,
      points,
      players:players!player_id (
        id,
        first_name,
        last_name,
        position
      )
    `)
    .eq('gameweek_id', params.id)
    .order('points', { ascending: false })
    .limit(10)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="warning" className="ml-2"><Clock className="h-3 w-3 mr-1" /> Upcoming</Badge>
      case 'in_progress':
        return <Badge variant="tertiary" className="ml-2"><Play className="h-3 w-3 mr-1" /> In Progress</Badge>
      case 'completed':
        return <Badge variant="success" className="ml-2"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/dashboard/admin/gameweeks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gameweeks
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          Gameweek {gameweek.number}
          {getStatusBadge(gameweek.status)}
        </h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gameweek Details</CardTitle>
            <CardDescription>
              {formatDate(gameweek.start_date)} - {formatDate(gameweek.end_date)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <span className="text-sm">{gameweek.status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Start Date:</span>
                <span className="text-sm">{formatDate(gameweek.start_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">End Date:</span>
                <span className="text-sm">{formatDate(gameweek.end_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Matches:</span>
                <span className="text-sm">{matches?.length || 0}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/dashboard/admin/gameweeks/${params.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Gameweek
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Players with the highest points this gameweek
            </CardDescription>
          </CardHeader>
          <CardContent>
            {playerStats && playerStats.length > 0 ? (
              <div className="space-y-2">
                {playerStats.slice(0, 5).map((stat) => (
                  <div key={stat.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {stat.players?.position}
                      </Badge>
                      <span>{stat.players?.first_name} {stat.players?.last_name}</span>
                    </div>
                    <span className="font-bold">{stat.points} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No player statistics available for this gameweek
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Matches</CardTitle>
          <CardDescription>
            All matches scheduled for this gameweek
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matches && matches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => (
                <Card key={match.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {new Date(match.match_date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-right flex-1">
                          <div className="font-semibold">{match.home_team?.name}</div>
                        </div>
                        <div className="mx-2 font-bold text-lg">
                          {match.status === 'completed' ? (
                            <span>{match.home_score} - {match.away_score}</span>
                          ) : (
                            <span>vs</span>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold">{match.away_team?.name}</div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {match.status === 'scheduled' ? 'Upcoming' : 
                         match.status === 'in_progress' ? 'Live' : 'Completed'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No matches scheduled for this gameweek
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 