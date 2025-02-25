import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const teamId = params.teamId

    // Verify user owns the team
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get team details with players
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        budget,
        formation,
        playing_style,
        mentality,
        team_players (
          player_id,
          players (
            current_price
          )
        )
      `)
      .eq('id', teamId)
      .eq('user_id', user.id)
      .single()

    if (teamError) {
      console.error('Error fetching team:', teamError)
      return NextResponse.json(
        { error: 'Failed to fetch team details' },
        { status: 500 }
      )
    }

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 404 }
      )
    }

    // Calculate total squad value
    const total_value = team.team_players?.reduce((sum, tp) => {
      return sum + (tp.players?.current_price || 0)
    }, 0) || 0

    // Update team's total value in database
    const { error: updateError } = await supabase
      .from('teams')
      .update({ total_value })
      .eq('id', teamId)

    if (updateError) {
      console.error('Error updating total value:', updateError)
    }

    return NextResponse.json({
      ...team,
      total_value
    })
  } catch (error) {
    console.error('Error in team endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 