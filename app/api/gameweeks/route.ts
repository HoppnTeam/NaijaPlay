import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current gameweek
    const { data: gameweek, error: gameweekError } = await supabase
      .from('gameweeks')
      .select('*')
      .eq('status', 'in_progress')
      .single()

    if (gameweekError && gameweekError.code !== 'PGRST116') {
      throw gameweekError
    }

    // If no active gameweek, get the most recent one
    if (!gameweek) {
      const { data: recentGameweek, error: recentError } = await supabase
        .from('gameweeks')
        .select('*')
        .order('number', { ascending: false })
        .limit(1)
        .single()

      if (recentError && recentError.code !== 'PGRST116') {
        throw recentError
      }

      if (!recentGameweek) {
        // If no gameweeks exist, create one
        const startDate = new Date()
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 7)

        const { data: newGameweek, error: createError } = await supabase
          .from('gameweeks')
          .insert({
            number: 1,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            status: 'upcoming'
          })
          .select()
          .single()

        if (createError) throw createError

        return NextResponse.json({
          gameweek: newGameweek,
          matches: [],
          leaderboard: []
        })
      }

      return NextResponse.json({
        gameweek: recentGameweek,
        matches: [],
        leaderboard: []
      })
    }

    // Get live matches
    const { data: matches, error: matchesError } = await supabase
      .from('match_history')
      .select(`
        *,
        home_team:teams!match_history_home_team_id_fkey (id, name),
        away_team:teams!match_history_away_team_id_fkey (id, name)
      `)
      .eq('status', 'in_progress')

    if (matchesError) throw matchesError

    // Get teams if no matches
    let currentMatches = matches || []
    if (currentMatches.length === 0) {
      let { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .limit(6)

      if (teamsError) throw teamsError

      // If no teams exist, create some
      if (!teams || teams.length < 2) {
        const demoTeams = [
          { name: 'Team Alpha', user_id: 'system' },
          { name: 'Team Beta', user_id: 'system' },
          { name: 'Team Gamma', user_id: 'system' },
          { name: 'Team Delta', user_id: 'system' }
        ]

        const { data: createdTeams, error: createTeamsError } = await supabase
          .from('teams')
          .insert(demoTeams)
          .select('id, name')

        if (createTeamsError) throw createTeamsError
        teams = createdTeams
      }

      // If we have teams but no matches, create some
      if (teams && teams.length >= 2) {
        const newMatches = []
        for (let i = 0; i < teams.length - 1; i += 2) {
          const matchDate = new Date()
          matchDate.setHours(matchDate.getHours() + i)

          newMatches.push({
            gameweek_id: gameweek.id,
            home_team_id: teams[i].id,
            away_team_id: teams[i + 1].id,
            match_date: matchDate.toISOString(),
            status: 'scheduled',
            home_score: 0,
            away_score: 0
          })
        }

        const { data: createdMatches, error: createError } = await supabase
          .from('match_history')
          .insert(newMatches)
          .select(`
            *,
            home_team:teams!match_history_home_team_id_fkey (id, name),
            away_team:teams!match_history_away_team_id_fkey (id, name)
          `)

        if (createError) throw createError
        currentMatches = createdMatches || []
      }
    }

    // Get leaderboard
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('team_gameweek_stats')
      .select(`
        *,
        teams (
          id,
          name,
          profiles (
            full_name
          )
        )
      `)
      .eq('gameweek_id', gameweek?.id)
      .order('total_points', { ascending: false })

    if (leaderboardError) throw leaderboardError

    return NextResponse.json({
      gameweek,
      matches: currentMatches,
      leaderboard: leaderboard || []
    })
  } catch (error) {
    console.error('Error fetching gameweek data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gameweek data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { number, startDate, endDate } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase
      .from('gameweeks')
      .insert({
        number,
        start_date: startDate,
        end_date: endDate,
        status: 'upcoming'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating gameweek:', error)
    return NextResponse.json(
      { error: 'Failed to create gameweek' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase
      .from('gameweeks')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating gameweek:', error)
    return NextResponse.json(
      { error: 'Failed to update gameweek' },
      { status: 500 }
    )
  }
} 