'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Player {
  id: string
  name: string
  position: string
  team: string
  current_price: number
}

interface SquadPlayer {
  player: Player
  is_captain: boolean
  is_vice_captain: boolean
  is_for_sale: boolean
  sale_price: number | null
}

interface TeamPlayerResponse {
  player: {
    id: string
    name: string
    position: string
    team: string
    current_price: number
  }
  is_captain: boolean
  is_vice_captain: boolean
  is_for_sale: boolean
  sale_price: number | null
}

export function useSquadPlayers(teamId: string) {
  const [players, setPlayers] = useState<SquadPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('team_players')
        .select(`
          is_captain,
          is_vice_captain,
          is_for_sale,
          sale_price,
          player:players (
            id,
            name,
            position,
            team,
            current_price
          )
        `)
        .eq('team_id', teamId)
        .returns<TeamPlayerResponse[]>()

      if (error) throw error

      const squadPlayers: SquadPlayer[] = data.map(item => ({
        player: item.player,
        is_captain: item.is_captain,
        is_vice_captain: item.is_vice_captain,
        is_for_sale: item.is_for_sale,
        sale_price: item.sale_price
      }))

      setPlayers(squadPlayers)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const setCaptain = async (playerId: string) => {
    const { error } = await supabase
      .from('team_players')
      .update({ is_captain: false })
      .eq('team_id', teamId)

    if (error) throw error

    const { error: updateError } = await supabase
      .from('team_players')
      .update({ is_captain: true })
      .eq('team_id', teamId)
      .eq('player_id', playerId)

    if (updateError) throw updateError

    await fetchPlayers()
  }

  const setViceCaptain = async (playerId: string) => {
    const { error } = await supabase
      .from('team_players')
      .update({ is_vice_captain: false })
      .eq('team_id', teamId)

    if (error) throw error

    const { error: updateError } = await supabase
      .from('team_players')
      .update({ is_vice_captain: true })
      .eq('team_id', teamId)
      .eq('player_id', playerId)

    if (updateError) throw updateError

    await fetchPlayers()
  }

  const putPlayerForSale = async (playerId: string, price: number) => {
    const { error } = await supabase
      .from('team_players')
      .update({
        is_for_sale: true,
        sale_price: price
      })
      .eq('team_id', teamId)
      .eq('player_id', playerId)

    if (error) throw error

    await fetchPlayers()
  }

  const cancelSale = async (playerId: string) => {
    const { error } = await supabase
      .from('team_players')
      .update({
        is_for_sale: false,
        sale_price: null
      })
      .eq('team_id', teamId)
      .eq('player_id', playerId)

    if (error) throw error

    await fetchPlayers()
  }

  useEffect(() => {
    fetchPlayers()
  }, [teamId])

  return {
    players,
    loading,
    error,
    setCaptain,
    setViceCaptain,
    putPlayerForSale,
    cancelSale,
    fetchPlayers
  }
} 