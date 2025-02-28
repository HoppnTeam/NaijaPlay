import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

// Define the reward structure for each day
const DAILY_REWARDS = [
  { day: 1, tokens: 5 },
  { day: 2, tokens: 5 },
  { day: 3, tokens: 10 },
  { day: 4, tokens: 10 },
  { day: 5, tokens: 15 },
  { day: 6, tokens: 15 },
  { day: 7, tokens: 25 },
]

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

    // Get user's login history
    const { data: loginHistory, error: loginError } = await supabase
      .from('daily_logins')
      .select('*')
      .eq('user_id', userId)
      .order('login_date', { ascending: false })
      .limit(7)

    if (loginError) {
      console.error('Error fetching login history:', loginError)
      return NextResponse.json(
        { error: 'Failed to fetch login history' },
        { status: 500 }
      )
    }

    // Calculate which day rewards are available
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    
    // Check if user has already claimed today
    const claimedToday = loginHistory.some(login => 
      new Date(login.login_date).toISOString().split('T')[0] === today.split('T')[0] && 
      login.is_claimed
    )

    // Determine the current day in the reward cycle
    let currentDay = 1
    let nextRewardTime = null

    if (loginHistory.length > 0) {
      // Sort login history by date (newest first)
      const sortedHistory = [...loginHistory].sort((a, b) => 
        new Date(b.login_date).getTime() - new Date(a.login_date).getTime()
      )
      
      // If claimed today, current day is the day after the most recent claim
      if (claimedToday) {
        currentDay = Math.min((sortedHistory[0].day % 7) + 1, 7)
        
        // Set next reward time to tomorrow
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        nextRewardTime = tomorrow.toISOString()
      } else {
        // If not claimed today, current day is either the next day after last claim
        // or day 1 if it's been more than a day since last claim
        const lastClaimDate = new Date(sortedHistory[0].login_date)
        const daysSinceLastClaim = Math.floor((now.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSinceLastClaim <= 1) {
          currentDay = Math.min((sortedHistory[0].day % 7) + 1, 7)
        } else {
          currentDay = 1 // Reset to day 1 if more than a day has passed
        }
      }
    }

    // Prepare rewards data
    const rewards = DAILY_REWARDS.map((reward, index) => {
      const day = index + 1
      const claimed = loginHistory.some(login => login.day === day && login.is_claimed)
      const available = !claimed && (day === currentDay) && !claimedToday
      
      return {
        day,
        tokens: reward.tokens,
        claimed,
        available,
        date: loginHistory.find(login => login.day === day)?.login_date || null
      }
    })

    return NextResponse.json({
      rewards,
      nextRewardTime
    })
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

    // Check if user has already claimed today
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    
    const { data: existingLogin, error: checkError } = await supabase
      .from('daily_logins')
      .select('*')
      .eq('user_id', userId)
      .gte('login_date', today.split('T')[0])
      .lt('login_date', new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString().split('T')[0])
      .limit(1)

    if (checkError) {
      console.error('Error checking login status:', checkError)
      return NextResponse.json(
        { error: 'Failed to check login status' },
        { status: 500 }
      )
    }

    if (existingLogin && existingLogin.length > 0 && existingLogin[0].is_claimed) {
      return NextResponse.json(
        { error: 'Daily reward already claimed today' },
        { status: 400 }
      )
    }

    // Get user's login history to determine current day
    const { data: loginHistory, error: historyError } = await supabase
      .from('daily_logins')
      .select('*')
      .eq('user_id', userId)
      .order('login_date', { ascending: false })
      .limit(7)

    if (historyError) {
      console.error('Error fetching login history:', historyError)
      return NextResponse.json(
        { error: 'Failed to fetch login history' },
        { status: 500 }
      )
    }

    // Determine the current day in the reward cycle
    let currentDay = 1
    
    if (loginHistory.length > 0) {
      const lastLogin = loginHistory[0]
      const lastLoginDate = new Date(lastLogin.login_date)
      const daysSinceLastLogin = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastLogin <= 1) {
        // Continue the streak
        currentDay = Math.min((lastLogin.day % 7) + 1, 7)
      } else {
        // Reset to day 1 if more than a day has passed
        currentDay = 1
      }
    }

    // Get the token reward for the current day
    const reward = DAILY_REWARDS[currentDay - 1]
    const tokensAwarded = reward.tokens

    // Begin transaction to claim reward
    const { data, error } = await supabase.rpc(
      'claim_daily_login_reward',
      {
        p_user_id: userId,
        p_day: currentDay,
        p_tokens: tokensAwarded
      }
    )

    if (error) {
      console.error('Error claiming daily reward:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to claim daily reward' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      tokens_awarded: tokensAwarded,
      day: currentDay
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 