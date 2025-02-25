import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { apiCache } from '@/lib/server-cache'

export async function GET() {
  try {
    // Try to get from cache first
    const cachedData = apiCache.has('tokens')
    if (cachedData) {
      return NextResponse.json(await apiCache.get('tokens', async () => ({})))
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    const [balanceResponse, transactionsResponse] = await Promise.all([
      supabase
        .from('profiles')
        .select('tokens')
        .single(),
      supabase
        .from('token_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    if (balanceResponse.error) throw balanceResponse.error
    if (transactionsResponse.error) throw transactionsResponse.error

    const data = {
      balance: balanceResponse.data?.tokens || 0,
      transactions: transactionsResponse.data || []
    }

    // Cache the result
    apiCache.set('tokens', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Update tokens balance
    const { error: updateError } = await supabase.rpc('add_tokens', {
      amount_to_add: amount
    })

    if (updateError) throw updateError

    // Clear cache to reflect new balance
    apiCache.del('tokens')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding tokens:', error)
    return NextResponse.json(
      { error: 'Failed to add tokens' },
      { status: 500 }
    )
  }
} 