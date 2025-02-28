import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const limiter = await rateLimit(req, 10, '1m')
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Get user session
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Fetch active challenges with user progress
    const { data: challenges, error } = await supabase
      .from('weekly_challenges')
      .select(`
        id,
        title,
        description,
        reward_tokens,
        start_date,
        end_date,
        is_active,
        max_progress,
        user_challenges!inner(
          user_id,
          challenge_id,
          progress,
          is_claimed
        )
      `)
      .eq('is_active', true)
      .eq('user_challenges.user_id', userId)
      .order('end_date', { ascending: true })

    if (error) {
      console.error('Error fetching challenges:', error)
      return NextResponse.json(
        { error: 'Failed to fetch challenges' },
        { status: 500 }
      )
    }

    // If no user challenges exist yet, fetch active challenges without the inner join
    if (challenges.length === 0) {
      const { data: activeChallengesToCreate, error: fetchError } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true)
        .order('end_date', { ascending: true })

      if (fetchError) {
        console.error('Error fetching active challenges:', fetchError)
        return NextResponse.json(
          { error: 'Failed to fetch challenges' },
          { status: 500 }
        )
      }

      // Create user_challenges entries for each active challenge
      if (activeChallengesToCreate && activeChallengesToCreate.length > 0) {
        const userChallenges = activeChallengesToCreate.map(challenge => ({
          user_id: userId,
          challenge_id: challenge.id,
          progress: 0,
          is_claimed: false
        }))

        const { error: insertError } = await supabase
          .from('user_challenges')
          .insert(userChallenges)

        if (insertError) {
          console.error('Error creating user challenges:', insertError)
          return NextResponse.json(
            { error: 'Failed to initialize challenges' },
            { status: 500 }
          )
        }

        // Format challenges for response
        const formattedChallenges = activeChallengesToCreate.map(challenge => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          reward_tokens: challenge.reward_tokens,
          start_date: challenge.start_date,
          end_date: challenge.end_date,
          is_active: challenge.is_active,
          max_progress: challenge.max_progress,
          user_progress: 0,
          is_completed: false,
          is_claimed: false
        }))

        return NextResponse.json({ challenges: formattedChallenges })
      }

      return NextResponse.json({ challenges: [] })
    }

    // Format challenges with user progress
    const formattedChallenges = challenges.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      reward_tokens: challenge.reward_tokens,
      start_date: challenge.start_date,
      end_date: challenge.end_date,
      is_active: challenge.is_active,
      max_progress: challenge.max_progress,
      user_progress: challenge.user_challenges[0].progress,
      is_completed: challenge.user_challenges[0].progress >= challenge.max_progress,
      is_claimed: challenge.user_challenges[0].is_claimed
    }))

    return NextResponse.json({ challenges: formattedChallenges })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Get request body
    const body = await req.json()
    const { challengeId } = body

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      )
    }

    // Call the claim_challenge_reward RPC function
    const { data, error } = await supabase
      .rpc('claim_challenge_reward', {
        p_challenge_id: challengeId,
        p_user_id: userId
      })

    if (error) {
      console.error('Error claiming challenge reward:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to claim reward' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      tokens_awarded: data.tokens_awarded
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 