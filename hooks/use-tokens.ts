import useSWR from 'swr'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { swrConfig } from '@/lib/swr-config'
import { cache } from '@/lib/cache'

interface TokenData {
  balance: number
  transactions: Array<{
    id: string
    amount: number
    type: 'purchase' | 'usage'
    created_at: string
  }>
}

const fetcher = async (key: string): Promise<TokenData> => {
  const supabase = createClientComponentClient<Database>()
  
  // Try to get from cache first
  const cachedData = cache.get<TokenData>('token_data')
  if (cachedData) return cachedData

  // If not in cache, fetch from API
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

  const data: TokenData = {
    balance: balanceResponse.data?.tokens || 0,
    transactions: transactionsResponse.data || []
  }

  // Cache the result
  cache.set('token_data', data)

  return data
}

export function useTokens() {
  const { data, error, mutate } = useSWR<TokenData>(
    'tokens',
    fetcher,
    {
      ...swrConfig,
      dedupingInterval: 5000, // Cache for 5 seconds
      revalidateOnFocus: false
    }
  )

  return {
    tokens: data?.balance || 0,
    transactions: data?.transactions || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  }
} 