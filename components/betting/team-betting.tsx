'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"

interface Team {
  id: string
  name: string
  points: number
}

interface TeamBettingProps {
  teams: Team[]
  gameweeks: number[]
  userBalance: number
}

export function TeamBetting({ teams, gameweeks, userBalance }: TeamBettingProps) {
  const [selectedTeam1, setSelectedTeam1] = useState<string>('')
  const [selectedTeam2, setSelectedTeam2] = useState<string>('')
  const [selectedGameweek, setSelectedGameweek] = useState<string>('')
  const [betAmount, setBetAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()

  const handlePlaceBet = async () => {
    if (!selectedTeam1 || !selectedTeam2 || !selectedGameweek || !betAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to place your bet",
        variant: "destructive"
      })
      return
    }

    const amount = parseFloat(betAmount)
    if (isNaN(amount) || amount < 500 || amount > 50000) {
      toast({
        title: "Invalid Bet Amount",
        description: "Bet amount must be between ₦500 and ₦50,000",
        variant: "destructive"
      })
      return
    }

    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to place this bet",
        variant: "destructive"
      })
      return
    }

    if (selectedTeam1 === selectedTeam2) {
      toast({
        title: "Invalid Selection",
        description: "Please select two different teams",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // TODO: Implement bet placement API call
      toast({
        title: "Bet Placed Successfully",
        description: "Good luck! Check the My Bets section to track your bet",
      })
      setBetAmount('')
      setSelectedTeam1('')
      setSelectedTeam2('')
      setSelectedGameweek('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team vs Team Betting</CardTitle>
        <CardDescription>Place bets on team matchups</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team 1</label>
            <Select value={selectedTeam1} onValueChange={setSelectedTeam1}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name} ({team.points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Team 2</label>
            <Select value={selectedTeam2} onValueChange={setSelectedTeam2}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name} ({team.points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gameweek</label>
          <Select value={selectedGameweek} onValueChange={setSelectedGameweek}>
            <SelectTrigger>
              <SelectValue placeholder="Select gameweek" />
            </SelectTrigger>
            <SelectContent>
              {gameweeks.map((gw) => (
                <SelectItem key={gw} value={gw.toString()}>
                  Gameweek {gw}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bet Amount (₦)</label>
          <Input
            type="number"
            min="500"
            max="50000"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Enter amount between ₦500 - ₦50,000"
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <span>Your Balance: {formatCurrency(userBalance)}</span>
          <span>Potential Win: {betAmount ? formatCurrency(parseFloat(betAmount) * 1.8) : '₦0'}</span>
        </div>

        <Button 
          className="w-full" 
          onClick={handlePlaceBet} 
          disabled={loading || !selectedTeam1 || !selectedTeam2 || !selectedGameweek || !betAmount}
        >
          {loading ? "Placing Bet..." : "Place Bet"}
        </Button>
      </CardContent>
    </Card>
  )
} 