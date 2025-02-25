import { getApiFootballClient } from '../client'
import { Fixture } from '../types'

// League IDs we're interested in
const LEAGUE_IDS = [
  39,  // English Premier League
  332  // Nigerian Premier League
]

const UPDATE_INTERVAL = 60 * 1000 // 1 minute

class LiveMatchesService {
  private matches: Fixture[] = []
  private lastUpdate: number = 0
  private updateTimer: NodeJS.Timeout | null = null
  private isLive: boolean = false

  // Start periodic updates
  startUpdates() {
    this.updateMatches()
    this.updateTimer = setInterval(() => this.updateMatches(), UPDATE_INTERVAL)
  }

  // Stop updates
  stopUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }
  }

  // Get current matches
  getMatches(): { matches: Fixture[], isLive: boolean } {
    return { 
      matches: this.matches,
      isLive: this.isLive
    }
  }

  // Force an immediate update
  async refreshMatches(): Promise<void> {
    await this.updateMatches()
  }

  private async updateMatches() {
    try {
      const client = getApiFootballClient()
      const matches = await client.getMatches(LEAGUE_IDS)

      // Update state
      this.matches = matches
      this.lastUpdate = Date.now()
      this.isLive = matches.some(match => 
        match.fixture.status.short === '1H' || 
        match.fixture.status.short === '2H' || 
        match.fixture.status.short === 'HT'
      )

      // Notify listeners
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to update matches:', error)
    }
  }

  private notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('matches-update', {
        detail: this.getMatches()
      }))
    }
  }

  // Subscribe to updates
  subscribe(callback: (data: { matches: Fixture[], isLive: boolean }) => void): () => void {
    if (typeof window === 'undefined') return () => {}

    const handler = (event: CustomEvent<{ matches: Fixture[], isLive: boolean }>) => {
      callback(event.detail)
    }

    window.addEventListener('matches-update', handler as EventListener)
    return () => window.removeEventListener('matches-update', handler as EventListener)
  }
}

// Export singleton instance
export const liveMatchesService = new LiveMatchesService() 