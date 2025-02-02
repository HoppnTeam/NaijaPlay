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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          provider?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          user_id: string
          formation: string
          captain_id: string | null
          vice_captain_id: string | null
          total_value: number
          budget: number
          created_at: string
          tokens: number
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          formation?: string
          captain_id?: string | null
          vice_captain_id?: string | null
          total_value?: number
          budget?: number
          created_at?: string
          tokens?: number
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          formation?: string
          captain_id?: string | null
          vice_captain_id?: string | null
          total_value?: number
          budget?: number
          created_at?: string
          tokens?: number
        }
      }
      gameweeks: {
        Row: {
          id: string
          number: number
          start_date: string
          end_date: string
          status: 'upcoming' | 'in_progress' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          number: number
          start_date: string
          end_date: string
          status?: 'upcoming' | 'in_progress' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          number?: number
          start_date?: string
          end_date?: string
          status?: 'upcoming' | 'in_progress' | 'completed'
          created_at?: string
        }
      }
      match_history: {
        Row: {
          id: string
          gameweek_id: string
          home_team_id: string
          away_team_id: string
          home_score: number | null
          away_score: number | null
          match_date: string
          status: 'scheduled' | 'in_progress' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          gameweek_id: string
          home_team_id: string
          away_team_id: string
          home_score?: number | null
          away_score?: number | null
          match_date: string
          status?: 'scheduled' | 'in_progress' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          gameweek_id?: string
          home_team_id?: string
          away_team_id?: string
          home_score?: number | null
          away_score?: number | null
          match_date?: string
          status?: 'scheduled' | 'in_progress' | 'completed'
          created_at?: string
        }
      }
      team_gameweek_stats: {
        Row: {
          id: string
          team_id: string
          gameweek_id: string
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          gameweek_id: string
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          gameweek_id?: string
          points?: number
          created_at?: string
        }
      }
      player_gameweeks: {
        Row: {
          id: string
          player_id: string
          gameweek_id: string
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
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          gameweek_id: string
          points?: number
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
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          gameweek_id?: string
          points?: number
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
          created_at?: string
        }
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

