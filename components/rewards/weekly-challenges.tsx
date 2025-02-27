'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Trophy, Coins, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useTokens } from '@/hooks/use-tokens'

interface Challenge {
  id: string
  title: string
  description: string
  reward_tokens: number
  start_date: string
  end_date: string
  is_active: boolean
  user_progress: number
  max_progress: number
  is_completed: boolean
  is_claimed: boolean
}

interface WeeklyChallengesProps {
  onRewardClaimed?: () => void
}

export function WeeklyChallenges({ onRewardClaimed }: WeeklyChallengesProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState<string | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const { mutate } = useTokens()

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/rewards/weekly-challenges')
      
      if (!response.ok) {
        throw new Error('Failed to fetch challenges')
      }
      
      const data = await response.json()
      setChallenges(data.challenges || [])
    } catch (error) {
      console.error('Error fetching challenges:', error)
      toast({
        title: "Error",
        description: "Failed to load weekly challenges",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaimReward = async (challengeId: string) => {
    try {
      setIsClaiming(challengeId)
      
      const response = await fetch('/api/rewards/weekly-challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ challengeId })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim reward')
      }
      
      toast({
        title: "Reward Claimed!",
        description: `You received ${data.tokens_awarded} tokens`,
        variant: "default"
      })
      
      // Update challenge status
      setChallenges(prev => 
        prev.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, is_claimed: true } 
            : challenge
        )
      )
      
      // Refresh token data
      mutate()
      
      if (onRewardClaimed) {
        onRewardClaimed()
      }
    } catch (error: any) {
      console.error('Error claiming reward:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to claim reward',
        variant: "destructive"
      })
    } finally {
      setIsClaiming(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Weekly Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges to earn token rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Loading challenges...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Weekly Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges to earn token rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>No active challenges this week</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Weekly Challenges
        </CardTitle>
        <CardDescription>
          Complete challenges to earn token rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {challenges.map(challenge => (
          <div key={challenge.id} className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{challenge.title}</h4>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Coins className="h-4 w-4" />
                <span className="font-bold">{challenge.reward_tokens}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Progress: {challenge.user_progress}/{challenge.max_progress}</span>
                <span className="text-muted-foreground">
                  {getDaysRemaining(challenge.end_date)} days left
                </span>
              </div>
              <Progress 
                value={(challenge.user_progress / challenge.max_progress) * 100} 
                className={challenge.is_completed ? "bg-green-100" : ""}
              />
            </div>
            
            <div className="flex justify-end">
              {challenge.is_claimed ? (
                <Button variant="outline" disabled className="text-green-500">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Claimed
                </Button>
              ) : challenge.is_completed ? (
                <Button 
                  onClick={() => handleClaimReward(challenge.id)}
                  disabled={isClaiming === challenge.id}
                >
                  {isClaiming === challenge.id ? "Claiming..." : "Claim Reward"}
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  In Progress
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 