import { Player, Position } from './types'

// Points values for different actions
export const POINTS_VALUES = {
  MINUTES_PLAYED: {
    PER_90_MINUTES: 2,
  },
  GOALS_SCORED: {
    GK: 6,
    DEF: 6,
    MID: 5,
    FWD: 4,
  },
  ASSISTS: 3,
  CLEAN_SHEETS: {
    GK: 4,
    DEF: 4,
    MID: 1,
    FWD: 0,
  },
  GOALS_CONCEDED: {
    GK: -0.5,  // -1 point per 2 goals conceded
    DEF: -0.5,
    MID: 0,
    FWD: 0,
  },
  SAVES: {
    GK: 1/3,  // 1 point per 3 saves
    DEF: 0,
    MID: 0,
    FWD: 0,
  },
  PENALTIES_SAVED: {
    GK: 5,
    DEF: 0,
    MID: 0,
    FWD: 0,
  },
  PENALTIES_MISSED: -2,
  OWN_GOALS: -2,
  YELLOW_CARDS: -1,
  RED_CARDS: -3,
  BONUS: 1,  // Additional points for outstanding performance
} as const

// Calculate points for a single player
export function calculatePlayerPoints(player: Player): number {
  let points = 0;
  
  // Minutes played (2 points per 90 minutes)
  points += Math.floor(player.minutes_played / 90) * POINTS_VALUES.MINUTES_PLAYED.PER_90_MINUTES;
  
  // Goals scored (varies by position)
  points += player.goals_scored * POINTS_VALUES.GOALS_SCORED[player.position];
  
  // Assists
  points += player.assists * POINTS_VALUES.ASSISTS;
  
  // Clean sheets (varies by position)
  points += player.clean_sheets * POINTS_VALUES.CLEAN_SHEETS[player.position];
  
  // Goals conceded (GK/DEF only)
  if (player.position === 'GK' || player.position === 'DEF') {
    points += player.goals_conceded * POINTS_VALUES.GOALS_CONCEDED[player.position];
  }
  
  // Saves (GK only)
  if (player.position === 'GK') {
    points += Math.floor(player.saves * POINTS_VALUES.SAVES.GK);
  }
  
  // Penalties saved (GK only)
  if (player.position === 'GK') {
    points += player.penalties_saved * POINTS_VALUES.PENALTIES_SAVED.GK;
  }
  
  // Penalties missed
  points += player.penalties_missed * POINTS_VALUES.PENALTIES_MISSED;
  
  // Own goals
  points += player.own_goals * POINTS_VALUES.OWN_GOALS;
  
  // Yellow cards
  points += player.yellow_cards * POINTS_VALUES.YELLOW_CARDS;
  
  // Red cards
  points += player.red_cards * POINTS_VALUES.RED_CARDS;
  
  // Bonus points
  points += player.bonus * POINTS_VALUES.BONUS;
  
  return Math.max(0, points); // Ensure points don't go below 0
}

// Calculate points for a team's gameweek
export function calculateTeamGameweekPoints(players: Player[]): number {
  return players.reduce((total, player) => total + calculatePlayerPoints(player), 0);
}

// Calculate team's total points for the season
export function calculateTeamTotalPoints(gameweekPoints: number[]): number {
  return gameweekPoints.reduce((total, points) => total + points, 0);
}

// Calculate bonus points based on performance metrics
export function calculateBonusPoints(player: Player): number {
  let bonus = 0;
  
  // Example bonus point criteria
  if (player.minutes_played >= 60) bonus += 1;  // Playing majority of game
  if (player.goals_scored >= 2) bonus += 2;     // Scoring multiple goals
  if (player.assists >= 2) bonus += 1;          // Multiple assists
  if (player.clean_sheets >= 1 && 
     (player.position === 'GK' || player.position === 'DEF')) {
    bonus += 1;  // Clean sheet for defensive positions
  }
  
  return bonus;
}

// Calculate form rating (last 5 games average)
export function calculatePlayerForm(recentPoints: number[]): number {
  const lastFiveGames = recentPoints.slice(-5);
  if (lastFiveGames.length === 0) return 0;
  
  const average = lastFiveGames.reduce((sum, points) => sum + points, 0) / lastFiveGames.length;
  return Number(average.toFixed(1));
}

// Calculate price change based on form and ownership
export function calculatePriceChange(
  player: Player,
  form: number,
  ownership: number,
  basePrice: number
): number {
  const formFactor = form / 5;  // Form out of 10
  const ownershipFactor = ownership / 100;  // Ownership percentage
  const maxChange = basePrice * 0.3;  // Max 30% change
  
  const priceChange = basePrice * (formFactor + ownershipFactor) / 10;
  return Math.min(Math.max(-maxChange, priceChange), maxChange);
}

// Calculate team value
export function calculateTeamValue(players: Player[]): number {
  return players.reduce((total, player) => total + player.current_price, 0);
}

// Calculate position-specific stats
export function calculatePositionStats(players: Player[], position: Position) {
  const positionPlayers = players.filter(p => p.position === position);
  
  return {
    averagePoints: positionPlayers.length > 0
      ? positionPlayers.reduce((sum, p) => sum + calculatePlayerPoints(p), 0) / positionPlayers.length
      : 0,
    totalGoals: positionPlayers.reduce((sum, p) => sum + p.goals_scored, 0),
    totalAssists: positionPlayers.reduce((sum, p) => sum + p.assists, 0),
    averagePrice: positionPlayers.length > 0
      ? positionPlayers.reduce((sum, p) => sum + p.current_price, 0) / positionPlayers.length
      : 0,
  };
} 