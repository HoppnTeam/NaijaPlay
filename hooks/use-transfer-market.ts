'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from "@/components/ui/use-toast"

export interface MarketPlayer {
  id: string
  name: string
  position: string
  team: string
  current_price: number
  is_for_sale: boolean
  sale_price: number | null
}

export const POSITIONS = [
  { id: 'all', label: 'All Positions' },
  { id: 'goalkeeper', label: 'Goalkeeper' },
  { id: 'defender', label: 'Defender' },
  { id: 'midfielder', label: 'Midfielder' },
  { id: 'forward', label: 'Forward' }
] as const

interface UseTransferMarketReturn {
  players: MarketPlayer[]
  loading: boolean
  error: string | null
  fetchPlayers: (position: string) => Promise<void>
  addPlayer: (player: MarketPlayer) => Promise<void>
}

export function useTransferMarket(teamId: string, budget: number, onPlayerAdded?: () => void): UseTransferMarketReturn {
  const [players, setPlayers] = useState<MarketPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const supabase = createClient()

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('team_players')
        .select(`
          player_id,
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
        .eq('is_for_sale', true)
        .neq('team_id', teamId)

      if (error) throw error

      const marketPlayers: MarketPlayer[] = data.map(item => ({
        id: item.player.id,
        name: item.player.name,
        position: item.player.position,
        team: item.player.team,
        current_price: item.player.current_price,
        is_for_sale: item.is_for_sale,
        sale_price: item.sale_price
      }))

      setPlayers(marketPlayers)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const addPlayer = async (player: MarketPlayer) => {
    if (player.current_price > budget) {
      toast({
        title: "Error",
        description: "Insufficient funds to purchase this player",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const { error: buyError } = await supabase
        .from('team_players')
        .insert({
          team_id: teamId,
          player_id: player.id,
          is_captain: false,
          is_vice_captain: false,
          is_for_sale: false,
          sale_price: null
        })

      if (buyError) throw buyError

      // Update the selling team's player record
      const { error: updateError } = await supabase
        .from('team_players')
        .delete()
        .eq('player_id', player.id)
        .eq('is_for_sale', true)

      if (updateError) throw updateError

      // Update the buying team's budget
      const { error: budgetError } = await supabase
        .from('teams')
        .update({
          budget: budget - player.sale_price!
        })
        .eq('id', teamId)

      if (budgetError) throw budgetError

      toast({
        title: "Success",
        description: `${player.name} has been added to your team`,
      })
      
      onPlayerAdded?.()
      // Remove the added player from the list
      setPlayers(current => current.filter(p => p.id !== player.id))
    } catch (err) {
      console.error('Error adding player:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add player",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [teamId])

  return {
    players,
    loading,
    error,
    fetchPlayers,
    addPlayer
  }
} 