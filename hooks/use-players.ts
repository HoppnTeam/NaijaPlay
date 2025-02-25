import useSWR from 'swr'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { swrConfig } from '@/lib/swr-config'

type Player = Database['public']['Tables']['players']['Row']

interface PlayersResponse {
  players: Player[]
  totalPages: number
  currentPage: number
  totalPlayers: number
}

interface UsePlayersOptions {
  position?: string
  search?: string
  page?: number
  pageSize?: number
}

const fetcher = async (key: string): Promise<PlayersResponse> => {
  const [_, queryString] = key.split('?')
  const params = new URLSearchParams(queryString)
  const supabase = createClientComponentClient<Database>()

  const position = params.get('position')
  const search = params.get('search')
  const page = parseInt(params.get('page') || '1')
  const pageSize = parseInt(params.get('pageSize') || '12')
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('players')
    .select('*', { count: 'exact' })
    .eq('is_available', true)
    .order('current_price', { ascending: false })

  if (position && position !== 'all') {
    query = query.eq('position', position)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  query = query.range(offset, offset + pageSize - 1)
  const { data: players, error, count } = await query

  if (error) throw error

  return {
    players: players || [],
    totalPages: Math.ceil((count || 0) / pageSize),
    currentPage: page,
    totalPlayers: count || 0
  }
}

export function usePlayers(options: UsePlayersOptions = {}) {
  const {
    position = 'all',
    search = '',
    page = 1,
    pageSize = 12
  } = options

  const queryKey = `/players?position=${position}&search=${search}&page=${page}&pageSize=${pageSize}`

  const { data, error, mutate } = useSWR<PlayersResponse>(
    queryKey,
    fetcher,
    {
      ...swrConfig,
      revalidateOnFocus: false,
      dedupingInterval: 5000, // Cache for 5 seconds
    }
  )

  return {
    players: data?.players || [],
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    totalPlayers: data?.totalPlayers || 0,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
} 