import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { formation } = await request.json()
    const teamId = params.teamId

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation is required' },
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

    // Update team formation
    const { error: updateError } = await supabase
      .from('teams')
      .update({ formation })
      .eq('id', teamId)

    if (updateError) {
      console.error('Formation update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update formation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Formation updated successfully'
    })
  } catch (error) {
    console.error('Unhandled error in formation update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 