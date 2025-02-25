export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          position: string
          team: string
          league: string
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          position: string
          team: string
          league?: string
          current_price: number
          base_price?: number
          minutes_played?: number
          goals_scored?: number
          assists?: number
          clean_sheets?: number
          goals_conceded?: number
          own_goals?: number
          penalties_saved?: number
          penalties_missed?: number
          yellow_cards?: number
          red_cards?: number
          saves?: number
          bonus?: number
          form_rating?: number
          ownership_percent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: string
          team?: string
          league?: string
          current_price?: number
          base_price?: number
          minutes_played?: number
          goals_scored?: number
          assists?: number
          clean_sheets?: number
          goals_conceded?: number
          own_goals?: number
          penalties_saved?: number
          penalties_missed?: number
          yellow_cards?: number
          red_cards?: number
          saves?: number
          bonus?: number
          form_rating?: number
          ownership_percent?: number
          created_at?: string
          updated_at?: string
        }
      }
      team_players: {
        Row: {
          id: string
          team_id: string
          player_id: string
          purchase_price: number
          is_captain: boolean
          is_vice_captain: boolean
          is_for_sale: boolean
          sale_price?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          player_id: string
          purchase_price: number
          is_captain?: boolean
          is_vice_captain?: boolean
          is_for_sale?: boolean
          sale_price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          player_id?: string
          purchase_price?: number
          is_captain?: boolean
          is_vice_captain?: boolean
          is_for_sale?: boolean
          sale_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          user_id: string
          budget: number
          token_balance: number
          total_value: number
          formation: '4-3-3' | '4-4-2' | '3-5-2' | '5-3-2' | '4-2-3-1'
          playing_style: 'Attacking' | 'Defensive' | 'Possession' | 'Counter-Attack'
          mentality: 'Balanced' | 'Aggressive' | 'Conservative'
          captain_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['teams']['Row'], 'id'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 