'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Trophy, Users, Crown, TrendingUp, Star, ArrowLeft } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { LeagueChat } from '@/components/league/league-chat'
import { HeadToHead } from '@/components/league/head-to-head'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/database.types'

interface LeagueDetails {
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

interface DatabaseLeagueMember {
  user_id: string
  team_id: string
  joined_at: string
  team: {
    name: string
    user: {
      full_name: string
    }
  }
}

interface LeagueMember {
  user_id: string
  team_id: string
  joined_at: string
  team: {
    name: string
    user: {
      full_name: string
    }
  }
}

interface DatabaseTeam {
  name: string
  total_value: number
  users: Array<{
    full_name: string
  }>
}

interface DatabaseLeagueMember {
  user_id: string
  team_id: string
  total_points: number
  rank: number
  gameweek_points: number
  teams: DatabaseTeam
}

export default function LeagueDetailsPage({ params }: { params: { id: string } }) {
  const [league, setLeague] = useState<LeagueDetails | null>(null)
  const [members, setMembers] = useState<LeagueMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchLeagueDetails()
  }, [params.id])

  const fetchLeagueDetails = async () => {
    try {
      setIsLoading(true)

      // Fetch league details
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', params.id)
        .single()

      if (leagueError) {
        console.error('Error fetching league:', leagueError)
        toast({
          title: "Error",
          description: "Failed to fetch league details.",
          variant: "destructive",
        })
        return
      }

      // Fetch league members with their team and user details
      const { data, error: membersError } = await supabase
        .from('league_members')
        .select(`
          user_id,
          team_id,
          joined_at,
          teams (
            name,
            profiles:user_id (
              full_name
            )
          )
        `)
        .eq('league_id', params.id)
        .order('joined_at', { ascending: true })

      if (membersError) {
        console.error('Error fetching members:', membersError)
      } else if (data) {
        const membersData = data as any[]
        const typedMembers: LeagueMember[] = membersData.map(member => ({
          user_id: member.user_id,
          team_id: member.team_id,
          joined_at: member.joined_at,
          team: {
            name: member.teams.name,
            user: {
              full_name: member.teams.profiles.full_name
            }
          }
        }))
        setMembers(typedMembers)
      }

      setLeague(leagueData)
    } catch (error) {
      console.error('Error in fetchLeagueDetails:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading league details...</p>
        </div>
      </div>
    )
  }

  if (!league) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-muted-foreground">League not found.</p>
          <Button asChild>
            <Link href="/dashboard/leagues">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leagues
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/dashboard/leagues" 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Leagues
          </Link>
          <h1 className="text-3xl font-bold">{league.name}</h1>
          <p className="text-muted-foreground capitalize">{league.type} League</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              League Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Entry Fee</span>
              <span className="font-medium">₦{league.entry_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Prize Pool</span>
              <span className="font-medium text-[#008753]">₦{league.total_prize.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Teams</span>
              <span className="font-medium">{members.length} / {league.max_teams}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">{new Date(league.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">{new Date(league.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{league.status}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              League Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.team_id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{member.team.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Manager: {member.team.user.full_name}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No teams have joined this league yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

