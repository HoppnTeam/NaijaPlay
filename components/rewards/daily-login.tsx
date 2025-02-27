'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Calendar, Gift, Coins, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useTokens } from '@/hooks/use-tokens'

interface DailyReward {
  day: number
  tokens: number
  claimed: boolean
  available: boolean
  date: string | null
}

interface DailyLoginProps {
  onRewardClaimed?: () => void
}

export function DailyLogin({ onRewardClaimed }: DailyLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>([])
  const [nextRewardTime, setNextRewardTime] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<string>('')
  const { mutate } = useTokens()

  useEffect(() => {
    fetchDailyRewards()
  }, [])

  useEffect(() => {
    if (nextRewardTime) {
      const timer = setInterval(() => {
        updateCountdown()
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [nextRewardTime])

  const updateCountdown = () => {
    if (!nextRewardTime) return
    
    const now = new Date()
    const target = new Date(nextRewardTime)
    const diff = target.getTime() - now.getTime()
    
    if (diff <= 0) {
      setCountdown('Available now!')
      fetchDailyRewards() // Refresh data when countdown reaches zero
      return
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
  }

  const fetchDailyRewards = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/rewards/daily-login')
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily rewards')
      }
      
      const data = await response.json()
      setDailyRewards(data.rewards || [])
      
      if (data.nextRewardTime) {
        setNextRewardTime(data.nextRewardTime)
        updateCountdown()
      } else {
        setNextRewardTime(null)
        setCountdown('')
      }
    } catch (error) {
      console.error('Error fetching daily rewards:', error)
      toast({
        title: "Error",
        description: "Failed to load daily login rewards",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaimReward = async () => {
    try {
      setIsClaiming(true)
      
      const response = await fetch('/api/rewards/daily-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim reward')
      }
      
      toast({
        title: "Daily Reward Claimed!",
        description: `You received ${data.tokens_awarded} tokens`,
        variant: "default"
      })
      
      // Refresh rewards data
      fetchDailyRewards()
      
      // Refresh token data
      mutate()
      
      if (onRewardClaimed) {
        onRewardClaimed()
      }
    } catch (error: any) {
      console.error('Error claiming daily reward:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to claim daily reward',
        variant: "destructive"
      })
    } finally {
      setIsClaiming(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not claimed'
    
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Login Rewards
          </CardTitle>
          <CardDescription>
            Log in daily to earn token rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Loading rewards...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const availableReward = dailyRewards.find(reward => reward.available && !reward.claimed)
  const hasAvailableReward = !!availableReward

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Login Rewards
        </CardTitle>
        <CardDescription>
          Log in daily to earn token rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hasAvailableReward ? (
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
              <Gift className="h-12 w-12 text-amber-500 mb-2" />
              <h3 className="text-lg font-medium">Day {availableReward.day} Reward</h3>
              <div className="flex items-center gap-1 text-amber-500 my-2">
                <Coins className="h-5 w-5" />
                <span className="text-xl font-bold">{availableReward.tokens}</span>
              </div>
              <Button 
                onClick={handleClaimReward}
                disabled={isClaiming}
                className="mt-2 w-full"
              >
                {isClaiming ? "Claiming..." : "Claim Reward"}
              </Button>
            </div>
          ) : nextRewardTime ? (
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">Next Reward</h3>
              <p className="text-sm text-muted-foreground mb-2">Available in</p>
              <div className="text-xl font-mono font-bold">{countdown}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">All Rewards Claimed</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Check back tomorrow for more rewards
              </p>
            </div>
          )}

          <div className="grid grid-cols-7 gap-2 mt-4">
            {dailyRewards.map((reward) => (
              <div 
                key={reward.day}
                className={`flex flex-col items-center p-2 rounded-md border ${
                  reward.claimed 
                    ? 'bg-green-50 border-green-200' 
                    : reward.available 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-muted/30 border-muted'
                }`}
              >
                <span className="text-xs font-medium">Day</span>
                <span className="font-bold">{reward.day}</span>
                <div className="flex items-center gap-0.5 my-1">
                  <Coins className="h-3 w-3 text-amber-500" />
                  <span className="text-xs font-medium">{reward.tokens}</span>
                </div>
                {reward.claimed ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                ) : (
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {reward.available ? 'Available' : 'Locked'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 