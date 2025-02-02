import { createId } from '@paralleldrive/cuid2'
import { MatchResult, Team } from './match-engine'

export interface Gameweek {
  id: string
  number: number
  startDate: Date
  endDate: Date
  status: 'upcoming' | 'in_progress' | 'completed'
  fixtures: GameweekFixture[]
}

export interface GameweekFixture {
  id: string
  gameweekId: string
  homeTeamId: string
  awayTeamId: string
  kickoffTime: Date
  status: 'scheduled' | 'in_progress' | 'completed'
  matchResult?: MatchResult
}

export class GameweekManager {
  private static MATCH_DURATION_MINUTES = 90
  private static REAL_TIME_RATIO = 6 // 1 game minute = 10 real seconds

  public createGameweek(
    number: number,
    startDate: Date,
    endDate: Date,
    teams: Team[]
  ): Gameweek {
    // Generate fixtures using round-robin algorithm
    const fixtures = this.generateFixtures(teams, startDate)

    return {
      id: createId(),
      number,
      startDate,
      endDate,
      status: 'upcoming',
      fixtures
    }
  }

  private generateFixtures(teams: Team[], startDate: Date): GameweekFixture[] {
    const fixtures: GameweekFixture[] = []
    const teamCount = teams.length
    
    // Ensure even number of teams
    if (teamCount % 2 !== 0) {
      throw new Error('Number of teams must be even')
    }

    // Generate pairs of teams
    for (let i = 0; i < teamCount - 1; i += 2) {
      const homeTeam = teams[i]
      const awayTeam = teams[i + 1]
      
      // Calculate kickoff time with 2-hour intervals
      const kickoffTime = new Date(startDate)
      kickoffTime.setHours(kickoffTime.getHours() + (i * 2))

      fixtures.push({
        id: createId(),
        gameweekId: '', // Will be set when gameweek is created
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        kickoffTime,
        status: 'scheduled'
      })
    }

    return fixtures
  }

  public calculateRealTimeMinute(kickoffTime: Date): number {
    const now = new Date()
    const elapsedSeconds = (now.getTime() - kickoffTime.getTime()) / 1000
    const gameMinute = Math.floor(elapsedSeconds / GameweekManager.REAL_TIME_RATIO)
    
    return Math.min(gameMinute, GameweekManager.MATCH_DURATION_MINUTES)
  }

  public isFixtureInProgress(fixture: GameweekFixture): boolean {
    const now = new Date()
    const matchEndTime = new Date(fixture.kickoffTime)
    matchEndTime.setSeconds(
      matchEndTime.getSeconds() + 
      GameweekManager.MATCH_DURATION_MINUTES * GameweekManager.REAL_TIME_RATIO
    )

    return now >= fixture.kickoffTime && now <= matchEndTime
  }

  public updateGameweekStatus(gameweek: Gameweek): Gameweek {
    const now = new Date()

    if (now < gameweek.startDate) {
      return { ...gameweek, status: 'upcoming' }
    }

    if (now > gameweek.endDate) {
      return { ...gameweek, status: 'completed' }
    }

    const hasInProgressFixtures = gameweek.fixtures.some(
      fixture => fixture.status === 'in_progress'
    )
    const hasUpcomingFixtures = gameweek.fixtures.some(
      fixture => fixture.status === 'scheduled'
    )

    if (hasInProgressFixtures || hasUpcomingFixtures) {
      return { ...gameweek, status: 'in_progress' }
    }

    return { ...gameweek, status: 'completed' }
  }

  public updateFixtureStatuses(gameweek: Gameweek): GameweekFixture[] {
    return gameweek.fixtures.map(fixture => {
      if (fixture.status === 'completed') {
        return fixture
      }

      const now = new Date()
      const matchEndTime = new Date(fixture.kickoffTime)
      matchEndTime.setSeconds(
        matchEndTime.getSeconds() + 
        GameweekManager.MATCH_DURATION_MINUTES * GameweekManager.REAL_TIME_RATIO
      )

      if (now < fixture.kickoffTime) {
        return { ...fixture, status: 'scheduled' }
      }

      if (now > matchEndTime) {
        return { ...fixture, status: 'completed' }
      }

      return { ...fixture, status: 'in_progress' }
    })
  }
} 