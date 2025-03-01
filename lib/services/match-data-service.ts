import { createClient } from '@/lib/supabase/client'

// Define interfaces for the service
interface MatchDataUpdateOptions {
  updatePlayerStats?: boolean
  updateFantasyPoints?: boolean
  gameweekId?: string
}

// Define PlayerStats interface
interface PlayerStats {
  player: {
    id: number
    name: string
    firstname?: string
    lastname?: string
    age?: number
    nationality?: string
    height?: string
    weight?: string
    injured?: boolean
    photo?: string
  }
  statistics: Array<{
    games: {
      minutes: number
      number?: number
      position?: string
      rating?: string
      captain?: boolean
      substitute?: boolean
    }
    goals: {
      total: number
      conceded?: number
      assists?: number
      saves?: number
    }
    shots: {
      total?: number
      on?: number
    }
    passes: {
      total?: number
      key?: number
      accuracy?: string
    }
    tackles: {
      total?: number
      blocks?: number
      interceptions?: number
    }
    duels: {
      total?: number
      won?: number
    }
    dribbles: {
      attempts?: number
      success?: number
      past?: number
    }
    fouls: {
      drawn?: number
      committed?: number
    }
    cards: {
      yellow: number
      red: number
    }
    penalty?: {
      won?: number
      committed?: number
      scored?: number
      missed?: number
      saved?: number
    }
  }>
}

export class MatchDataService {
  private supabase = createClient()

  /**
   * Update player statistics based on real match data
   * @param playerStats Array of player statistics from API Football or Record<number, Player[]>
   */
  async updatePlayerStatistics(playerStats: any) {
    try {
      console.log('Updating player statistics from match data...')
      
      // Handle different formats of player statistics
      let playersToUpdate: PlayerStats[] = []
      
      if (Array.isArray(playerStats)) {
        // If it's already an array of PlayerStats
        playersToUpdate = playerStats
      } else if (typeof playerStats === 'object') {
        // If it's in the format of the mock data (Record<number, Player[]>)
        // Convert to array of PlayerStats
        Object.values(playerStats).forEach(teamPlayers => {
          if (Array.isArray(teamPlayers)) {
            teamPlayers.forEach(player => {
              if (player.statistics && Array.isArray(player.statistics)) {
                playersToUpdate.push({
                  player: {
                    id: player.id,
                    name: player.name || `${player.firstname} ${player.lastname}`,
                    firstname: player.firstname,
                    lastname: player.lastname
                  },
                  statistics: player.statistics
                })
              }
            })
          }
        })
      }
      
      for (const playerStat of playersToUpdate) {
        // First, try to find the player by name in our database
        const { data: existingPlayers, error: findError } = await this.supabase
          .from('players')
          .select('*')
          .ilike('name', `%${playerStat.player.name}%`)
          .limit(1)
        
        if (findError) {
          console.error('Error finding player:', findError)
          continue
        }
        
        if (existingPlayers && existingPlayers.length > 0) {
          const player = existingPlayers[0]
          
          // Get the first statistics entry
          const stats = playerStat.statistics[0]
          
          // Update player statistics
          const { error: updateError } = await this.supabase
            .from('players')
            .update({
              minutes_played: player.minutes_played + stats.games.minutes,
              goals_scored: player.goals_scored + (stats.goals.total || 0),
              assists: player.assists + (stats.goals.assists || 0),
              yellow_cards: player.yellow_cards + stats.cards.yellow,
              red_cards: player.red_cards + stats.cards.red,
              form_rating: stats.games.rating ? parseFloat(stats.games.rating) : player.form_rating,
              updated_at: new Date().toISOString()
            })
            .eq('id', player.id)
          
          if (updateError) {
            console.error('Error updating player statistics:', updateError)
          }
        } else {
          console.log(`Player not found: ${playerStat.player.name}`)
        }
      }
      
      console.log('Player statistics updated successfully')
      return true
    } catch (error) {
      console.error('Error updating player statistics:', error)
      return false
    }
  }
  
