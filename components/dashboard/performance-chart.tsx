"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from "lucide-react"

interface PerformanceData {
  gameweek: number
  points: number
  rank: number
}

export function PerformanceChart() {
  // This would come from your database
  const data: PerformanceData[] = [
    { gameweek: 1, points: 65, rank: 1000000 },
    { gameweek: 2, points: 78, rank: 800000 },
    { gameweek: 3, points: 54, rank: 1200000 },
    { gameweek: 4, points: 89, rank: 500000 },
    { gameweek: 5, points: 72, rank: 600000 },
  ]

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="gameweek" 
                label={{ value: 'Gameweek', position: 'bottom' }}
              />
              <YAxis 
                label={{ 
                  value: 'Points', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="points"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 