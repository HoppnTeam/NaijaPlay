import { TeamStatistics, LeagueStanding, Player } from './types';

// Mock team statistics
export const MOCK_TEAM_STATISTICS: Record<number, TeamStatistics> = {
  // Enyimba FC
  2001: {
    league: {
      id: 332,
      name: "Nigerian Premier League",
      country: "Nigeria",
      logo: "https://media.api-sports.io/football/leagues/332.png",
      season: 2024
    },
    team: {
      id: 2001,
      name: "Enyimba FC",
      logo: "https://media.api-sports.io/football/teams/2001.png",
      winner: null
    },
    form: "WWDLW",
    fixtures: {
      played: {
        home: 5,
        away: 5,
        total: 10
      },
      wins: {
        home: 3,
        away: 2,
        total: 5
      },
      draws: {
        home: 1,
        away: 1,
        total: 2
      },
      loses: {
        home: 1,
        away: 2,
        total: 3
      }
    },
    goals: {
      for: {
        total: 18,
        average: "1.8",
        minute: {
          "0-15": {
            total: 3,
            percentage: "16.7%"
          },
          "16-30": {
            total: 4,
            percentage: "22.2%"
          },
          "31-45": {
            total: 2,
            percentage: "11.1%"
          },
          "46-60": {
            total: 3,
            percentage: "16.7%"
          },
          "61-75": {
            total: 4,
            percentage: "22.2%"
          },
          "76-90": {
            total: 2,
            percentage: "11.1%"
          }
        }
      },
      against: {
        total: 10,
        average: "1.0",
        minute: {
          "0-15": {
            total: 1,
            percentage: "10%"
          },
          "16-30": {
            total: 2,
            percentage: "20%"
          },
          "31-45": {
            total: 1,
            percentage: "10%"
          },
          "46-60": {
            total: 2,
            percentage: "20%"
          },
          "61-75": {
            total: 3,
            percentage: "30%"
          },
          "76-90": {
            total: 1,
            percentage: "10%"
          }
        }
      }
    }
  },
  // Kano Pillars
  2002: {
    league: {
      id: 332,
      name: "Nigerian Premier League",
      country: "Nigeria",
      logo: "https://media.api-sports.io/football/leagues/332.png",
      season: 2024
    },
    team: {
      id: 2002,
      name: "Kano Pillars",
      logo: "https://media.api-sports.io/football/teams/2002.png",
      winner: null
    },
    form: "WDWLD",
    fixtures: {
      played: {
        home: 5,
        away: 5,
        total: 10
      },
      wins: {
        home: 3,
        away: 1,
        total: 4
      },
      draws: {
        home: 1,
        away: 2,
        total: 3
      },
      loses: {
        home: 1,
        away: 2,
        total: 3
      }
    },
    goals: {
      for: {
        total: 15,
        average: "1.5",
        minute: {
          "0-15": {
            total: 2,
            percentage: "13.3%"
          },
          "16-30": {
            total: 3,
            percentage: "20%"
          },
          "31-45": {
            total: 3,
            percentage: "20%"
          },
          "46-60": {
            total: 2,
            percentage: "13.3%"
          },
          "61-75": {
            total: 3,
            percentage: "20%"
          },
          "76-90": {
            total: 2,
            percentage: "13.3%"
          }
        }
      },
      against: {
        total: 12,
        average: "1.2",
        minute: {
          "0-15": {
            total: 2,
            percentage: "16.7%"
          },
          "16-30": {
            total: 1,
            percentage: "8.3%"
          },
          "31-45": {
            total: 3,
            percentage: "25%"
          },
          "46-60": {
            total: 2,
            percentage: "16.7%"
          },
          "61-75": {
            total: 2,
            percentage: "16.7%"
          },
          "76-90": {
            total: 2,
            percentage: "16.7%"
          }
        }
      }
    }
  }
};

