'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Coins, TrendingUp, AlertCircle } from 'lucide-react'
import { useTokens } from '@/hooks/use-tokens'
import { formatCurrency } from '@/lib/utils'

interface BudgetTopUpProps {
  teamId: string
  currentBudget: number
  onTopUpComplete?: () => void
}

// Define conversion rate: 1 token = 0.5 million budget
const TOKEN_TO_BUDGET_RATE = 0.5

export function BudgetTopUp({ teamId, currentBudget, onTopUpComplete }: BudgetTopUpProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [tokensToUse, setTokensToUse] = useState<number>(10)
  const { tokens, mutate } = useTokens()

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setTokensToUse(value)
    }
  }

  const getBudgetIncrease = () => {
    return tokensToUse * TOKEN_TO_BUDGET_RATE
  }

  const getNewBudget = () => {
    return currentBudget + getBudgetIncrease()
  }

  const handleTopUp = async () => {
    if (tokensToUse <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number of tokens to use",
        variant: "destructive"
      })
      return
    }

    if (tokensToUse > tokens) {
      toast({
        title: "Insufficient tokens",
        description: "You don't have enough tokens for this top-up",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/team/${teamId}/budget-top-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tokens: tokensToUse })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to top up budget')
      }
      
      toast({
        title: "Budget Increased!",
        description: `You've added ${formatCurrency(data.budget_increase)} to your team budget`,
        variant: "default"
      })
      
      // Refresh token data
      mutate()
      
      if (onTopUpComplete) {
        onTopUpComplete()
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Budget Top-Up
        </CardTitle>
        <CardDescription>
          Use your tokens to increase your team budget
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Current Budget</p>
            <p className="text-xl font-bold">{formatCurrency(currentBudget)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Available Tokens</p>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="text-xl font-bold">{tokens}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tokens">Tokens to use</Label>
          <Input
            id="tokens"
            type="number"
            min="0"
            max={tokens}
            value={tokensToUse}
            onChange={handleTokenChange}
          />
          <p className="text-sm text-muted-foreground">
            {tokensToUse} tokens = {formatCurrency(getBudgetIncrease())} budget increase
          </p>
        </div>

        <div className="rounded-lg border p-4 bg-muted/30">
          <div className="flex justify-between items-center">
            <span className="font-medium">New Budget</span>
            <span className="font-bold text-green-600">{formatCurrency(getNewBudget())}</span>
          </div>
        </div>

        {tokens === 0 && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">You need to purchase tokens first</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTopUp} 
          disabled={isLoading || tokensToUse <= 0 || tokensToUse > tokens}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Top Up Budget"}
        </Button>
      </CardFooter>
    </Card>
  )
} 