  /**
   * Update fantasy points for all players based on their performance
   * @param gameweekId Optional gameweek ID to update points for
   */
  async updateFantasyPoints(gameweekId?: string) {
    try {
      console.log('Updating fantasy points based on player statistics...')
      
      // Get all players
      const { data: players, error: playersError } = await this.supabase
        .from('players')
        .select('*')
      
      if (playersError) {
        console.error('Error fetching players:', playersError)
        return false
      }
      
      if (!players || players.length === 0) {
        console.log('No players found')
        return false
      }
      
      // Calculate fantasy points for each player
      for (const player of players) {
        // Calculate points using the existing points calculation logic
        const points = this.calculatePlayerPoints(player)
        
        // Update player's fantasy points
        const { error: updateError } = await this.supabase
          .from('players')
          .update({
            fantasy_points: points,
            updated_at: new Date().toISOString()
          })
          .eq('id', player.id)
        
        if (updateError) {
          console.error(`Error updating fantasy points for player ${player.id}:`, updateError)
        }
        
        // If gameweek is provided, update player gameweek stats
        if (gameweekId) {
          // Check if player has gameweek stats
          const { data: existingStats, error: statsError } = await this.supabase
            .from('player_gameweek_stats')
            .select('*')
            .eq('player_id', player.id)
            .eq('gameweek_id', gameweekId)
            .limit(1)
          
          if (statsError) {
            console.error(`Error checking gameweek stats for player ${player.id}:`, statsError)
            continue
          }
          
          if (existingStats && existingStats.length > 0) {
            // Update existing gameweek stats
            const { error: updateStatsError } = await this.supabase
              .from('player_gameweek_stats')
              .update({
                minutes_played: player.minutes_played,
                goals: player.goals_scored,
                assists: player.assists,
                clean_sheets: player.clean_sheets,
                yellow_cards: player.yellow_cards,
                red_cards: player.red_cards,
                saves: player.saves,
                total_points: points,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingStats[0].id)
            
            if (updateStatsError) {
              console.error(`Error updating gameweek stats for player ${player.id}:`, updateStatsError)
            }
          } else {
            // Create new gameweek stats
            const { error: createStatsError } = await this.supabase
              .from('player_gameweek_stats')
              .insert({
                player_id: player.id,
                gameweek_id: gameweekId,
                minutes_played: player.minutes_played,
                goals: player.goals_scored,
                assists: player.assists,
                clean_sheets: player.clean_sheets,
                yellow_cards: player.yellow_cards,
                red_cards: player.red_cards,
                saves: player.saves,
                total_points: points
              })
            
            if (createStatsError) {
              console.error(`Error creating gameweek stats for player ${player.id}:`, createStatsError)
            }
          }
        }
      }
      
      // Update fantasy team points
      await this.updateFantasyTeamPoints(gameweekId)
      
      console.log('Fantasy points updated successfully')
      return true
    } catch (error) {
      console.error('Error updating fantasy points:', error)
      return false
    }
  }
  
  /**
   * Update fantasy team points based on player performances
   * @param gameweekId Optional gameweek ID to update points for
   */
  private async updateFantasyTeamPoints(gameweekId?: string) {
    try {
      // Get all fantasy teams with their players
      const { data: teams, error: teamsError } = await this.supabase
        .from('teams')
        .select(`
          id,
          team_players (
            player_id,
            is_captain,
            is_vice_captain,
            is_starting
          )
        `)
      
      if (teamsError) {
        console.error('Error fetching teams:', teamsError)
        return false
      }
      
      if (!teams || teams.length === 0) {
        console.log('No teams found')
        return false
      }
      
      // Calculate points for each team
      for (const team of teams) {
        if (!team.team_players || team.team_players.length === 0) continue
        
        // Get player IDs
        const playerIds = team.team_players.map(tp => tp.player_id)
        
        // Get player stats
        const { data: players, error: playersError } = await this.supabase
          .from('players')
          .select('*')
          .in('id', playerIds)
        
        if (playersError) {
          console.error(`Error fetching players for team ${team.id}:`, playersError)
          continue
        }
        
        if (!players || players.length === 0) continue
        
        // Calculate total points
        let totalPoints = 0
        let captainPoints = 0
        let viceCaptainPoints = 0
        
        for (const teamPlayer of team.team_players) {
          const player = players.find(p => p.id === teamPlayer.player_id)
          if (!player) continue
          
          // Only count starting players
          if (teamPlayer.is_starting) {
            const playerPoints = player.fantasy_points || 0
            
            // Double points for captain
            if (teamPlayer.is_captain) {
              totalPoints += playerPoints * 2
              captainPoints = playerPoints * 2
            } 
            // 1.5x points for vice captain
            else if (teamPlayer.is_vice_captain) {
              totalPoints += playerPoints * 1.5
              viceCaptainPoints = playerPoints * 1.5
            } 
            // Normal points for other players
            else {
              totalPoints += playerPoints
            }
          }
        }
        
        // Update team's total points
        const { error: updateError } = await this.supabase
          .from('teams')
          .update({
            total_points: totalPoints,
            updated_at: new Date().toISOString()
          })
          .eq('id', team.id)
        
        if (updateError) {
          console.error(`Error updating points for team ${team.id}:`, updateError)
        }
        
        // If gameweek is provided, update team gameweek stats
        if (gameweekId) {
          // Check if team has gameweek stats
          const { data: existingStats, error: statsError } = await this.supabase
            .from('team_gameweek_stats')
            .select('*')
            .eq('team_id', team.id)
            .eq('gameweek_id', gameweekId)
            .limit(1)
          
          if (statsError) {
            console.error(`Error checking gameweek stats for team ${team.id}:`, statsError)
            continue
          }
          
          if (existingStats && existingStats.length > 0) {
            // Update existing gameweek stats
            const { error: updateStatsError } = await this.supabase
              .from('team_gameweek_stats')
              .update({
                total_points: totalPoints,
                captain_points: captainPoints,
                vice_captain_points: viceCaptainPoints,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingStats[0].id)
            
            if (updateStatsError) {
              console.error(`Error updating gameweek stats for team ${team.id}:`, updateStatsError)
            }
          } else {
            // Create new gameweek stats
            const { error: createStatsError } = await this.supabase
              .from('team_gameweek_stats')
              .insert({
                team_id: team.id,
                gameweek_id: gameweekId,
                total_points: totalPoints,
                captain_points: captainPoints,
                vice_captain_points: viceCaptainPoints
              })
            
            if (createStatsError) {
              console.error(`Error creating gameweek stats for team ${team.id}:`, createStatsError)
            }
          }
        }
      }
      
      return true
    } catch (error) {
      console.error('Error updating fantasy team points:', error)
      return false
    }
  }
  
  /**
   * Calculate fantasy points for a player based on their statistics
   * @param player Player object with statistics
   * @returns Total fantasy points
   */
  private calculatePlayerPoints(player: any): number {
    let points = 0;

    // Minutes played
    if (player.minutes_played > 0) points += 1;
    if (player.minutes_played >= 60) points += 1;

    // Goals scored
    if (player.position === 'Goalkeeper' || player.position === 'Defender') {
      points += player.goals_scored * 6;
    } else if (player.position === 'Midfielder') {
      points += player.goals_scored * 5;
    } else if (player.position === 'Forward') {
      points += player.goals_scored * 4;
    }

    // Assists
    points += player.assists * 3;

    // Clean sheets
    if (player.position === 'Goalkeeper' || player.position === 'Defender') {
      points += player.clean_sheets * 4;
    } else if (player.position === 'Midfielder') {
      points += player.clean_sheets * 1;
    }

    // Goals conceded
    if (player.position === 'Goalkeeper' || player.position === 'Defender') {
      points -= Math.floor(player.goals_conceded / 2);
    }

    // Penalties saved
    points += player.penalties_saved * 5;

    // Penalties missed
    points -= player.penalties_missed * 2;

    // Yellow cards
    points -= player.yellow_cards;

    // Red cards
    points -= player.red_cards * 3;

    // Saves
    points += Math.floor(player.saves / 3);

    // Own goals
    points -= player.own_goals * 2;

    // Bonus points
    points += player.bonus || 0;

    return Math.max(0, points); // Ensure points don't go below 0
  }
  
  /**
   * Process match data and update the fantasy football system
   * @param options Update options
   */
  async processMatchData(options: MatchDataUpdateOptions = {}) {
    try {
      console.log('Processing match data...')
      
      // Fetch player statistics
      if (options.updatePlayerStats) {
        const response = await fetch('/api/players/statistics')
        if (!response.ok) {
          throw new Error('Failed to fetch player statistics')
        }
        
        const data = await response.json()
        await this.updatePlayerStatistics(data.players || [])
      }
      
      // Update fantasy points
      if (options.updateFantasyPoints) {
        await this.updateFantasyPoints(options.gameweekId)
      }
      
      console.log('Match data processing completed successfully')
      return true
    } catch (error) {
      console.error('Error processing match data:', error)
      return false
    }
  }
}

// Export a singleton instance
export const matchDataService = new MatchDataService() 