'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { Coins, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BudgetTopupProps {
  team: {
    id: string
    name: string
    budget: number
  }
  userTokens: number
  onSuccess?: () => void
}

export function BudgetTopup({ team, userTokens, onSuccess }: BudgetTopupProps) {
  const [tokenAmount, setTokenAmount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const supabase = createClientComponentClient()

  const handleSliderChange = (value: number[]) => {
    setTokenAmount(value[0])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= userTokens) {
      setTokenAmount(value)
    }
  }

  const handleTopup = async () => {
    if (tokenAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid token amount",
        variant: "destructive"
      })
      return
    }

    if (tokenAmount > userTokens) {
      toast({
        title: "Insufficient tokens",
        description: "You don't have enough tokens",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`/api/team/${team.id}/budget-topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tokenAmount })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to top up budget')
      }

      toast({
        title: "Budget topped up",
        description: `Successfully added ${formatCurrency(data.newBudget - team.budget)} to your team budget`,
        variant: "default"
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error topping up budget:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to top up budget',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const budgetIncrease = tokenAmount * 1_000_000

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Up Team Budget
        </CardTitle>
        <CardDescription>
          Use your tokens to increase your team's budget
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(team.budget)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Available Tokens</p>
            <p className="text-2xl font-bold flex items-center gap-1">
              <Coins className="h-5 w-5" />
              {userTokens}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="token-amount">Token Amount</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="token-amount"
                type="number"
                min={0}
                max={userTokens}
                value={tokenAmount}
                onChange={handleInputChange}
                className="w-24"
              />
              <Slider
                value={[tokenAmount]}
                min={0}
                max={userTokens}
                step={1}
                onValueChange={handleSliderChange}
                className="flex-1"
                disabled={userTokens === 0}
              />
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Budget Increase</span>
              <span className="font-bold">{formatCurrency(budgetIncrease)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium">New Budget</span>
              <span className="font-bold">{formatCurrency(team.budget + budgetIncrease)}</span>
            </div>
          </div>

          {userTokens === 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">No tokens available</p>
                <p className="mt-1">Purchase tokens or earn them through daily logins and challenges.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTopup} 
          disabled={tokenAmount <= 0 || tokenAmount > userTokens || isLoading}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Top Up Budget"}
        </Button>
      </CardFooter>
    </Card>
  )
} 