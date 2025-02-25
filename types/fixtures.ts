export interface Fixture {
  fixture: {
    id: number
    date: string
    timestamp: number
    timezone: string
    status: {
      long: string
      short: string
      elapsed: number | null
    }
    venue: {
      id: number
      name: string
      city: string
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    season: number
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
    away: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: {
      home: number | null
      away: number | null
    }
    fulltime: {
      home: number | null
      away: number | null
    }
    extratime: {
      home: number | null
      away: number | null
    }
    penalty: {
      home: number | null
      away: number | null
    }
  }
  events?: Array<{
    time: {
      elapsed: number
      extra?: number | null
    }
    team: {
      id: number
      name: string
      logo: string
    }
    player: {
      id: number
      name: string
    }
    assist: {
      id: number | null
      name: string | null
    }
    type: 'Goal' | 'Card' | 'Subst' | 'Var' | string
    detail: string
  }>
} 