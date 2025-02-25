import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Call the function to create team with players
    const { data, error } = await supabase
      .rpc('create_team_with_players', {
        user_id: user.id
      })

    if (error) {
      console.error('Error creating team:', error)
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      teamId: data
    })
  } catch (error) {
    console.error('Error in setup-team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 