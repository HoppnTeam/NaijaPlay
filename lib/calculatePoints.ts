type PlayerStats = {
  position: string;
  minutes_played: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
};

export function calculatePoints(stats: PlayerStats): number {
  let points = 0;

  // Minutes played
  if (stats.minutes_played > 0) points += 1;
  if (stats.minutes_played >= 60) points += 1;

  // Goals scored
  if (stats.position === 'Goalkeeper' || stats.position === 'Defender') {
    points += stats.goals_scored * 6;
  } else if (stats.position === 'Midfielder') {
    points += stats.goals_scored * 5;
  } else if (stats.position === 'Forward') {
    points += stats.goals_scored * 4;
  }

  // Assists
  points += stats.assists * 3;

  // Clean sheets
  if (stats.position === 'Goalkeeper' || stats.position === 'Defender') {
    points += stats.clean_sheets * 4;
  } else if (stats.position === 'Midfielder') {
    points += stats.clean_sheets * 1;
  }

  // Goals conceded
  if (stats.position === 'Goalkeeper' || stats.position === 'Defender') {
    points -= Math.floor(stats.goals_conceded / 2);
  }

  // Penalties saved
  points += stats.penalties_saved * 5;

  // Penalties missed
  points -= stats.penalties_missed * 2;

  // Yellow cards
  points -= stats.yellow_cards;

  // Red cards
  points -= stats.red_cards * 3;

  // Saves
  points += Math.floor(stats.saves / 3);

  // Own goals
  points -= stats.own_goals * 2;

  // Bonus points
  points += stats.bonus;

  return points;
}

