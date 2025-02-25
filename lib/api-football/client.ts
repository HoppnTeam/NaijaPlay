import { API_FOOTBALL_CONFIG } from './config'
import { Fixture } from './types'

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