import useSWR from 'swr'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { swrConfig } from '@/lib/swr-config'

type Team = Database['public']['Tables']['teams']['Row'] & {
  team_players?: Array<{
    players: Database['public']['Tables']['players']['Row']
  }>
}

const fetcher = async (key: string): Promise<Team> => {
  const [_, teamId] = key.split('/')
  const supabase = createClientComponentClient<Database>()
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_players (
        *,
        players (*)
      )
    `)
    .eq('id', teamId)
    .single()
    
  if (error) throw error
  return data
}

export function useTeam(teamId: string | null) {
  const { data, error, mutate } = useSWR<Team>(
    teamId ? `/teams/${teamId}` : null,
    fetcher,
    {
      ...swrConfig,
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  )

  return {
    team: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
} 