// Mock league standings
export const MOCK_LEAGUE_STANDINGS: Record<number, LeagueStanding> = {
  // Nigerian Premier League
  332: {
    league: {
      id: 332,
      name: "Nigerian Premier League",
      country: "Nigeria",
      logo: "https://media.api-sports.io/football/leagues/332.png",
      season: 2024,
      standings: [[
        {
          rank: 1,
          team: {
            id: 2001,
            name: "Enyimba FC",
            logo: "https://media.api-sports.io/football/teams/2001.png",
            winner: null
          },
          points: 17,
          goalsDiff: 8,
          group: "Nigerian Premier League",
          form: "WWDLW",
          status: "same",
          description: null,
          all: {
            played: 10,
            win: 5,
            draw: 2,
            lose: 3,
            goals: {
              for: 18,
              against: 10
            }
          }
        },
        {
          rank: 2,
          team: {
            id: 2002,
            name: "Kano Pillars",
            logo: "https://media.api-sports.io/football/teams/2002.png",
            winner: null
          },
          points: 15,
          goalsDiff: 3,
          group: "Nigerian Premier League",
          form: "WDWLD",
          status: "same",
          description: null,
          all: {
            played: 10,
            win: 4,
            draw: 3,
            lose: 3,
            goals: {
              for: 15,
              against: 12
            }
          }
        },
        {
          rank: 3,
          team: {
            id: 2003,
            name: "Rivers United",
            logo: "https://media.api-sports.io/football/teams/2003.png",
            winner: null
          },
          points: 14,
          goalsDiff: 5,
          group: "Nigerian Premier League",
          form: "DWWLD",
          status: "same",
          description: null,
          all: {
            played: 10,
            win: 4,
            draw: 2,
            lose: 4,
            goals: {
              for: 16,
              against: 11
            }
          }
        },
        {
          rank: 4,
          team: {
            id: 2004,
            name: "Shooting Stars",
            logo: "https://media.api-sports.io/football/teams/2004.png",
            winner: null
          },
          points: 13,
          goalsDiff: 2,
          group: "Nigerian Premier League",
          form: "LWDWD",
          status: "same",
          description: null,
          all: {
            played: 10,
            win: 3,
            draw: 4,
            lose: 3,
            goals: {
              for: 12,
              against: 10
            }
          }
        }
      ]]
    }
  }
};

// Mock player statistics
export const MOCK_PLAYER_STATISTICS: Record<number, Player[]> = {
  // Enyimba FC players
  2001: [
    {
      id: 10001,
      name: "John Obi",
      number: 10,
      position: "Attacker",
      grid: "3-1",
      statistics: [{
        games: {
          minutes: 850,
          number: 10,
          position: "F",
          rating: "7.8",
          captain: false,
          substitute: false
        },
        shots: {
          total: 24,
          on: 15
        },
        goals: {
          total: 8,
          conceded: 0,
          assists: 3
        },
        passes: {
          total: 245,
          key: 18,
          accuracy: 78
        },
        tackles: {
          total: 12,
          blocks: 2,
          interceptions: 5
        },
        cards: {
          yellow: 2,
          red: 0
        }
      }]
    },
    {
      id: 10002,
      name: "Samuel Kalu",
      number: 7,
      position: "Midfielder",
      grid: "2-2",
      statistics: [{
        games: {
          minutes: 900,
          number: 7,
          position: "M",
          rating: "7.5",
          captain: false,
          substitute: false
        },
        shots: {
          total: 15,
          on: 8
        },
        goals: {
          total: 3,
          conceded: 0,
          assists: 6
        },
        passes: {
          total: 420,
          key: 25,
          accuracy: 85
        },
        tackles: {
          total: 28,
          blocks: 5,
          interceptions: 12
        },
        cards: {
          yellow: 3,
          red: 0
        }
      }]
    }
  ],
  // Kano Pillars players
  2002: [
    {
      id: 10003,
      name: "Ibrahim Hassan",
      number: 9,
      position: "Attacker",
      grid: "3-1",
      statistics: [{
        games: {
          minutes: 870,
          number: 9,
          position: "F",
          rating: "7.6",
          captain: true,
          substitute: false
        },
        shots: {
          total: 22,
          on: 14
        },
        goals: {
          total: 7,
          conceded: 0,
          assists: 2
        },
        passes: {
          total: 210,
          key: 12,
          accuracy: 75
        },
        tackles: {
          total: 8,
          blocks: 1,
          interceptions: 3
        },
        cards: {
          yellow: 1,
          red: 0
        }
      }]
    }
  ]
}; 