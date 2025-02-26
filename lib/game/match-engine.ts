import { createId } from '@paralleldrive/cuid2'

/**
 * Match Engine
 * 
 * This class handles the simulation of football matches between two teams.
 * It generates realistic match events and player performances based on team and player attributes.
 */

interface Player {
  id: string
  name: string
  position: string
  attributes: {
    pace: number
    shooting: number
    passing: number
    dribbling: number
    defending: number
    physical: number
  }
}

interface Team {
  id: string
  name: string
  players: Player[]
}

interface MatchEvent {
  minute: number
  type: string
  teamId: string
  playerId: string
  playerName: string
  assistPlayerId?: string
  assistPlayerName?: string
  detail?: string
}

interface PlayerPerformance {
  playerId: string
  playerName: string
  teamId: string
  position: string
  rating: number
  goals: number
  assists: number
  minutesPlayed: number
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
  private homeTeam: Team
  private awayTeam: Team
  private events: MatchEvent[] = []
  private currentMinute: number = 0
  private homeScore: number = 0
  private awayScore: number = 0
  private playerPerformances: Map<string, PlayerPerformance> = new Map()
  
  constructor(homeTeam: Team, awayTeam: Team) {
    this.homeTeam = homeTeam
    this.awayTeam = awayTeam
    
    // Initialize player performances
    this.initializePlayerPerformances()
  }
  
  private initializePlayerPerformances() {
    // Initialize home team player performances
    this.homeTeam.players.forEach(player => {
      this.playerPerformances.set(player.id, {
        playerId: player.id,
        playerName: player.name,
        teamId: this.homeTeam.id,
        position: player.position,
        rating: 6.0, // Base rating
        goals: 0,
        assists: 0,
        minutesPlayed: 0
      })
    })
    
    // Initialize away team player performances
    this.awayTeam.players.forEach(player => {
      this.playerPerformances.set(player.id, {
        playerId: player.id,
        playerName: player.name,
        teamId: this.awayTeam.id,
        position: player.position,
        rating: 6.0, // Base rating
        goals: 0,
        assists: 0,
        minutesPlayed: 0
      })
    })
  }
  
  /**
   * Simulate a single minute of the match
   * @returns The events that occurred in this minute
   */
  simulateMinute(): MatchEvent[] {
    this.currentMinute++
    const minuteEvents: MatchEvent[] = []
    
    // Update player minutes played
    this.updateMinutesPlayed()
    
    // Determine if any events occur in this minute
    if (this.shouldEventOccur()) {
      const event = this.generateEvent()
      if (event) {
        minuteEvents.push(event)
        this.events.push(event)
        
        // Update scores and player stats based on the event
        this.processEvent(event)
      }
    }
    
    return minuteEvents
  }
  
  private updateMinutesPlayed() {
    // Update minutes played for all players
    this.playerPerformances.forEach(performance => {
      performance.minutesPlayed += 1
    })
  }
  
  private shouldEventOccur(): boolean {
    // About 10-15 events per match is realistic
    // So roughly 10-15% chance per minute
    return Math.random() < 0.12
  }
  
  private generateEvent(): MatchEvent | null {
    // Determine which team gets the event
    const isHomeTeamEvent = Math.random() < 0.55 // Slight home advantage
    const team = isHomeTeamEvent ? this.homeTeam : this.awayTeam
    
    // Determine event type
    const eventType = this.determineEventType()
    
    // Select a player for the event
    const player = this.selectPlayerForEvent(team, eventType)
    if (!player) return null
    
    // Create the event
    const event: MatchEvent = {
      minute: this.currentMinute,
      type: eventType,
      teamId: team.id,
      playerId: player.id,
      playerName: player.name
    }
    
    // Add assist for goals
    if (eventType === 'goal') {
      const assist = this.selectPlayerForAssist(team, player.id)
      if (assist) {
        event.assistPlayerId = assist.id
        event.assistPlayerName = assist.name
      }
      
      // Add goal details
      event.detail = this.generateGoalDetail()
    } else if (eventType === 'card') {
      // Add card details (yellow or red)
      event.detail = Math.random() < 0.2 ? 'red' : 'yellow'
    }
    
    return event
  }
  
  private determineEventType(): string {
    const rand = Math.random()
    
    if (rand < 0.6) {
      return 'goal' // 60% chance of a goal
    } else if (rand < 0.95) {
      return 'card' // 35% chance of a card
    } else {
      return 'substitution' // 5% chance of a substitution
    }
  }
  
