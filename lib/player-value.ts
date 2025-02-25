interface PlayerStats {
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
}

interface Player extends PlayerStats {
  position: string
  base_price: number
  current_price: number
}

export function calculateFormRating(player: PlayerStats): number {
  let rating = 6.0 // Base rating

  // Minutes played impact (max +1)
  const minutesImpact = Math.min(player.minutes_played / 90, 1) * 1

  // Performance impact (max +2)
  let performanceScore = 0
  if (player.goals_scored > 0) performanceScore += 0.5 * player.goals_scored
  if (player.assists > 0) performanceScore += 0.3 * player.assists
  if (player.clean_sheets > 0) performanceScore += 0.3 * player.clean_sheets
  if (player.penalties_saved > 0) performanceScore += 0.5 * player.penalties_saved
  if (player.saves >= 3) performanceScore += 0.2
  performanceScore = Math.min(performanceScore, 2)

  // Negative impact (max -2)
  let negativeScore = 0
  if (player.own_goals > 0) negativeScore -= 0.5 * player.own_goals
  if (player.penalties_missed > 0) negativeScore -= 0.3 * player.penalties_missed
  if (player.yellow_cards > 0) negativeScore -= 0.1 * player.yellow_cards
  if (player.red_cards > 0) negativeScore -= 1 * player.red_cards
  negativeScore = Math.max(negativeScore, -2)

  // Calculate final rating
  const finalRating = rating + minutesImpact + performanceScore + negativeScore
  
  // Ensure rating is between 1 and 10
  return Math.max(1, Math.min(10, finalRating))
}

export function calculatePlayerValue(player: Player): number {
  const formFactor = player.form_rating / 5.0 // 0-2 scale
  const ownershipFactor = player.ownership_percent / 100.0 // 0-1 scale
  const maxChange = Math.floor(player.base_price * 0.3) // Maximum 30% change

  // Calculate price change based on form and ownership
  const priceChange = Math.floor(
    player.base_price * (formFactor + ownershipFactor) / 10.0
  )

  // Ensure price change is within limits
  const finalPriceChange = Math.max(
    -maxChange,
    Math.min(maxChange, priceChange)
  )

  return player.base_price + finalPriceChange
}

export function getValueTrend(oldPrice: number, newPrice: number): 'up' | 'down' | 'stable' {
  const difference = newPrice - oldPrice
  if (difference > 1000000) return 'up' // More than 1M Naira increase
  if (difference < -1000000) return 'down' // More than 1M Naira decrease
  return 'stable'
}

export function formatPriceChange(oldPrice: number, newPrice: number): string {
  const difference = newPrice - oldPrice
  const formattedDiff = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(difference))
  
  return difference > 0 ? `+${formattedDiff}` : `-${formattedDiff}`
} 