import { createId } from '@paralleldrive/cuid2'

export interface Player {
  id: string
  name: string
  position: string
  attack: number
  defense: number
  speed: number
  stamina: number
  form: number
}

export interface Team {
  id: string
  name: string
  players: Player[]
  formation: string
}

export interface MatchEvent {
  id: string
  type: 'goal' | 'assist' | 'save' | 'tackle' | 'foul' | 'card'
  minute: number
  playerId: string
  teamId: string
  description: string
}

export interface PlayerPerformance {
  playerId: string
  rating: number
  goals: number
  assists: number
  saves: number
  tackles: number
  fouls: number
  cards: number
}

export interface MatchResult {
  id: string
  homeTeamId: string
  awayTeamId: string
  homeScore: number
  awayScore: number
  events: MatchEvent[]
  playerPerformances: PlayerPerformance[]
  date: Date
}

export class MatchEngine {
  private calculatePlayerMatchRating(
    player: Player,
    events: MatchEvent[]
  ): number {
    let baseRating = 6.0 // Base rating for all players

    // Calculate event-based rating adjustments
    const playerEvents = events.filter(e => e.playerId === player.id)
    
    for (const event of playerEvents) {
      switch (event.type) {
        case 'goal':
          baseRating += 1.5
          break
        case 'assist':
          baseRating += 1.0
          break
        case 'save':
          baseRating += 0.5
          break
        case 'tackle':
          baseRating += 0.3
          break
        case 'foul':
          baseRating -= 0.3
          break
        case 'card':
          baseRating -= 0.5
          break
      }
    }

    // Factor in player attributes
    const attributeBonus = (
      (player.attack + player.defense + player.speed + player.stamina) / 400
    ) * player.form

    baseRating += attributeBonus

    // Clamp rating between 1 and 10
    return Math.max(1, Math.min(10, baseRating))
  }

  public generateMatchEvent(
    minute: number,
    teams: { home: Team; away: Team }
  ): MatchEvent | null {
    const eventTypes = ['goal', 'assist', 'save', 'tackle', 'foul', 'card']
    const eventProbabilities = [0.1, 0.1, 0.15, 0.2, 0.1, 0.05] // Probabilities for each event type

    // Determine if an event occurs
    if (Math.random() > 0.3) return null // 30% chance of event per minute

    // Select event type based on probabilities
    const random = Math.random()
    let cumulativeProbability = 0
    let selectedEventType = eventTypes[0]

    for (let i = 0; i < eventTypes.length; i++) {
      cumulativeProbability += eventProbabilities[i]
      if (random <= cumulativeProbability) {
        selectedEventType = eventTypes[i]
        break
      }
    }

    // Select team and player based on event type and attributes
    const isHomeTeam = this.determineEventTeam(selectedEventType as MatchEvent['type'], teams)
    const team = isHomeTeam ? teams.home : teams.away
    const player = this.selectPlayerForEvent(selectedEventType as MatchEvent['type'], team)

    return {
      id: createId(),
      type: selectedEventType as MatchEvent['type'],
      minute,
      playerId: player.id,
      teamId: team.id,
      description: this.generateEventDescription(selectedEventType as MatchEvent['type'], player.name, team.name)
    }
  }

  private determineEventTeam(eventType: MatchEvent['type'], teams: { home: Team; away: Team }): boolean {
    const homeTeamStrength = teams.home.players.reduce((sum, p) => sum + p.attack + p.defense, 0)
    const awayTeamStrength = teams.away.players.reduce((sum, p) => sum + p.attack + p.defense, 0)
    const totalStrength = homeTeamStrength + awayTeamStrength
    
    const random = Math.random()
    return random <= (homeTeamStrength / totalStrength)
  }

  private selectPlayerForEvent(eventType: MatchEvent['type'], team: Team): Player {
    const players = team.players
    let weights: number[] = []

    switch (eventType) {
      case 'goal':
        weights = players.map(p => p.position === 'FWD' ? p.attack * 2 : p.attack)
        break
      case 'assist':
        weights = players.map(p => p.position === 'MID' ? p.attack * 1.5 : p.attack)
        break
      case 'save':
        weights = players.map(p => p.position === 'GK' ? p.defense * 3 : 0)
        break
      case 'tackle':
        weights = players.map(p => p.defense)
        break
      default:
        weights = players.map(() => 1) // Equal probability for other events
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    let random = Math.random() * totalWeight
    let selectedIndex = 0

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        selectedIndex = i
        break
      }
    }

    return players[selectedIndex]
  }

  private generateEventDescription(
    type: MatchEvent['type'],
    playerName: string,
    teamName: string
  ): string {
    switch (type) {
      case 'goal':
        return `GOAL! ${playerName} scores for ${teamName}!`
      case 'assist':
        return `Beautiful assist by ${playerName} for ${teamName}!`
      case 'save':
        return `Great save by ${playerName} of ${teamName}!`
      case 'tackle':
        return `Successful tackle by ${playerName} (${teamName})`
      case 'foul':
        return `Foul committed by ${playerName} (${teamName})`
      case 'card':
        return `${playerName} (${teamName}) receives a card`
      default:
        return `Event involving ${playerName} of ${teamName}`
    }
  }

  public simulateMatch(homeTeam: Team, awayTeam: Team): MatchResult {
    const events: MatchEvent[] = []
    let homeScore = 0
    let awayScore = 0

    // Simulate 90 minutes
    for (let minute = 1; minute <= 90; minute++) {
      const event = this.generateMatchEvent(minute, { home: homeTeam, away: awayTeam })
      if (event) {
        events.push(event)
        if (event.type === 'goal') {
          if (event.teamId === homeTeam.id) homeScore++
          else awayScore++
        }
      }
    }

    // Calculate player performances
    const playerPerformances: PlayerPerformance[] = [
      ...homeTeam.players,
      ...awayTeam.players
    ].map(player => {
      const playerEvents = events.filter(e => e.playerId === player.id)
      return {
        playerId: player.id,
        rating: this.calculatePlayerMatchRating(player, playerEvents),
        goals: playerEvents.filter(e => e.type === 'goal').length,
        assists: playerEvents.filter(e => e.type === 'assist').length,
        saves: playerEvents.filter(e => e.type === 'save').length,
        tackles: playerEvents.filter(e => e.type === 'tackle').length,
        fouls: playerEvents.filter(e => e.type === 'foul').length,
        cards: playerEvents.filter(e => e.type === 'card').length
      }
    })

    return {
      id: createId(),
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeScore,
      awayScore,
      events,
      playerPerformances,
      date: new Date()
    }
  }
} 