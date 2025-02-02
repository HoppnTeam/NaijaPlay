import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { gameweekId, homeTeamId, awayTeamId, matchDate } = await request.json()

    const { data: match, error } = await supabase
      .from('match_history')
      .insert({
        gameweek_id: gameweekId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: matchDate,
        status: 'scheduled',
        home_score: 0,
        away_score: 0
      })
      .select(`
        *,
        home_team:teams!match_history_home_team_id_fkey (*),
        away_team:teams!match_history_away_team_id_fkey (*)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(match)
  } catch (error) {
    console.error('Error scheduling match:', error)
    return NextResponse.json(
      { error: 'Failed to schedule match' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id, status, homeScore, awayScore, events, performances } = await request.json()

    const { data: match, error } = await supabase
      .from('match_history')
      .update({
        status,
        home_score: homeScore,
        away_score: awayScore,
        match_events: events,
        player_performances: performances
      })
      .eq('id', id)
      .select(`
        *,
        home_team:teams!match_history_home_team_id_fkey (*),
        away_team:teams!match_history_away_team_id_fkey (*)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(match)
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    )
  }
} 