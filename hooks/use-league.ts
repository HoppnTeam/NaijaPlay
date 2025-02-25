import useSWR from 'swr'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { swrConfig } from '@/lib/swr-config'
import { cache } from '@/lib/cache'

type League = Database['public']['Tables']['leagues']['Row']
type LeagueTeam = Database['public']['Tables']['league_teams']['Row']
type Team = Database['public']['Tables']['teams']['Row']

interface LeagueData {
  league: League | null
  teams: (LeagueTeam & { teams: Team })[] | null
  standings: {
    position: number
    team_name: string
    played: number
    won: number
    drawn: number
    lost: number
    points: number
  }[]
}

const fetcher = async (key: string): Promise<LeagueData> => {
  const [_, leagueId] = key.split('/')
  const supabase = createClientComponentClient<Database>()

  // Try to get from cache first
  const cachedData = cache.get<LeagueData>(`league_${leagueId}`)
  if (cachedData) return cachedData

  // If not in cache, fetch from API
  const [leagueResponse, teamsResponse] = await Promise.all([
    supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single(),
    supabase
      .from('league_teams')
      .select(`
        *,
        teams (*)
      `)
      .eq('league_id', leagueId)
  ])

  if (leagueResponse.error) throw leagueResponse.error
  if (teamsResponse.error) throw teamsResponse.error

  // Calculate standings
  const standings = teamsResponse.data.map(lt => ({
    position: 0, // Will be calculated below
    team_name: lt.teams.name,
    played: lt.matches_played,
    won: lt.matches_won,
    drawn: lt.matches_drawn,
    lost: lt.matches_lost,
    points: (lt.matches_won * 3) + lt.matches_drawn
  }))
  .sort((a, b) => b.points - a.points)
  .map((team, index) => ({ ...team, position: index + 1 }))

  const data: LeagueData = {
    league: leagueResponse.data,
    teams: teamsResponse.data,
    standings
  }

  // Cache the result
  cache.set(`league_${leagueId}`, data)

  return data
}

export function useLeague(leagueId: string | null) {
  const { data, error, mutate } = useSWR<LeagueData>(
    leagueId ? `/leagues/${leagueId}` : null,
    fetcher,
    {
      ...swrConfig,
      dedupingInterval: 10000, // Cache for 10 seconds
      revalidateOnFocus: false
    }
  )

  return {
    league: data?.league || null,
    teams: data?.teams || [],
    standings: data?.standings || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  }
} 