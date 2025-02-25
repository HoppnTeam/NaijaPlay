export interface Fixture {
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    timestamp: number
    status: {
      long: string
      short: string
      elapsed: number | null
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
    home: Team
    away: Team
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
  }
  events: Event[]
  lineups: Lineup[]
  statistics: MatchStatistics[]
}

export interface Team {
  id: number
  name: string
  logo: string
  winner: boolean | null
}

export interface Event {
  time: {
    elapsed: number
    extra: number | null
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
  type: string
  detail: string
}

export interface Lineup {
  team: Team
  formation: string
  startXI: Player[]
  substitutes: Player[]
  coach: {
    id: number
    name: string
    photo: string
  }
}

export interface Player {
  id: number
  name: string
  number: number
  position: string
  grid: string | null
  statistics: PlayerStatistics[]
}

export interface PlayerStatistics {
  games: {
    minutes: number
    number: number
    position: string
    rating: string | null
    captain: boolean
    substitute: boolean
  }
  shots: {
    total: number | null
    on: number | null
  }
  goals: {
    total: number | null
    conceded: number | null
    assists: number | null
  }
  passes: {
    total: number | null
    key: number | null
    accuracy: number | null
  }
  tackles: {
    total: number | null
    blocks: number | null
    interceptions: number | null
  }
  cards: {
    yellow: number
    red: number
  }
}

export interface MatchStatistics {
  team: Team
  statistics: Array<{
    type: string
    value: number | string | null
  }>
}

export interface LeagueStanding {
  league: {
    id: number
    name: string
    country: string
    logo: string
    season: number
    standings: Array<Array<{
      rank: number
      team: Team
      points: number
      goalsDiff: number
      group: string
      form: string
      status: string
      description: string | null
      all: {
        played: number
        win: number
        draw: number
        lose: number
        goals: {
          for: number
          against: number
        }
      }
    }>>
  }
}

export interface TeamStatistics {
  league: {
    id: number
    name: string
    country: string
    logo: string
    season: number
  }
  team: Team
  form: string
  fixtures: {
    played: {
      home: number
      away: number
      total: number
    }
    wins: {
      home: number
      away: number
      total: number
    }
    draws: {
      home: number
      away: number
      total: number
    }
    loses: {
      home: number
      away: number
      total: number
    }
  }
  goals: {
    for: {
      total: number
      average: string
      minute: {
        [key: string]: {
          total: number
          percentage: string
        }
      }
    }
    against: {
      total: number
      average: string
      minute: {
        [key: string]: {
          total: number
          percentage: string
        }
      }
    }
  }
} 