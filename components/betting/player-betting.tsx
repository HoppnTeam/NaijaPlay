'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"

interface Player {
  id: string
  name: string
  team: string
  position: string
  goals: number
  assists: number
  clean_sheets: number
}

interface PlayerBettingProps {
  players: Player[]
  gameweeks: number[]
  userBalance: number
}

const METRICS = [
  { id: 'goals', label: 'Goals Scored' },
  { id: 'assists', label: 'Assists' },
  { id: 'clean_sheets', label: 'Clean Sheets' }
]

export function PlayerBetting({ players, gameweeks, userBalance }: PlayerBettingProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [selectedMetric, setSelectedMetric] = useState<string>('')
  const [selectedGameweek, setSelectedGameweek] = useState<string>('')
  const [prediction, setPrediction] = useState<string>('')
  const [betAmount, setBetAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()

  const handlePlaceBet = async () => {
    if (!selectedPlayer || !selectedMetric || !selectedGameweek || !prediction || !betAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to place your bet",
        variant: "destructive"
      })
      return
    }

    const amount = parseFloat(betAmount)
    if (isNaN(amount) || amount < 200 || amount > 20000) {
      toast({
        title: "Invalid Bet Amount",
        description: "Bet amount must be between ₦200 and ₦20,000",
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

    const predictionValue = parseInt(prediction)
    if (isNaN(predictionValue) || predictionValue < 0 || predictionValue > 10) {
      toast({
        title: "Invalid Prediction",
        description: "Prediction must be between 0 and 10",
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
      setSelectedPlayer('')
      setSelectedMetric('')
      setSelectedGameweek('')
      setPrediction('')
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

  const selectedPlayerData = players.find(p => p.id === selectedPlayer)
  const currentStat = selectedPlayerData && selectedMetric ? selectedPlayerData[selectedMetric as keyof Player] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Performance Betting</CardTitle>
        <CardDescription>Place bets on player statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Player</label>
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger>
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name} ({player.team}) - {player.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Performance Metric</label>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((metric) => (
                <SelectItem key={metric.id} value={metric.id}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <label className="text-sm font-medium">Your Prediction</label>
          <Input
            type="number"
            min="0"
            max="10"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            placeholder="Enter prediction (0-10)"
          />
          {selectedPlayerData && selectedMetric && (
            <p className="text-sm text-muted-foreground">
              Current season {METRICS.find(m => m.id === selectedMetric)?.label}: {currentStat}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bet Amount (₦)</label>
          <Input
            type="number"
            min="200"
            max="20000"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Enter amount between ₦200 - ₦20,000"
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <span>Your Balance: {formatCurrency(userBalance)}</span>
          <div className="space-y-1">
            <div>Exact Match: {betAmount ? formatCurrency(parseFloat(betAmount) * 3) : '₦0'}</div>
            <div>Within 1: {betAmount ? formatCurrency(parseFloat(betAmount) * 1.5) : '₦0'}</div>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handlePlaceBet} 
          disabled={loading || !selectedPlayer || !selectedMetric || !selectedGameweek || !prediction || !betAmount}
        >
          {loading ? "Placing Bet..." : "Place Bet"}
        </Button>
      </CardContent>
    </Card>
  )
} 