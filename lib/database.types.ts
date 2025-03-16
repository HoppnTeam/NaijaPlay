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
      health_checks: {
        Row: {
          id: string
          created_at: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          status: string
        }
        Update: {
          id?: string
          created_at?: string
          status?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          id: string
          name: string
          position: string
          team: string
          current_price: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          position: string
          team: string
          current_price: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: string
          team?: string
          current_price?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          user_id: string
          budget: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          budget: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          budget?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
    Views: {}
    Functions: {}
    Enums: {}
  }
}

