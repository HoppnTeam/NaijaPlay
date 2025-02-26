import { Fixture } from './types'

// Mock data for fixtures when API doesn't return any matches
export const MOCK_FIXTURES: Fixture[] = [
  {
    fixture: {
      id: 1001,
      referee: "John Smith",
      timezone: "UTC",
      date: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      timestamp: Math.floor(Date.now() / 1000) + 3600,
      status: {
        long: "Not Started",
        short: "NS",
        elapsed: null
      }
    },
    league: {
      id: 332,
      name: "Nigerian Premier League",
      country: "Nigeria",
      logo: "https://media.api-sports.io/football/leagues/332.png",
      season: 2024
    },
    teams: {
      home: {
        id: 2001,
        name: "Enyimba FC",
        logo: "https://media.api-sports.io/football/teams/2001.png",
        winner: null
      },
      away: {
        id: 2002,
        name: "Kano Pillars",
        logo: "https://media.api-sports.io/football/teams/2002.png",
        winner: null
      }
    },
    goals: {
      home: null,
      away: null
    },
    score: {
      halftime: {
        home: null,
        away: null
      },
      fulltime: {
        home: null,
        away: null
      }
    },
    events: [],
    lineups: [],
    statistics: []
  },
  {
    fixture: {
      id: 1002,
      referee: "Michael Johnson",
      timezone: "UTC",
      date: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      timestamp: Math.floor(Date.now() / 1000) + 7200,
      status: {
        long: "Not Started",
        short: "NS",
        elapsed: null
      }
    },
    league: {
      id: 332,
      name: "Nigerian Premier League",
      country: "Nigeria",
      logo: "https://media.api-sports.io/football/leagues/332.png",
      season: 2024
    },
    teams: {
      home: {
        id: 2003,
        name: "Rivers United",
        logo: "https://media.api-sports.io/football/teams/2003.png",
        winner: null
      },
      away: {
        id: 2004,
        name: "Shooting Stars",
        logo: "https://media.api-sports.io/football/teams/2004.png",
        winner: null
      }
    },
    goals: {
      home: null,
      away: null
    },
    score: {
      halftime: {
        home: null,
        away: null
      },
      fulltime: {
        home: null,
        away: null
      }
    },
    events: [],
    lineups: [],
    statistics: []
  },
  {
    fixture: {
      id: 1003,
      referee: "David Williams",
      timezone: "UTC",
      date: new Date(Date.now() + 10800000).toISOString(), // 3 hours from now
      timestamp: Math.floor(Date.now() / 1000) + 10800,
      status: {
        long: "Not Started",
        short: "NS",
        elapsed: null
      }
    },
    league: {
      id: 39,
      name: "English Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      season: 2024
    },
    teams: {
      home: {
        id: 40,
        name: "Liverpool",
        logo: "https://media.api-sports.io/football/teams/40.png",
        winner: null
      },
      away: {
        id: 33,
        name: "Manchester United",
        logo: "https://media.api-sports.io/football/teams/33.png",
        winner: null
      }
    },
    goals: {
      home: null,
      away: null
    },
    score: {
      halftime: {
        home: null,
        away: null
      },
      fulltime: {
        home: null,
        away: null
      }
    },
    events: [],
    lineups: [],
    statistics: []
  }
] 