'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { PrizeDistributionConfig } from '@/components/leagues/prize-distribution-config'
import { PrizePoolFunding } from '@/components/leagues/prize-pool-funding'
import { LeagueLeaderboard } from '@/components/leagues/league-leaderboard'
import { LeagueOwnerIncentives } from '@/components/leagues/league-owner-incentives'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Trophy, Wallet, Users, Settings, Gift } from 'lucide-react'
import Link from 'next/link'

interface LeagueManagePageProps {
  params: {
    id: string
  }
}

export default function LeagueManagePage({ params }: LeagueManagePageProps) {
  const { id: leagueId } = params
  const [league, setLeague] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>('prize-distribution')
  
  const { toast } = useToast()
  
  useEffect(() => {
    const fetchUserAndLeague = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUserId(user.id)
          
          // Get league data
          const { data: leagueData, error: leagueError } = await supabase
            .from('leagues')
            .select('*, teams(*)')
            .eq('id', leagueId)
            .single()
          
          if (leagueError) throw leagueError
          
          setLeague(leagueData)
          setIsOwner(leagueData.owner_id === user.id)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load league data',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserAndLeague()
  }, [leagueId])
  
  const handleRefreshLeague = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*, teams(*)')
        .eq('id', leagueId)
        .single()
      
      if (error) throw error
      
      setLeague(data)
    } catch (error) {
      console.error('Error refreshing league data:', error)
    }
  }
  
  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>League Management</CardTitle>
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
  
  if (!isOwner) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to manage this league.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/dashboard/leagues/${leagueId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to League
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-2">
              <Link href={`/dashboard/leagues/${leagueId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to League
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{league.name}</h1>
            <p className="text-muted-foreground">League Management</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="prize-distribution" className="flex items-center">
              <Trophy className="mr-2 h-4 w-4" />
              Prize Distribution
            </TabsTrigger>
            <TabsTrigger value="prize-funding" className="flex items-center">
              <Wallet className="mr-2 h-4 w-4" />
              Prize Funding
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="incentives" className="flex items-center">
              <Gift className="mr-2 h-4 w-4" />
              Incentives
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="prize-distribution" className="mt-6">
            <PrizeDistributionConfig 
              leagueId={leagueId}
              totalPrize={league.total_prize || 0}
              entryFee={league.entry_fee || 0}
              maxTeams={league.max_teams || 0}
              onUpdate={handleRefreshLeague}
            />
          </TabsContent>
          
          <TabsContent value="prize-funding" className="mt-6">
            {userId && (
              <PrizePoolFunding 
                leagueId={leagueId}
                userId={userId}
                onUpdate={handleRefreshLeague}
              />
            )}
          </TabsContent>
          
          <TabsContent value="leaderboard" className="mt-6">
            <LeagueLeaderboard 
              leagueId={leagueId}
              showPotentialEarnings={true}
            />
          </TabsContent>
          
          <TabsContent value="incentives" className="mt-6">
            {userId && (
              <LeagueOwnerIncentives 
                leagueId={leagueId}
                userId={userId}
              />
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>League Settings</CardTitle>
                <CardDescription>Manage your league settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">League Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">League Name</p>
                        <p className="text-lg">{league.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Start Date</p>
                        <p className="text-lg">{new Date(league.start_date).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">End Date</p>
                        <p className="text-lg">{new Date(league.end_date).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Max Teams</p>
                        <p className="text-lg">{league.max_teams}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Financial Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Entry Fee</p>
                        <p className="text-lg">₦{league.entry_fee?.toLocaleString() || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Total Prize</p>
                        <p className="text-lg">₦{league.total_prize?.toLocaleString() || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Additional Prize</p>
                        <p className="text-lg">₦{league.additional_prize_amount?.toLocaleString() || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Platform Fee</p>
                        <p className="text-lg">₦{(league.platform_fee || 0).toLocaleString()}</p>
                      </div>
                    </div>
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