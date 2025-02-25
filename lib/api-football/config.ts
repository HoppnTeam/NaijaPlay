export const API_FOOTBALL_CONFIG = {
  BASE_URL: 'https://v3.football.api-sports.io',
  CACHE_DURATION: {
    LIVE_MATCH: 30, // 30 seconds
    PLAYER_STATS: 21600, // 6 hours
    STANDINGS: 43200, // 12 hours
    FIXTURES: 86400, // 24 hours
  },
  RATE_LIMIT: {
    FREE_TIER: {
      REQUESTS_PER_DAY: 100,
      REQUESTS_PER_MINUTE: 30,
    }
  }
}

export interface ApiResponse<T> {
  get: string
  parameters: Record<string, any>
  errors: string[]
  results: number
  paging: {
    current: number
    total: number
  }
  response: T
}

export interface ApiError {
  message: string
  code: number
}

export interface RequestOptions {
  cache?: boolean
  cacheDuration?: number
} 