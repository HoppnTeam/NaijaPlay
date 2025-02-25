'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface PriceHistoryEntry {
  price: number
  timestamp: string
}

export default function PlayerPriceHistory({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<any>(null)
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', params.id)
          .single()

        if (playerError) throw playerError

        const { data: historyData, error: historyError } = await supabase
          .from('player_price_history')
          .select('price, timestamp')
          .eq('player_id', params.id)
          .order('timestamp', { ascending: true })

        if (historyError) throw historyError

        setPlayer(playerData)
        setPriceHistory(historyData?.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp).toLocaleDateString(),
          price: entry.price / 1000000 // Convert to millions
        })) || [])
      } catch (error) {
        console.error('Error loading price history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.id, supabase])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!player) {
    return <div>Player not found</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{player.name} - Price History</h1>
      <Card>
        <CardHeader>
          <CardTitle>Price Fluctuation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`₦${value}M`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

