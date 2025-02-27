'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, CheckCircle2, TrendingUp, Award, Users } from "lucide-react"
import NairaSign from '@/components/icons/NairaSign'
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface LeagueOwnerIncentivesProps {
  leagueId: string
  userId: string
  onUpdate?: () => void
}

interface Incentive {
  id: string
  league_id: string
  owner_id: string
  incentive_type: string
  amount: number
  description: string
  is_claimed: boolean
  created_at: string
  updated_at: string
}

export function LeagueOwnerIncentives({ leagueId, userId, onUpdate }: LeagueOwnerIncentivesProps) {
  const [incentives, setIncentives] = useState<Incentive[]>([])
  const [leagueData, setLeagueData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isClaiming, setIsClaiming] = useState<boolean>(false)
  const [incentiveBalance, setIncentiveBalance] = useState<number>(0)
  
  const { toast } = useToast()
  
  useEffect(() => {
    fetchIncentives()
    fetchLeagueData()
    fetchUserProfile()
  }, [leagueId, userId])
  
  const fetchIncentives = async () => {
    try {
      const { data, error } = await supabase
        .from('league_owner_incentives')
        .select('*')
        .eq('league_id', leagueId)
        .eq('owner_id', userId)
        .order('incentive_type', { ascending: true })
      
      if (error) throw error
      
      setIncentives(data || [])
    } catch (error) {
      console.error('Error fetching incentives:', error)
      toast({
        title: 'Error',
        description: 'Failed to load incentive data',
        variant: 'destructive'
      })
    }
  }
  
  const fetchLeagueData = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select(`
          *,
          league_members:league_members(count)
        `)
        .eq('id', leagueId)
        .single()
      
      if (error) throw error
      
      setLeagueData(data)
    } catch (error) {
      console.error('Error fetching league data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('incentive_balance')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      setIncentiveBalance(data?.incentive_balance || 0)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }
  
  const handleClaimIncentives = async () => {
    try {
      setIsClaiming(true)
      
      const { data, error } = await supabase
        .rpc('claim_league_owner_incentives', {
          p_league_id: leagueId
        })
      
      if (error) throw error
      
      const claimedAmount = data || 0
      
      toast({
        title: 'Incentives Claimed',
        description: `${formatNaira(claimedAmount)} has been added to your balance`,
        variant: 'default'
      })
      
      // Refresh data
      fetchIncentives()
      fetchUserProfile()
      
      if (onUpdate) {
        onUpdate()
      }
    } catch (error: any) {
      console.error('Error claiming incentives:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim incentives',
        variant: 'destructive'
      })
    } finally {
      setIsClaiming(false)
    }
  }
  
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  const getTotalIncentives = () => {
    return incentives.reduce((total, incentive) => {
      return total + (incentive.is_claimed ? 0 : incentive.amount)
    }, 0)
  }
  
  const getIncentiveIcon = (type: string) => {
    switch (type) {
      case 'base_commission':
        return <NairaSign className="h-5 w-5 text-green-500" />
      case 'activity_bonus':
        return <Users className="h-5 w-5 text-blue-500" />
      case 'referral_bonus':
        return <TrendingUp className="h-5 w-5 text-purple-500" />
      default:
        return <Award className="h-5 w-5 text-amber-500" />
    }
  }
  
  const getIncentiveTitle = (type: string) => {
    switch (type) {
      case 'base_commission':
        return 'Base Commission'
      case 'activity_bonus':
        return 'Activity Bonus'
      case 'referral_bonus':
        return 'Referral Bonus'
      default:
        return 'Bonus'
    }
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>League Owner Incentives</CardTitle>
          <CardDescription>Loading incentive data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }
  
  const totalIncentives = getTotalIncentives()
  const hasUnclaimedIncentives = totalIncentives > 0
  const memberCount = leagueData?.league_members?.[0]?.count || 0
  const maxTeams = leagueData?.max_teams || 0
  const fillPercentage = Math.min(100, Math.round((memberCount / maxTeams) * 100))
  const isNearlyFull = fillPercentage >= 75
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5 text-primary" />
          League Owner Incentives
        </CardTitle>
        <CardDescription>Earn rewards for managing your league</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">League Participation</h3>
            <span className="text-sm text-muted-foreground">{memberCount} / {maxTeams} members</span>
          </div>
          <Progress value={fillPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {isNearlyFull 
              ? '75%+ filled - Eligible for activity bonus!' 
              : `Fill your league to ${Math.ceil(maxTeams * 0.75)} members to unlock activity bonus`}
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Available Incentives</h3>
          
          {incentives.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No incentives yet</AlertTitle>
              <AlertDescription>
                Incentives will appear here as your league grows and members join.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {incentives.map((incentive) => (
                <div 
                  key={incentive.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center">
                    {getIncentiveIcon(incentive.incentive_type)}
                    <div className="ml-3">
                      <h4 className="text-sm font-medium">{getIncentiveTitle(incentive.incentive_type)}</h4>
                      <p className="text-xs text-muted-foreground">{incentive.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">{formatNaira(incentive.amount)}</span>
                    {incentive.is_claimed && (
                      <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Your Incentive Balance</h3>
            <span className="font-bold">{formatNaira(incentiveBalance)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Unclaimed Incentives</h3>
            <span className="font-bold">{formatNaira(totalIncentives)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          disabled={!hasUnclaimedIncentives || isClaiming}
          onClick={handleClaimIncentives}
        >
          {isClaiming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Claiming...
            </>
          ) : (
            <>
              {hasUnclaimedIncentives ? 'Claim Incentives' : 'No Incentives to Claim'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 