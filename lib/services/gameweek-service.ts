import { createClient } from '@supabase/supabase-js'
import { MatchResult, Team } from '@/lib/game/match-engine'
import type { Database } from '@/lib/database.types'

export class GameweekService {
  private supabase: ReturnType<typeof createClient<Database>>

  constructor(supabase: ReturnType<typeof createClient<Database>>) {
    this.supabase = supabase
  }

  async createGameweek(number: number, startDate: Date, endDate: Date) {
    const { data, error } = await this.supabase
      .from('gameweeks')
      .insert({
        number,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'upcoming'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getCurrentGameweek() {
    const { data, error } = await this.supabase
      .from('gameweeks')
      .select('*')
      .eq('status', 'in_progress')
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
    return data
  }

  async getGameweekById(id: string) {
    const { data, error } = await this.supabase
      .from('gameweeks')
      .select(`
        *,
        match_history (
          *,
          home_team:teams!match_history_home_team_id_fkey (*),
          away_team:teams!match_history_away_team_id_fkey (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async updateGameweekStatus(id: string, status: 'upcoming' | 'in_progress' | 'completed') {
    const { data, error } = await this.supabase
      .from('gameweeks')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async saveMatchResult(
    gameweekId: string,
    homeTeamId: string,
    awayTeamId: string,
    result: MatchResult
  ) {
    const { data, error } = await this.supabase
      .from('match_history')
      .insert({
        gameweek_id: gameweekId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        home_score: result.homeScore,
        away_score: result.awayScore,
        match_events: result.events,
        player_performances: result.playerPerformances,
        status: 'completed'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMatchHistory(teamId: string) {
    const { data, error } = await this.supabase
      .from('match_history')
      .select(`
        *,
        gameweeks (*),
        home_team:teams!match_history_home_team_id_fkey (*),
        away_team:teams!match_history_away_team_id_fkey (*)
      `)
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
      .order('match_date', { ascending: false })

    if (error) throw error
    return data
  }

  async getPlayerGameweekStats(playerId: string, gameweekId: string) {
    const { data, error } = await this.supabase
      .from('player_gameweek_stats')
      .select('*')
      .eq('player_id', playerId)
      .eq('gameweek_id', gameweekId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async getTeamGameweekStats(teamId: string, gameweekId: string) {
    const { data, error } = await this.supabase
      .from('team_gameweek_stats')
      .select('*')
      .eq('team_id', teamId)
      .eq('gameweek_id', gameweekId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async getGameweekLeaderboard(gameweekId: string) {
    const { data, error } = await this.supabase
      .from('team_gameweek_stats')
      .select(`
        *,
        teams (
          id,
          name,
          profiles (
            full_name
          )
        )
      `)
      .eq('gameweek_id', gameweekId)
      .order('total_points', { ascending: false })

    if (error) throw error
    return data
  }

  async scheduleMatch(
    gameweekId: string,
    homeTeamId: string,
    awayTeamId: string,
    matchDate: Date
  ) {
    const { data, error } = await this.supabase
      .from('match_history')
      .insert({
        gameweek_id: gameweekId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: matchDate.toISOString(),
        status: 'scheduled',
        home_score: 0,
        away_score: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUpcomingMatches(teamId: string) {
    const { data, error } = await this.supabase
      .from('match_history')
      .select(`
        *,
        gameweeks (*),
        home_team:teams!match_history_home_team_id_fkey (*),
        away_team:teams!match_history_away_team_id_fkey (*)
      `)
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })

    if (error) throw error
    return data
  }

  async getLiveMatches() {
    const { data, error } = await this.supabase
      .from('match_history')
      .select(`
        *,
        gameweeks (*),
        home_team:teams!match_history_home_team_id_fkey (*),
        away_team:teams!match_history_away_team_id_fkey (*)
      `)
      .eq('status', 'in_progress')
      .order('match_date', { ascending: true })

    if (error) throw error
    return data
  }
} 