'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Trophy, Settings, Users, Calendar, DollarSign } from 'lucide-react'
import { LeagueLeaderboard } from '@/components/leagues/league-leaderboard'
import Link from 'next/link'

interface LeagueDetailPageProps {
  params: {
    id: string
  }
}

export default function LeagueDetailPage({ params }: LeagueDetailPageProps) {
  const { id: leagueId } = params
  const [league, setLeague] = useState<any>(null)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  const { toast } = useToast()
  
  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        // Get league data
        const { data, error } = await supabase
          .from('leagues')
          .select('*, teams(*)')
          .eq('id', leagueId)
          .single()
        
        if (error) throw error
        
        setLeague(data)
        
        if (user) {
          setIsOwner(data.owner_id === user.id)
        }
      } catch (error) {
        console.error('Error fetching league data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load league data',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLeagueData()
  }, [leagueId])
  
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>League Details</CardTitle>
            <CardDescription>Loading league data...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
  
  if (!league) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>League Not Found</CardTitle>
            <CardDescription>The league you are looking for does not exist or you do not have access.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/leagues">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leagues
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Calculate prize pool
  const basePrize = league.total_prize || 0
  const additionalPrize = league.additional_prize_amount || 0
  const totalPrizePool = basePrize + additionalPrize
  
  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-2">
              <Link href="/dashboard/leagues">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leagues
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{league.name}</h1>
            <p className="text-muted-foreground">{league.description}</p>
          </div>
          
          {isOwner && (
            <Button asChild>
              <Link href={`/dashboard/leagues/${leagueId}/manage`}>
                <Settings className="mr-2 h-4 w-4" />
                Manage League
              </Link>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{league.teams?.length || 0} / {league.max_teams}</div>
              <p className="text-xs text-muted-foreground">
                {league.max_teams - (league.teams?.length || 0)} spots remaining
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNaira(totalPrizePool)}</div>
              <p className="text-xs text-muted-foreground">
                Entry Fee: {formatNaira(league.entry_fee || 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(league.start_date).toLocaleDateString()} - {new Date(league.end_date).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.ceil((new Date(league.end_date).getTime() - new Date(league.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="prizes">Prizes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leaderboard" className="mt-6">
            <LeagueLeaderboard 
              leagueId={leagueId}
              showPotentialEarnings={true}
            />
          </TabsContent>
          
          <TabsContent value="teams" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>Teams participating in this league</CardDescription>
              </CardHeader>
              <CardContent>
                {league.teams && league.teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {league.teams.map((team: any) => (
                      <Card key={team.id} className="overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          {team.logo_url ? (
                            <img 
                              src={team.logo_url} 
                              alt={team.name} 
                              className="h-16 w-16 rounded-full object-cover border-2 border-white"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                              {team.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <CardContent className="pt-4">
                          <h3 className="font-bold text-center">{team.name}</h3>
                          <p className="text-sm text-muted-foreground text-center">
                            {team.formation || 'No formation set'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">No teams have joined this league yet.</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button asChild>
                  <Link href={`/dashboard/teams/create?league=${leagueId}`}>
                    Join League with a Team
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="prizes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Prize Information</CardTitle>
                <CardDescription>Prize pool and distribution details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Prize Pool</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Base Prize</p>
                        <p className="text-lg font-bold">{formatNaira(basePrize)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Additional Prize</p>
                        <p className="text-lg font-bold">{formatNaira(additionalPrize)}</p>
                      </div>
                      <div className="space-y-1 col-span-2 pt-2 border-t">
                        <p className="text-sm font-medium">Total Prize Pool</p>
                        <p className="text-xl font-bold">{formatNaira(totalPrizePool)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Prize Distribution</h3>
                    <PrizeDistributionTable leagueId={leagueId} totalPrizePool={totalPrizePool} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function PrizeDistributionTable({ leagueId, totalPrizePool }: { leagueId: string, totalPrizePool: number }) {
  const [distributions, setDistributions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFinalized, setIsFinalized] = useState<boolean>(false)
  
  useEffect(() => {
    const fetchPrizeDistribution = async () => {
      try {
        // Get prize distribution status
        const { data: leagueData, error: leagueError } = await supabase
          .from('leagues')
          .select('prize_distribution_finalized')
          .eq('id', leagueId)
          .single()
        
        if (leagueError) throw leagueError
        
        if (leagueData) {
          setIsFinalized(leagueData.prize_distribution_finalized || false)
        }
        
        // Get prize distribution
        const { data, error } = await supabase
          .from('league_prize_distribution')
          .select('*')
          .eq('league_id', leagueId)
          .order('position', { ascending: true })
        
        if (error) throw error
        
        if (data && data.length > 0) {
          setDistributions(data)
        } else {
          // If no custom distribution, fetch default template
          const { data: templateData, error: templateError } = await supabase
            .from('prize_distribution_templates')
            .select('*')
            .eq('is_default', true)
            .single()
          
          if (templateError) throw templateError
          
          if (templateData) {
            const positions = Array.isArray(templateData.positions) 
              ? templateData.positions 
              : JSON.parse(templateData.positions)
            
            setDistributions(positions)
          }
        }
      } catch (error) {
        console.error('Error fetching prize distribution:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPrizeDistribution()
  }, [leagueId])
  
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  const getOrdinalSuffix = (i: number) => {
    const j = i % 10,
          k = i % 100
    if (j === 1 && k !== 11) {
      return 'st'
    }
    if (j === 2 && k !== 12) {
      return 'nd'
    }
    if (j === 3 && k !== 13) {
      return 'rd'
    }
    return 'th'
  }
  
  const getPositionLabel = (position: number) => {
    return `${position}${getOrdinalSuffix(position)} Place`
  }
  
  if (isLoading) {
    return <p className="text-center py-4">Loading prize distribution...</p>
  }
  
  if (distributions.length === 0) {
    return <p className="text-center py-4">No prize distribution information available.</p>
  }
  
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Position</th>
              <th className="text-right py-2">Percentage</th>
              <th className="text-right py-2">Prize Amount</th>
            </tr>
          </thead>
          <tbody>
            {distributions.map((dist: any) => (
              <tr key={dist.position} className="border-b">
                <td className="py-2">{dist.description || getPositionLabel(dist.position)}</td>
                <td className="text-right py-2">{dist.percentage}%</td>
                <td className="text-right py-2 font-medium">
                  {formatNaira((dist.percentage / 100) * totalPrizePool)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {!isFinalized && (
        <p className="text-sm text-yellow-500 italic">
          * Prize distribution has not been finalized by the league owner and may change.
        </p>
      )}
    </div>
  )
}

