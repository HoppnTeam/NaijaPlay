import { useCallback, useEffect } from 'react'
import useSWR from 'swr'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Squad, TeamPlayer, Player, POSITION_REQUIREMENTS, isTeamPlayer } from '@/types/squad'

type RawTeamPlayer = Database['public']['Tables']['team_players']['Row'] & {
  players: Database['public']['Tables']['players']['Row']
}

export function useSquadData(teamId: string | null) {
  const supabase = createClientComponentClient<Database>()

  const fetchSquadData = useCallback(async () => {
    if (!teamId) return null

    try {
      // First, get the team data
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (teamError) throw teamError

      // Then get team players with left join to ensure we get all players
      const { data: teamPlayers, error: playersError } = await supabase
        .from('team_players')
        .select(`
          *,
          players (*)
        `)
        .eq('team_id', teamId)

      if (playersError) throw playersError

      // Ensure type safety with proper null checks
      const players: TeamPlayer[] = (teamPlayers || [])
        .filter((tp: RawTeamPlayer | null): tp is RawTeamPlayer => {
          if (!tp || !tp.players) {
            console.warn(`Invalid team player data found:`, tp)
            return false
          }
          return true
        })
        .map((tp: RawTeamPlayer) => ({
          id: tp.id,
          team_id: tp.team_id,
          player_id: tp.player_id,
          purchase_price: tp.purchase_price || 0,
          is_captain: tp.is_captain || false,
          is_vice_captain: tp.is_vice_captain || false,
          is_for_sale: tp.is_for_sale || false,
          sale_price: tp.sale_price,
          created_at: tp.created_at,
          updated_at: tp.updated_at,
          player: {
            ...tp.players,
            current_price: tp.players.current_price || 0,
            base_price: tp.players.base_price || 0,
            minutes_played: tp.players.minutes_played || 0,
            goals_scored: tp.players.goals_scored || 0,
            assists: tp.players.assists || 0,
            clean_sheets: tp.players.clean_sheets || 0,
            goals_conceded: tp.players.goals_conceded || 0,
            own_goals: tp.players.own_goals || 0,
            penalties_saved: tp.players.penalties_saved || 0,
            penalties_missed: tp.players.penalties_missed || 0,
            yellow_cards: tp.players.yellow_cards || 0,
            red_cards: tp.players.red_cards || 0,
            saves: tp.players.saves || 0,
            bonus: tp.players.bonus || 0,
            form_rating: tp.players.form_rating || 0,
            ownership_percent: tp.players.ownership_percent || 0
          }
        }))
        .filter(isTeamPlayer) // Additional type guard check

      const squadData: Squad = {
        team: teamData,
        players,
        squadRequirements: calculateSquadRequirements(players)
      }

      return squadData
    } catch (error) {
      console.error('Error fetching squad:', error)
      throw error
    }
  }, [teamId, supabase])

  const { data, error, mutate } = useSWR<Squad | null>(
    teamId ? `squad-data-${teamId}` : null,
    fetchSquadData,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000, // Reduced from 5000 to update more frequently
      refreshInterval: 0
    }
  )

  useEffect(() => {
    if (!teamId) return

    // Subscribe to both team_players and players changes
    const channel = supabase
      .channel('squad_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_players',
          filter: `team_id=eq.${teamId}`
        },
        () => {
          console.log('Team players update detected')
          mutate()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `id=in.(${data?.players.map(p => p.player_id).join(',') || ''})`
        },
        () => {
          console.log('Players update detected')
          mutate()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [teamId, mutate, supabase, data?.players])

  return { data, error, mutate }
}

function calculateSquadRequirements(players: TeamPlayer[]): Squad['squadRequirements'] {
  const positions = players.reduce((acc, tp) => {
    const pos = tp.player?.position
    if (pos && pos in POSITION_REQUIREMENTS) {
      acc[pos] = (acc[pos] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const missing = Object.entries(POSITION_REQUIREMENTS)
    .filter(([pos, { min }]) => (positions[pos] || 0) < min)
    .map(([pos, { min }]) => {
      const current = positions[pos] || 0
      return `${min - current} ${pos}${min - current > 1 ? 's' : ''}`
    })

  return {
    isComplete: missing.length === 0,
    missing
  }
} 