  private selectPlayerForEvent(team: Team, eventType: string): Player | null {
    if (team.players.length === 0) return null
    
    // Filter players by position based on event type
    let eligiblePlayers: Player[] = []
    
    if (eventType === 'goal') {
      // Forwards and midfielders more likely to score
      const forwards = team.players.filter(p => p.position === 'Forward')
      const midfielders = team.players.filter(p => p.position === 'Midfielder')
      const defenders = team.players.filter(p => p.position === 'Defender')
      
      // Weight by position and shooting attribute
      if (Math.random() < 0.6 && forwards.length > 0) {
        eligiblePlayers = forwards
      } else if (Math.random() < 0.7 && midfielders.length > 0) {
        eligiblePlayers = midfielders
      } else if (defenders.length > 0) {
        eligiblePlayers = defenders
      } else {
        eligiblePlayers = team.players
      }
      
      // Sort by shooting attribute
      eligiblePlayers.sort((a, b) => 
        (b.attributes?.shooting || 50) - (a.attributes?.shooting || 50)
      )
      
      // Take top 3 or all if less than 3
      eligiblePlayers = eligiblePlayers.slice(0, Math.min(3, eligiblePlayers.length))
    } else if (eventType === 'card') {
      // Defenders more likely to get cards
      const defenders = team.players.filter(p => p.position === 'Defender')
      const midfielders = team.players.filter(p => p.position === 'Midfielder')
      
      if (Math.random() < 0.7 && defenders.length > 0) {
        eligiblePlayers = defenders
      } else if (Math.random() < 0.8 && midfielders.length > 0) {
        eligiblePlayers = midfielders
      } else {
        eligiblePlayers = team.players.filter(p => p.position !== 'Goalkeeper')
      }
    } else {
      // For substitutions, any outfield player
      eligiblePlayers = team.players.filter(p => p.position !== 'Goalkeeper')
    }
    
    if (eligiblePlayers.length === 0) {
      eligiblePlayers = team.players
    }
    
    // Randomly select from eligible players
    return eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)]
  }
  
  private selectPlayerForAssist(team: Team, scorerId: string): Player | null {
    // Filter out the scorer
    const eligiblePlayers = team.players.filter(p => p.id !== scorerId && p.position !== 'Goalkeeper')
    
    if (eligiblePlayers.length === 0) return null
    
    // Midfielders more likely to assist
    const midfielders = eligiblePlayers.filter(p => p.position === 'Midfielder')
    const forwards = eligiblePlayers.filter(p => p.position === 'Forward')
    
    let assistPool: Player[] = []
    
    if (Math.random() < 0.6 && midfielders.length > 0) {
      assistPool = midfielders
    } else if (Math.random() < 0.8 && forwards.length > 0) {
      assistPool = forwards
    } else {
      assistPool = eligiblePlayers
    }
    
    // Sort by passing attribute
    assistPool.sort((a, b) => 
      (b.attributes?.passing || 50) - (a.attributes?.passing || 50)
    )
    
    // Take top 3 or all if less than 3
    assistPool = assistPool.slice(0, Math.min(3, assistPool.length))
    
    // 30% chance of no assist
    if (Math.random() < 0.3) return null
    
    return assistPool[Math.floor(Math.random() * assistPool.length)]
  }
  
  private generateGoalDetail(): string {
    const goalTypes = [
      'header',
      'long shot',
      'penalty',
      'free kick',
      'tap in',
      'volley',
      'solo run',
      'counter attack',
      'rebound'
    ]
    
    return goalTypes[Math.floor(Math.random() * goalTypes.length)]
  }
  
  private processEvent(event: MatchEvent) {
    // Update scores
    if (event.type === 'goal') {
      if (event.teamId === this.homeTeam.id) {
        this.homeScore++
      } else {
        this.awayScore++
      }
      
      // Update player stats
      const scorer = this.playerPerformances.get(event.playerId)
      if (scorer) {
        scorer.goals += 1
        scorer.rating += 0.5 // Boost rating for scoring
      }
      
      if (event.assistPlayerId) {
        const assister = this.playerPerformances.get(event.assistPlayerId)
        if (assister) {
          assister.assists += 1
          assister.rating += 0.3 // Boost rating for assisting
        }
      }
    } else if (event.type === 'card') {
      // Decrease player rating for cards
      const player = this.playerPerformances.get(event.playerId)
      if (player) {
        player.rating -= event.detail === 'red' ? 1.0 : 0.3
      }
    }
  }
  
  /**
   * Get the current match state
   */
  getMatchState() {
    return {
      currentMinute: this.currentMinute,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      events: this.events,
      playerPerformances: Array.from(this.playerPerformances.values())
        .sort((a, b) => b.rating - a.rating) // Sort by rating
    }
  }
  
  /**
   * Finalize player ratings at the end of the match
   */
  finalizePlayerRatings() {
    this.playerPerformances.forEach(performance => {
      // Adjust ratings based on goals, assists, and team performance
      if (performance.teamId === this.homeTeam.id) {
        // Bonus for winning team
        if (this.homeScore > this.awayScore) {
          performance.rating += 0.3
        } else if (this.homeScore < this.awayScore) {
          performance.rating -= 0.2
        }
      } else {
        // Away team
        if (this.awayScore > this.homeScore) {
          performance.rating += 0.4 // Extra bonus for away win
        } else if (this.awayScore < this.homeScore) {
          performance.rating -= 0.2
        }
      }
      
      // Bonus for clean sheet (defenders and goalkeepers)
      if ((performance.position === 'Defender' || performance.position === 'Goalkeeper') &&
          ((performance.teamId === this.homeTeam.id && this.awayScore === 0) ||
           (performance.teamId === this.awayTeam.id && this.homeScore === 0))) {
        performance.rating += 0.5
      }
      
      // Ensure ratings are within bounds (1-10)
      performance.rating = Math.max(1, Math.min(10, performance.rating))
      
      // Round to 1 decimal place
      performance.rating = Math.round(performance.rating * 10) / 10
    })
  }
} 