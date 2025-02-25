import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { playingStyle, mentality } = await request.json()
    const teamId = params.teamId

    if (!playingStyle || !mentality) {
      return NextResponse.json(
        { error: 'Playing style and mentality are required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verify user owns the team
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      )
    }
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .eq('user_id', user.id)
      .single()

    if (teamError) {
      console.error('Team fetch error:', teamError)
      return NextResponse.json(
        { error: 'Error fetching team details' },
        { status: 500 }
      )
    }
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update team tactics
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        playing_style: playingStyle,
        mentality: mentality
      })
      .eq('id', teamId)

    if (updateError) {
      console.error('Tactics update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update tactics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tactics updated successfully'
    })
  } catch (error) {
    console.error('Unhandled error in tactics update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 