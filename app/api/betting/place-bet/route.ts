import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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
    const body = await request.json()
    const { 
      betType,
      amount,
      gameweek,
      team1Id,
      team2Id,
      selectedTeamId,
      playerId,
      metric,
      prediction
    } = body

    // Validate required fields
    if (!betType || !amount || !gameweek) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid bet amount' },
        { status: 400 }
      )
    }

    // Calculate potential win based on bet type
    let potentialWin = 0
    if (betType === 'team') {
      potentialWin = numAmount * 1.8 // 1.8x for team bets
    } else if (betType === 'player') {
      potentialWin = numAmount * 3 // 3x for exact player prediction
    } else {
      return NextResponse.json(
        { error: 'Invalid bet type' },
        { status: 400 }
      )
    }

    // Validate bet type specific fields
    if (betType === 'team') {
      if (!team1Id || !team2Id || !selectedTeamId) {
        return NextResponse.json(
          { error: 'Missing team information' },
          { status: 400 }
        )
      }
      if (team1Id === team2Id) {
        return NextResponse.json(
          { error: 'Cannot bet on the same team' },
          { status: 400 }
        )
      }
      if (selectedTeamId !== team1Id && selectedTeamId !== team2Id) {
        return NextResponse.json(
          { error: 'Selected team must be one of the two teams' },
          { status: 400 }
        )
      }
    } else { // player bet
      if (!playerId || !metric || prediction === undefined) {
        return NextResponse.json(
          { error: 'Missing player bet information' },
          { status: 400 }
        )
      }
      if (!['goals', 'assists', 'clean_sheets'].includes(metric)) {
        return NextResponse.json(
          { error: 'Invalid metric' },
          { status: 400 }
        )
      }
      if (prediction < 0 || prediction > 10) {
        return NextResponse.json(
          { error: 'Prediction must be between 0 and 10' },
          { status: 400 }
        )
      }
    }

    // Insert bet into database
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert({
        user_id: user.id,
        bet_type: betType,
        amount: numAmount,
        potential_win: potentialWin,
        gameweek,
        team1_id: betType === 'team' ? team1Id : null,
        team2_id: betType === 'team' ? team2Id : null,
        selected_team_id: betType === 'team' ? selectedTeamId : null,
        player_id: betType === 'player' ? playerId : null,
        metric: betType === 'player' ? metric : null,
        prediction: betType === 'player' ? prediction : null
      })
      .select()
      .single()

    if (betError) {
      console.error('Error placing bet:', betError)
      // Check if error is due to insufficient balance
      if (betError.message.includes('Insufficient balance')) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to place bet' },
        { status: 500 }
      )
    }

    return NextResponse.json(bet)

  } catch (error) {
    console.error('Error in place-bet route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 