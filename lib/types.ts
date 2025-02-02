export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'

export const POSITION_LIMITS = {
  GK: { min: 2, max: 2 },
  DEF: { min: 5, max: 5 },
  MID: { min: 5, max: 5 },
  FWD: { min: 3, max: 3 }
} as const;

export type Player = {
  id: string
  name: string
  position: Position
  team: string
  initial_price: number
  current_price: number
  total_points: number
  form: number
  points_per_game: number
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
  popularity: number
  price_change: number
  price_change_week: number
  created_at?: string
  updated_at?: string
}

export type League = {
  id: string
  name: string
  type: 'NPFL' | 'EPL'
  max_teams: number
  entry_fee: number
  total_prize: number
  start_date: string
  end_date: string
  status: 'upcoming' | 'active' | 'completed'
  created_by?: string
  created_at?: string
}

export type Database = {
  public: {
    Tables: {
      players: {
        Row: Player
        Insert: Omit<Player, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Player, 'id'>>
      }
      teams: {
        Row: {
          id: string
          name: string
          user_id: string
          budget: number
          total_value: number
          formation: string
          playing_style: string
          mentality: string
          created_at?: string
          updated_at?: string
        }
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['teams']['Row'], 'id'>>
      }
      team_players: {
        Row: {
          id: string
          team_id: string
          player_id: string
          is_captain: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: Omit<Database['public']['Tables']['team_players']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['team_players']['Row'], 'id'>>
      }
      leagues: {
        Row: League
        Insert: Omit<League, 'id' | 'created_at'>
        Update: Partial<Omit<League, 'id'>>
      }
    }
  }
}

// Points History Types
export interface PlayerGameweek {
  id: string
  player_id: string
  gameweek: number
  points: number
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
  form: number
  price_change: number
  created_at: string
}

export interface TeamGameweek {
  id: string
  team_id: string
  gameweek: number
  total_points: number
  points_on_bench: number
  transfers_made: number
  transfers_cost: number
  captain_points: number
  vice_captain_points: number
  created_at: string
}

// Update Team type to include points
export interface Team {
  id: string
  name: string
  user_id: string
  budget: number
  total_value: number
  total_points: number
  gameweek_points: number
  overall_rank: number
  gameweek_rank: number
  captain_id: string | null
  vice_captain_id: string | null
  formation: string
  playing_style: string
  mentality: string
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string | null
  }
} 