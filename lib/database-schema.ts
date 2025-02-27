// Database schema types for Supabase

export interface Team {
  id: string
  name: string
  league?: string
  logo_url?: string
  created_at?: string
  updated_at?: string
}

export interface Player {
  id: string
  first_name: string
  last_name: string
  position: string
  team_id: string
  image_url?: string
  price?: number
  total_points?: number
  created_at?: string
  updated_at?: string
  team?: Team
}

export interface Match {
  id: string
  gameweek_id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  status: 'scheduled' | 'in_progress' | 'completed'
  home_score: number
  away_score: number
  created_at?: string
  updated_at?: string
  home_team?: Team
  away_team?: Team
}

export interface Gameweek {
  id: string
  number: number
  name: string
  start_date: string
  end_date: string
  status: 'upcoming' | 'in_progress' | 'completed'
  created_at?: string
  updated_at?: string
}

export interface PlayerPerformance {
  id: string
  player_id: string
  match_id: string
  gameweek_id: string
  minutes_played: number
  goals_scored: number
  assists: number
  clean_sheets: number
  goals_conceded: number
  yellow_cards: number
  red_cards: number
  saves: number
  points: number
  created_at?: string
  updated_at?: string
  player?: Player
  match?: {
    id: string
    match_date: string
    home_team: Team
    away_team: Team
  }
}

// Types for Supabase responses
export interface SupabasePlayer {
  id: string
  first_name: string
  last_name: string
  position: string
  team_id: string
  image_url?: string
  price?: number
  total_points?: number
  created_at?: string
  updated_at?: string
  teams?: Team[]
}

export interface SupabaseMatch {
  id: string
  gameweek_id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  status: 'scheduled' | 'in_progress' | 'completed'
  home_score: number
  away_score: number
  created_at?: string
  updated_at?: string
  home_team?: Team[]
  away_team?: Team[]
}

export interface SupabasePlayerPerformance {
  id: string
  player_id: string
  match_id: string
  minutes_played: number
  goals: number
  assists: number
  clean_sheet: boolean
  yellow_cards: number
  red_cards: number
  saves: number
  points: number
  players?: SupabasePlayer[]
  matches?: {
    id: string
    match_date: string
    home_team_id: string
    away_team_id: string
    home_team: Team[]
    away_team: Team[]
  }[]
}

// Helper functions to transform Supabase responses to our app types
export function transformPlayerPerformance(perf: SupabasePlayerPerformance): PlayerPerformance {
  // Access the first player in the players array
  const player = Array.isArray(perf.players) && perf.players.length > 0 
    ? perf.players[0] 
    : null;
  
  // Access the first match in the matches array
  const match = Array.isArray(perf.matches) && perf.matches.length > 0 
    ? perf.matches[0] 
    : null;
  
  // Access team data if available
  const team = player && Array.isArray(player.teams) && player.teams.length > 0 
    ? player.teams[0] 
    : null;
  
  return {
    id: perf.id,
    player_id: perf.player_id,
    match_id: perf.match_id,
    gameweek_id: '', // Not available in the raw data
    minutes_played: perf.minutes_played,
    goals_scored: perf.goals,
    assists: perf.assists,
    clean_sheets: perf.clean_sheet ? 1 : 0,
    goals_conceded: 0, // Not available in the raw data
    yellow_cards: perf.yellow_cards,
    red_cards: perf.red_cards,
    saves: perf.saves,
    points: perf.points,
    player: player ? {
      id: player.id,
      first_name: player.first_name,
      last_name: player.last_name,
      position: player.position,
      team_id: player.team_id,
      image_url: player.image_url,
      team: team ? {
        id: team.id,
        name: team.name,
        league: team.league
      } : undefined
    } : undefined,
    match: match ? {
      id: match.id,
      match_date: match.match_date,
      home_team: match.home_team && match.home_team.length > 0 ? {
        id: match.home_team[0].id,
        name: match.home_team[0].name
      } : { id: '', name: '' },
      away_team: match.away_team && match.away_team.length > 0 ? {
        id: match.away_team[0].id,
        name: match.away_team[0].name
      } : { id: '', name: '' }
    } : undefined
  };
}

export function transformMatch(match: SupabaseMatch): Match {
  return {
    id: match.id,
    gameweek_id: match.gameweek_id,
    home_team_id: match.home_team_id,
    away_team_id: match.away_team_id,
    match_date: match.match_date,
    status: match.status,
    home_score: match.home_score,
    away_score: match.away_score,
    home_team: match.home_team && match.home_team.length > 0 ? {
      id: match.home_team[0].id,
      name: match.home_team[0].name
    } : undefined,
    away_team: match.away_team && match.away_team.length > 0 ? {
      id: match.away_team[0].id,
      name: match.away_team[0].name
    } : undefined
  };
} 