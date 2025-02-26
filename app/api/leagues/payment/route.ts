import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PaystackClient } from '@/lib/paystack'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const { 
      tierId, 
      email,
      leagueName,
      leagueDescription,
      leagueType,
      maxTeams,
      entryFee,
      totalPrize,
      startDate,
      endDate
    } = await request.json()

    // Validate required fields
    if (!tierId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get tier details
    const { data: tier, error: tierError } = await supabase
      .from('league_pricing')
      .select('*')
      .eq('id', tierId)
      .single()

    if (tierError || !tier) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      )
    }

    // If tier is free, create league directly
    if (tier.price === 0) {
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .insert({
          name: leagueName,
          description: `${leagueType} League: ${leagueDescription}`,
          max_teams: maxTeams,
          entry_fee: entryFee,
          total_prize: totalPrize,
          start_date: startDate,
          end_date: endDate,
          status: 'upcoming',
          created_by: user.id,
          league_tier_id: tierId,
          platform_fee_percentage: 10 // Default 10%
        })
        .select()
        .single()

      if (leagueError) {
        return NextResponse.json(
          { error: 'Failed to create league' },
          { status: 500 }
        )
      }

      // Create league settings with default values
      await supabase
        .from('league_settings')
        .insert({
          league_id: league.id,
          points_per_goal: 4,
          points_per_assist: 3,
          points_per_clean_sheet: 4,
          points_per_penalty_save: 5,
          points_per_penalty_miss: -2,
          points_per_yellow_card: -1,
          points_per_red_card: -3,
          points_per_own_goal: -2,
          points_per_save: 0.5,
          points_per_goal_conceded: -1
        })

      return NextResponse.json({
        success: true,
        league_id: league.id,
        free_tier: true
      })
    }

    // For paid tiers, process payment
    // Validate Paystack secret key
    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Payment service is not configured' },
        { status: 500 }
      )
    }

    // Create a pending league record
    const { data: pendingLeague, error: pendingLeagueError } = await supabase
      .from('leagues')
      .insert({
        name: leagueName,
        description: `${leagueType} League: ${leagueDescription}`,
        max_teams: maxTeams,
        entry_fee: entryFee,
        total_prize: totalPrize,
        start_date: startDate,
        end_date: endDate,
        status: 'pending_payment',
        created_by: user.id,
        league_tier_id: tierId,
        platform_fee_percentage: 10 // Default 10%
      })
      .select()
      .single()

    if (pendingLeagueError) {
      return NextResponse.json(
        { error: 'Failed to create pending league' },
        { status: 500 }
      )
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'league_creation',
        amount: -tier.price, // Negative amount as it's a payment
        status: 'pending',
        metadata: {
          league_id: pendingLeague.id,
          tier_name: tier.name,
          tier_price: tier.price
        }
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      
      // Clean up the pending league
      await supabase
        .from('leagues')
        .delete()
        .eq('id', pendingLeague.id)
        
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Initialize Paystack transaction
    const paystackClient = new PaystackClient(PAYSTACK_SECRET_KEY)
    
    try {
      const paystackResponse = await paystackClient.transaction.initialize({
        email,
        amount: tier.price * 100, // Convert to kobo
        reference: transaction.id,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leagues/payment/callback`,
        metadata: {
          purchase_id: transaction.id,
          team_id: '', // Not applicable for league creation
          package_id: tier.id,
          token_amount: 0, // Not applicable for league creation
          league_id: pendingLeague.id
        }
      })

      return NextResponse.json({
        authorization_url: paystackResponse.authorization_url,
        reference: transaction.id,
        league_id: pendingLeague.id,
        free_tier: false
      })
    } catch (error) {
      console.error('Paystack error:', error)
      
      // Clean up the pending league and transaction
      await supabase
        .from('leagues')
        .delete()
        .eq('id', pendingLeague.id)
        
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id)
        
      return NextResponse.json(
        { error: 'Payment initialization failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in league payment route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 