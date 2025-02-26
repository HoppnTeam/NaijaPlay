import { getApiFootballClient } from '../client'
import { TeamStatistics, LeagueStanding, Player } from '../types'
import { MOCK_TEAM_STATISTICS, MOCK_LEAGUE_STANDINGS, MOCK_PLAYER_STATISTICS } from '../mock-statistics'

// League IDs we're interested in
const LEAGUE_IDS = [
  39,  // English Premier League
  332  // Nigerian Premier League
]

const UPDATE_INTERVAL = 3600 * 1000 // 1 hour

// Flag to use mock data (set to true for development)
const USE_MOCK_DATA = true

class StatisticsService {
  private teamStatistics: Record<number, TeamStatistics> = {}
  private leagueStandings: Record<number, LeagueStanding> = {}
  private playerStatistics: Record<number, Player[]> = {}
  private lastUpdate: number = 0
  private updateTimer: NodeJS.Timeout | null = null
  private isLoading: boolean = false

  constructor() {
    // Initialize with mock data
    if (USE_MOCK_DATA) {
      this.teamStatistics = MOCK_TEAM_STATISTICS
      this.leagueStandings = MOCK_LEAGUE_STANDINGS
      this.playerStatistics = MOCK_PLAYER_STATISTICS
    }
  }

  // Start periodic updates
  startUpdates() {
    this.updateStatistics()
    this.updateTimer = setInterval(() => this.updateStatistics(), UPDATE_INTERVAL)
  }

  // Stop updates
  stopUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }
  }

  // Get team statistics
  getTeamStatistics(teamId: number): TeamStatistics | null {
    return this.teamStatistics[teamId] || null
  }

  // Get all team statistics
  getAllTeamStatistics(): Record<number, TeamStatistics> {
    return this.teamStatistics
  }

  // Get league standings
  getLeagueStandings(leagueId: number): LeagueStanding | null {
    return this.leagueStandings[leagueId] || null
  }

  // Get all league standings
  getAllLeagueStandings(): Record<number, LeagueStanding> {
    return this.leagueStandings
  }

  // Get player statistics for a team
  getPlayerStatistics(teamId: number): Player[] {
    return this.playerStatistics[teamId] || []
  }

  // Get all player statistics
  getAllPlayerStatistics(): Record<number, Player[]> {
    return this.playerStatistics
  }

  // Get loading state
  isDataLoading(): boolean {
    return this.isLoading
  }

  // Force an immediate update
  async refreshStatistics(): Promise<void> {
    await this.updateStatistics()
  }

  private async updateStatistics() {
    if (USE_MOCK_DATA) {
      // Just use mock data
      this.teamStatistics = MOCK_TEAM_STATISTICS
      this.leagueStandings = MOCK_LEAGUE_STANDINGS
      this.playerStatistics = MOCK_PLAYER_STATISTICS
      this.lastUpdate = Date.now()
      this.notifyListeners()
      return
    }

    try {
      this.isLoading = true
      const client = getApiFootballClient()
      
      // Fetch league standings
      for (const leagueId of LEAGUE_IDS) {
        const standings = await client.getLeagueStandings(leagueId)
        if (standings) {
          this.leagueStandings[leagueId] = standings
          
          // For each team in the standings, fetch team statistics
          for (const group of standings.league.standings) {
            for (const teamStanding of group) {
              const teamId = teamStanding.team.id
              const teamStats = await client.getTeamStatistics(teamId, leagueId)
              if (teamStats) {
                this.teamStatistics[teamId] = teamStats
              }
              
              // Fetch player statistics for this team
              const players = await client.getPlayerStatistics(teamId, leagueId)
              if (players.length > 0) {
                this.playerStatistics[teamId] = players
              }
            }
          }
        }
      }
      
      this.lastUpdate = Date.now()
      this.isLoading = false
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to update statistics:', error)
      this.isLoading = false
      
      // Fallback to mock data on error
      this.teamStatistics = MOCK_TEAM_STATISTICS
      this.leagueStandings = MOCK_LEAGUE_STANDINGS
      this.playerStatistics = MOCK_PLAYER_STATISTICS
      this.notifyListeners()
    }
  }

  private notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('statistics-update', {
        detail: {
          teamStatistics: this.teamStatistics,
          leagueStandings: this.leagueStandings,
          playerStatistics: this.playerStatistics,
          isLoading: this.isLoading
        }
      }))
    }
  }

  // Subscribe to updates
  subscribe(callback: (data: {
    teamStatistics: Record<number, TeamStatistics>,
    leagueStandings: Record<number, LeagueStanding>,
    playerStatistics: Record<number, Player[]>,
    isLoading: boolean
  }) => void): () => void {
    if (typeof window === 'undefined') return () => {}

    const handler = (event: CustomEvent) => {
      callback(event.detail)
    }

    window.addEventListener('statistics-update', handler as EventListener)
    return () => window.removeEventListener('statistics-update', handler as EventListener)
  }
}

// Export singleton instance
export const statisticsService = new StatisticsService() 