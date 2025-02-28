import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    // Rate limiting
    const limiter = await rateLimit(req, 5, '1m')
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limiter.limit.toString(),
            'X-RateLimit-Remaining': limiter.remaining.toString(),
            'X-RateLimit-Reset': limiter.reset.toString()
          }
        }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Get user session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const { tokenAmount } = await req.json()
    
    // Validate token amount
    if (!tokenAmount || tokenAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid token amount' },
        { status: 400 }
      )
    }

    // Verify team ownership
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', params.teamId)
      .eq('user_id', user.id)
      .single()
    
    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found or you do not have permission' },
        { status: 404 }
      )
    }

    // Get user's token balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // Check if user has enough tokens
    if (profile.tokens < tokenAmount) {
      return NextResponse.json(
        { error: 'Insufficient tokens' },
        { status: 400 }
      )
    }

    // Calculate budget increase (1 token = 1,000,000 fantasy money)
    const budgetIncrease = tokenAmount * 1_000_000

    // Begin transaction
    const { data: transaction, error: transactionError } = await supabase
      .rpc('use_tokens_for_budget', {
        p_user_id: user.id,
        p_team_id: params.teamId,
        p_token_amount: tokenAmount,
        p_budget_increase: budgetIncrease
      })
    
    if (transactionError) {
      console.error('Transaction error:', transactionError)
      return NextResponse.json(
        { error: 'Failed to process transaction' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Budget topped up successfully',
      newBudget: team.budget + budgetIncrease,
      tokensUsed: tokenAmount,
      remainingTokens: profile.tokens - tokenAmount
    })

  } catch (error) {
    console.error('Budget top-up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 