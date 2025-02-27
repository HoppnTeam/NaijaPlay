import { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type TeamRow = Tables['teams']['Row']
type TeamPlayerRow = Tables['team_players']['Row']
type PlayerRow = Tables['players']['Row']

export interface Player extends PlayerRow {
  current_price: number
  base_price: number
  minutes_played: number
  goals_scored: number
  assists: number
  clean_sheets: number
  goals_conceded: number
  own_goals: number
  penalties_saved: number
  penalties_missed: number
  yellow_cards: number
  red_cards: number
  saves: number
  bonus: number
  form_rating: number
  ownership_percent: number
}

export interface TeamPlayer extends TeamPlayerRow {
  player: Player
  is_starting?: boolean
}

export interface Squad {
  team: TeamRow | null
  players: TeamPlayer[]
  squadRequirements: {
    isComplete: boolean
    missing: string[]
  }
}

export interface TransferMarketPlayer extends Player {
  is_available: boolean
}

// Type guards for null checking
export function isPlayer(value: any): value is Player {
  return value && 
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.position === 'string'
}

export function isTeamPlayer(value: any): value is TeamPlayer {
  return value && 
    typeof value.id === 'string' &&
    typeof value.team_id === 'string' &&
    typeof value.player_id === 'string' &&
    isPlayer(value.player)
}

// Utility function for safe player access
export function getPlayerName(player: Player | null | undefined): string {
  return player?.name ?? 'Unknown Player'
}

// Utility function for position validation
export function isValidPosition(position: string): boolean {
  return ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].includes(position)
}

// Constants
export const SQUAD_SIZE_LIMIT = 25
export const POSITION_REQUIREMENTS = {
  Goalkeeper: { min: 2, max: 3 },
  Defender: { min: 5, max: 7 },
  Midfielder: { min: 5, max: 7 },
  Forward: { min: 3, max: 5 }
} as const 