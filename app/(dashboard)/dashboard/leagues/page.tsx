'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/components/ui/use-toast'
import type { Database } from '@/lib/database.types'
import { useRouter } from 'next/navigation'
import { JoinLeagueDialog } from '@/components/league/join-league-dialog'

interface League {
  id: string
  name: string
  type: 'NPFL' | 'EPL'
  max_teams: number
  entry_fee: number
  total_prize: number
  start_date: string
  end_date: string
  status: 'upcoming' | 'active' | 'completed'
  created_by: string
  created_at: string
}

interface LeagueMember {
  league_id: string
  team_id: string
  user_id: string
  joined_at: string
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [myLeagues, setMyLeagues] = useState<LeagueMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null)
  const [showJoinDialog, setShowJoinDialog] = useState(false)

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all leagues with creator information
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select(`
          id, 
          name, 
          type, 
          max_teams, 
          entry_fee, 
          total_prize, 
          start_date, 
          end_date, 
          status,
          created_by,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (leaguesError) {
        console.error('Error fetching leagues:', leaguesError)
        toast({
          title: "Error",
          description: "Failed to fetch leagues.",
          variant: "destructive",
        })
        return
      }

      // Fetch user's league memberships
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: memberships, error: membershipError } = await supabase
    .from('league_members')
          .select('league_id, team_id, user_id, joined_at')
          .eq('user_id', user.id)

        if (membershipError) {
          console.error('Error fetching memberships:', membershipError)
        } else {
          setMyLeagues(memberships || [])
        }
      }

      setLeagues(leaguesData || [])
    } catch (error) {
      console.error('Error in fetchLeagues:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinLeague = (league: League) => {
    setSelectedLeague(league)
    setShowJoinDialog(true)
  }

  const handleLeagueClick = (leagueId: string) => {
    router.push(`/dashboard/leagues/${leagueId}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading leagues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fantasy Leagues</h1>
        <Link href="/dashboard/leagues/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create League
          </Button>
        </Link>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NPFL Leagues */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            NPFL Leagues
          </h2>
          <p className="text-muted-foreground mb-4">Nigeria Professional Football League competitions</p>
          <div className="space-y-4">
            {leagues
              .filter(league => league.type === 'NPFL')
              .map(league => (
                <div key={league.id} className="block">
                  <div 
                    className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:bg-accent/50 group relative"
                    onClick={() => handleLeagueClick(league.id)}
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{league.name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm">
                            <Users className="h-4 w-4 inline mr-1" />
                            {league.max_teams} teams max
                          </p>
                          <p className="text-sm">
                            Entry: ₦{league.entry_fee.toLocaleString()}
                          </p>
                          <p className="text-sm text-[#008753]">
                            Prize: ₦{league.total_prize.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <p>Starts: {new Date(league.start_date).toLocaleDateString()}</p>
                          <p>Ends: {new Date(league.end_date).toLocaleDateString()}</p>
                          <p className="capitalize">Status: {league.status}</p>
                        </div>
                      </div>
                      {myLeagues.some(ml => ml.league_id === league.id) ? (
                        <Button 
                          variant="outline" 
                          className="relative z-10 hover:bg-primary hover:text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/leagues/${league.id}`);
                          }}
                        >
                          View League
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          className="relative z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinLeague(league);
                          }}
                          disabled={league.status !== 'upcoming'}
                        >
                          Join League
                </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            {leagues.filter(league => league.type === 'NPFL').length === 0 && (
              <p className="text-center text-muted-foreground py-4">No NPFL leagues available at the moment.</p>
            )}
          </div>
        </div>

        {/* EPL Leagues */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            EPL Leagues
          </h2>
          <p className="text-muted-foreground mb-4">English Premier League competitions</p>
          <div className="space-y-4">
            {leagues
              .filter(league => league.type === 'EPL')
              .map(league => (
                <div key={league.id} className="block">
                  <div 
                    className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:bg-accent/50 group relative"
                    onClick={() => handleLeagueClick(league.id)}
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{league.name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm">
                            <Users className="h-4 w-4 inline mr-1" />
                            {league.max_teams} teams max
                          </p>
                          <p className="text-sm">
                            Entry: ₦{league.entry_fee.toLocaleString()}
                          </p>
                          <p className="text-sm text-[#008753]">
                            Prize: ₦{league.total_prize.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <p>Starts: {new Date(league.start_date).toLocaleDateString()}</p>
                          <p>Ends: {new Date(league.end_date).toLocaleDateString()}</p>
                          <p className="capitalize">Status: {league.status}</p>
                        </div>
                      </div>
                      {myLeagues.some(ml => ml.league_id === league.id) ? (
                        <Button 
                          variant="outline" 
                          className="relative z-10 hover:bg-primary hover:text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/leagues/${league.id}`);
                          }}
                        >
                          View League
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          className="relative z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinLeague(league);
                          }}
                          disabled={league.status !== 'upcoming'}
                        >
                          Join League
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            {leagues.filter(league => league.type === 'EPL').length === 0 && (
              <p className="text-center text-muted-foreground py-4">No EPL leagues available at the moment.</p>
            )}
          </div>
        </div>
      </div>

      {selectedLeague && (
        <JoinLeagueDialog
          league={selectedLeague}
          isOpen={showJoinDialog}
          onClose={() => {
            setShowJoinDialog(false)
            setSelectedLeague(null)
          }}
          onSuccess={() => {
            fetchLeagues()
            setShowJoinDialog(false)
            setSelectedLeague(null)
          }}
        />
      )}
    </div>
  )
}

