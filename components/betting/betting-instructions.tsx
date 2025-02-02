'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'

export function BettingInstructions() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Betting Instructions</CardTitle>
            <CardDescription>Learn how to play and win</CardDescription>
          </div>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Head-to-Head Team Betting</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">How to Play</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Select two teams to compete against each other</li>
                  <li>Choose the gameweek for the matchup</li>
                  <li>Place your bet on which team will score more fantasy points</li>
                  <li>Minimum bet: ₦500, Maximum bet: ₦50,000</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">How Winnings are Determined</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>If your chosen team scores more points: Win 1.8x your bet</li>
                  <li>If both teams score equal points: Get your bet back</li>
                  <li>If your chosen team scores fewer points: Lose your bet</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Player Performance Betting</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">How to Play</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Select a player and predict their performance</li>
                  <li>Choose performance metrics (goals, assists, clean sheets)</li>
                  <li>Set your prediction and stake amount</li>
                  <li>Minimum bet: ₦200, Maximum bet: ₦20,000</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">How Winnings are Determined</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Exact prediction: Win 3x your bet</li>
                  <li>Within 1 point of prediction: Win 1.5x your bet</li>
                  <li>Incorrect prediction: Lose your bet</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">How to Get Paid</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Winnings are automatically credited to your NaijaPlay wallet</li>
              <li>Withdraw to your bank account (minimum withdrawal: ₦1,000)</li>
              <li>Processing time: 1-24 hours</li>
              <li>No withdrawal fees for amounts above ₦10,000</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Responsible Gambling</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please bet responsibly. Never bet more than you can afford to lose. If you need help with gambling addiction, 
              contact the National Problem Gambling Helpline.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
} 