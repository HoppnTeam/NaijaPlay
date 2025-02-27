import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { rateLimit } from '@/lib/rate-limit'

// Define conversion rate: 1 token = 0.5 million budget
const TOKEN_TO_BUDGET_RATE = 0.5

export async function POST(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    // Rate limiting
    const limiter = await rateLimit(req, 5, '1m')
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Get user session
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const teamId = params.teamId

    // Verify team ownership
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, budget')
      .eq('id', teamId)
      .eq('user_id', userId)
      .single()

    if (teamError || !team) {
      console.error('Team ownership verification error:', teamError)
      return NextResponse.json(
        { error: 'Team not found or you do not have permission' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await req.json()
    const { tokens } = body

    if (!tokens || tokens <= 0 || !Number.isInteger(tokens)) {
      return NextResponse.json(
        { error: 'Invalid token amount' },
        { status: 400 }
      )
    }

    // Get user's token balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch token balance' },
        { status: 500 }
      )
    }

    if (profile.tokens < tokens) {
      return NextResponse.json(
        { error: 'Insufficient tokens' },
        { status: 400 }
      )
    }

    // Calculate budget increase
    const budgetIncrease = tokens * TOKEN_TO_BUDGET_RATE
    const newBudget = team.budget + budgetIncrease

    // Begin transaction to update budget and deduct tokens
    const { data, error } = await supabase.rpc(
      'top_up_team_budget',
      {
        p_user_id: userId,
        p_team_id: teamId,
        p_tokens: tokens,
        p_budget_increase: budgetIncrease
      }
    )

    if (error) {
      console.error('Error in budget top-up transaction:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to top up budget' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tokens_used: tokens,
      budget_increase: budgetIncrease,
      new_budget: newBudget
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 