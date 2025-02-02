import { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

// Points constants
const POINTS = {
  // Playing time
  STARTS_MATCH: 2,
  PLAYS_60_MINS: 1,
  
  // Goals
  GOAL_SCORED_GK: 6,
  GOAL_SCORED_DEF: 6,
  GOAL_SCORED_MID: 5,
  GOAL_SCORED_FWD: 4,
  
  // Assists
  ASSIST: 3,
  
  // Clean sheets
  CLEAN_SHEET_GK: 4,
  CLEAN_SHEET_DEF: 4,
  CLEAN_SHEET_MID: 1,
  
  // Goals conceded (GK & DEF only)
  GOALS_CONCEDED_2: -1, // Per 2 goals conceded
  
  // Penalty saves/misses
  PENALTY_SAVE: 5,
  PENALTY_MISS: -2,
  
  // Cards
  YELLOW_CARD: -1,
  RED_CARD: -3,
  
  // Bonus points
  BONUS_3: 3,
  BONUS_2: 2,
  BONUS_1: 1,
  
  // Other
  OWN_GOAL: -2,
  SAVES_3: 1, // Per 3 saves
}

export class PointsService {
  private supabase = createClient()

  async calculatePlayerGameweekPoints(
    playerId: string,
    gameweekId: string
  ): Promise<number> {
    try {
      // Fetch player's stats for the gameweek
      const { data: stats, error } = await this.supabase
        .from('player_gameweek_stats')
        .select(`
          *,
          players!inner (
            position
          )
        `)
        .eq('player_id', playerId)
        .eq('gameweek_id', gameweekId)
        .single()

      if (error) throw error
      if (!stats) return 0

      let points = 0

      // Playing time points
      if (stats.minutes_played >= 60) {
        points += POINTS.PLAYS_60_MINS
      }
      if (stats.minutes_played > 0) {
        points += POINTS.STARTS_MATCH
      }

      // Goals scored
      if (stats.goals_scored > 0) {
        const position = stats.players.position
        switch (position) {
          case 'Goalkeeper':
            points += stats.goals_scored * POINTS.GOAL_SCORED_GK
            break
          case 'Defender':
            points += stats.goals_scored * POINTS.GOAL_SCORED_DEF
            break
          case 'Midfielder':
            points += stats.goals_scored * POINTS.GOAL_SCORED_MID
            break
          case 'Forward':
            points += stats.goals_scored * POINTS.GOAL_SCORED_FWD
            break
        }
      }

      // Assists
      points += stats.assists * POINTS.ASSIST

      // Clean sheets
      if (stats.clean_sheets > 0) {
        const position = stats.players.position
        switch (position) {
          case 'Goalkeeper':
            points += POINTS.CLEAN_SHEET_GK
            break
          case 'Defender':
            points += POINTS.CLEAN_SHEET_DEF
            break
          case 'Midfielder':
            points += POINTS.CLEAN_SHEET_MID
            break
        }
      }

      // Goals conceded (GK & DEF only)
      if (['Goalkeeper', 'Defender'].includes(stats.players.position)) {
        points += Math.floor(stats.goals_conceded / 2) * POINTS.GOALS_CONCEDED_2
      }

      // Penalties
      points += stats.penalties_saved * POINTS.PENALTY_SAVE
      points += stats.penalties_missed * POINTS.PENALTY_MISS

      // Cards
      points += stats.yellow_cards * POINTS.YELLOW_CARD
      points += stats.red_cards * POINTS.RED_CARD

      // Own goals
      points += stats.own_goals * POINTS.OWN_GOAL

      // Saves (GK only)
      if (stats.players.position === 'Goalkeeper') {
        points += Math.floor(stats.saves / 3) * POINTS.SAVES_3
      }

      // Bonus points
      points += stats.bonus

      return points
    } catch (error) {
      console.error('Error calculating player points:', error)
      throw error
    }
  }

  async calculateTeamGameweekPoints(
    teamId: string,
    gameweekId: string
  ): Promise<number> {
    try {
      // Fetch all players in the team
      const { data: teamPlayers, error } = await this.supabase
        .from('team_players')
        .select(`
          player_id,
          is_captain,
          is_vice_captain
        `)
        .eq('team_id', teamId)

      if (error) throw error
      if (!teamPlayers) return 0

      let totalPoints = 0
      let captainPoints = 0
      let viceCaptainPoints = 0

      // Calculate points for each player
      for (const teamPlayer of teamPlayers) {
        const playerPoints = await this.calculatePlayerGameweekPoints(
          teamPlayer.player_id,
          gameweekId
        )

        if (teamPlayer.is_captain) {
          captainPoints = playerPoints * 2 // Captain gets double points
        } else if (teamPlayer.is_vice_captain) {
          viceCaptainPoints = playerPoints // Store vice captain points
        } else {
          totalPoints += playerPoints
        }
      }

      // Add captain points (or vice captain if captain scored 0)
      totalPoints += captainPoints > 0 ? captainPoints : viceCaptainPoints * 2

      return totalPoints
    } catch (error) {
      console.error('Error calculating team points:', error)
      throw error
    }
  }

  async updateTeamGameweekPoints(
    teamId: string,
    gameweekId: string
  ): Promise<void> {
    try {
      const points = await this.calculateTeamGameweekPoints(teamId, gameweekId)

      // Update team_gameweek_stats
      const { error } = await this.supabase
        .from('team_gameweek_stats')
        .upsert({
          team_id: teamId,
          gameweek_id: gameweekId,
          points: points,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating team gameweek points:', error)
      throw error
    }
  }

  async calculateBonusPoints(gameweekId: string, matchId: string): Promise<void> {
    try {
      // Fetch all players from the match
      const { data: players, error } = await this.supabase
        .from('player_gameweek_stats')
        .select(`
          *,
          players!inner (
            position
          )
        `)
        .eq('gameweek_id', gameweekId)
        .eq('match_id', matchId)

      if (error) throw error
      if (!players) return

      // Calculate bonus points based on performance
      const playerScores = players.map(player => {
        let score = 0

        // Base score from basic stats
        score += player.goals_scored * 12
        score += player.assists * 9
        score += player.clean_sheets * 6
        score += Math.floor(player.saves / 3) * 2
        score -= player.goals_conceded * 1
        score -= player.own_goals * 3
        score -= player.yellow_cards * 3
        score -= player.red_cards * 9

        // Position-specific scoring
        switch (player.players.position) {
          case 'Goalkeeper':
          case 'Defender':
            score += player.clean_sheets * 3
            break
          case 'Midfielder':
            score += player.goals_scored * 3
            break
          case 'Forward':
            score += player.goals_scored * 2
            break
        }

        return {
          playerId: player.player_id,
          score
        }
      })

      // Sort players by score
      playerScores.sort((a, b) => b.score - a.score)

      // Assign bonus points to top 3 players
      const bonusPoints = [
        { playerId: playerScores[0]?.playerId, bonus: 3 },
        { playerId: playerScores[1]?.playerId, bonus: 2 },
        { playerId: playerScores[2]?.playerId, bonus: 1 }
      ]

      // Update bonus points in database
      for (const { playerId, bonus } of bonusPoints) {
        if (playerId) {
          const { error: updateError } = await this.supabase
            .from('player_gameweek_stats')
            .update({ bonus })
            .eq('player_id', playerId)
            .eq('gameweek_id', gameweekId)
            .eq('match_id', matchId)

          if (updateError) throw updateError
        }
      }
    } catch (error) {
      console.error('Error calculating bonus points:', error)
      throw error
    }
  }
} 