import { API_FOOTBALL_CONFIG } from './config'
import { Fixture, TeamStatistics, LeagueStanding, Player } from './types'

class ApiFootballClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest<T>(endpoint: string): Promise<T[]> {
    const url = `${API_FOOTBALL_CONFIG.BASE_URL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'x-apisports-key': this.apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      return data.response || []
      
    } catch (error) {
      console.error('API Request Failed:', error)
      return []
    }
  }

  // Get current football season based on date
  private getCurrentSeason(): number {
    const now = new Date()
    return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  }

  // Get live and upcoming matches for specific leagues
  async getMatches(leagueIds: number[]): Promise<Fixture[]> {
    const season = this.getCurrentSeason()
    
    try {
      // First try to get live matches
      const liveMatches = await this.makeRequest<Fixture>(
        `/fixtures?live=all&season=${season}&league=${leagueIds.join('-')}`
      )

      if (liveMatches.length > 0) {
        return liveMatches
      }

      // If no live matches, get upcoming matches for next 3 days
      const today = new Date()
      const threeDaysLater = new Date(today)
      threeDaysLater.setDate(today.getDate() + 3)

      const fromDate = today.toISOString().split('T')[0]
      const toDate = threeDaysLater.toISOString().split('T')[0]

      return await this.makeRequest<Fixture>(
        `/fixtures?season=${season}&league=${leagueIds.join('-')}&from=${fromDate}&to=${toDate}`
      )
    } catch (error) {
      console.error('Failed to fetch matches:', error)
      return []
    }
  }
  
  // Get team statistics
  async getTeamStatistics(teamId: number, leagueId: number): Promise<TeamStatistics | null> {
    const season = this.getCurrentSeason()
    
    try {
      const stats = await this.makeRequest<TeamStatistics>(
        `/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`
      )
      
      return stats.length > 0 ? stats[0] : null
    } catch (error) {
      console.error(`Failed to fetch team statistics for team ${teamId}:`, error)
      return null
    }
  }
  
  // Get league standings
  async getLeagueStandings(leagueId: number): Promise<LeagueStanding | null> {
    const season = this.getCurrentSeason()
    
    try {
      const standings = await this.makeRequest<LeagueStanding>(
        `/standings?league=${leagueId}&season=${season}`
      )
      
      return standings.length > 0 ? standings[0] : null
    } catch (error) {
      console.error(`Failed to fetch standings for league ${leagueId}:`, error)
      return null
    }
  }
  
  // Get player statistics
  async getPlayerStatistics(teamId: number, leagueId: number): Promise<Player[]> {
    const season = this.getCurrentSeason()
    
    try {
      const players = await this.makeRequest<Player>(
        `/players?team=${teamId}&league=${leagueId}&season=${season}`
      )
      
      return players
    } catch (error) {
      console.error(`Failed to fetch player statistics for team ${teamId}:`, error)
      return []
    }
  }
}

// Singleton instance
let apiFootballClient: ApiFootballClient | null = null

export function initializeApiFootball(apiKey: string) {
  apiFootballClient = new ApiFootballClient(apiKey)
  return apiFootballClient
}

export function getApiFootballClient() {
  if (!apiFootballClient) {
    throw new Error('API Football client not initialized')
  }
  return apiFootballClient
} 