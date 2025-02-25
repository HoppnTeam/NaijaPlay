import { type Database as GeneratedDatabase } from '../database.types'

// Common Types
export type ID = string

// Position Types
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'

export const POSITION_LIMITS = {
  GK: { min: 2, max: 2 },
  DEF: { min: 5, max: 5 },
  MID: { min: 5, max: 5 },
  FWD: { min: 3, max: 3 }
} as const

// User Types
export interface User {
  id: ID
  email: string
  full_name: string | null
  avatar_url: string | null
  provider: string
  role?: 'user' | 'admin'
  created_at: string
  updated_at: string
}

// Player Types
export interface Player {
  id: ID
  name: string
  position: Position
  team: string
  current_price: number
}

// Team Types
export interface Team {
  id: ID
  name: string
  user_id: ID
  budget: number
  total_value: number
  captain_id: ID | null
  formation: '4-3-3' | '4-4-2' | '3-5-2' | '5-3-2' | '4-2-3-1'
  playing_style: 'Attacking' | 'Defensive' | 'Possession' | 'Counter-Attack'
  mentality: 'Balanced' | 'Aggressive' | 'Conservative'
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string | null
  }
}

export interface TeamPlayer {
  id: ID
  team_id: ID
  player_id: ID
  purchase_price: number
  created_at: string
}

// League Types
export interface League {
  id: ID
  name: string
  type: 'NPFL' | 'EPL'
  max_teams: number
  entry_fee: number
  total_prize: number
  start_date: string
  end_date: string
  status: 'upcoming' | 'active' | 'completed'
  created_by: ID
  created_at: string
}

export interface LeagueMember {
  id: ID
  league_id: ID
  team_id: ID
  user_id: ID
  joined_at: string
  total_points: number
  rank: number
  gameweek_points: number
  teams?: {
    name: string
    profiles?: {
      full_name: string | null
    }
  }
}

export interface LeagueMessage {
  id: ID
  league_id: ID
  user_id: ID
  content: string
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

// Achievement Types
export interface Achievement {
  id: ID
  title: string
  description: string
  icon: string
  earned_at: string | null
}

// Notification Types
export interface NotificationPreference {
  league_updates: boolean
  team_performance: boolean
  transfer_deadlines: boolean
  match_reminders: boolean
  achievement_alerts: boolean
}

// Profile Types
export interface UserProfile {
  id: ID
  full_name: string
  username: string
  avatar_url: string | null
  bio: string | null
  favorite_team: string | null
  notifications_enabled: boolean
  notification_preferences: NotificationPreference
}

// Form Types
export interface FormState {
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Database Types
export type Database = GeneratedDatabase

// League Table Types
export interface LeaguePosition {
  position: number
  teamName: string
  played: number
  points: number
  form: string
  isCurrentUser?: boolean
} 