import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default async function PlayerPriceHistory({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('*')
    .eq('id', params.id)
    .single()

  if (playerError || !player) {
    notFound()
  }

  const { data: priceHistory, error: historyError } = await supabase
    .from('player_price_history')
    .select('price, timestamp')
    .eq('player_id', params.id)
    .order('timestamp', { ascending: true })

  if (historyError) {
    return <div>Error loading price history</div>
  }

  const formattedPriceHistory = priceHistory?.map(entry => ({
    ...entry,
    timestamp: new Date(entry.timestamp).toLocaleDateString(),
    price: entry.price / 1000000 // Convert to millions
  }))

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
              <LineChart data={formattedPriceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

