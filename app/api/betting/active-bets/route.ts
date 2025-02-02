import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface TeamBet {
  id: string
  bet_type: 'team'
  amount: number
  potential_win: number
  status: string
  created_at: string
  gameweek: number
  team1_id: string
  team2_id: string
  selected_team_id: string
  team1_points: number | null
  team2_points: number | null
  teams: {
    name: string
  }[]
}

interface PlayerBet {
  id: string
  bet_type: 'player'
  amount: number
  potential_win: number
  status: string
  created_at: string
  gameweek: number
  player_id: string
  metric: string
  prediction: number
  actual_value: number | null
  players: {
    name: string
    team: string
    position: string
  }[]
}

export async function GET(request: Request) {
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

    // Fetch team bets with team names
    const { data: teamBets, error: teamBetsError } = await supabase
      .from('bets')
      .select(`
        id,
        bet_type,
        amount,
        potential_win,
        status,
        created_at,
        gameweek,
        team1_id,
        team2_id,
        selected_team_id,
        team1_points,
        team2_points,
        teams!team1_id (
          name
        ),
        teams!team2_id (
          name
        ),
        teams!selected_team_id (
          name
        )
      `)
      .eq('user_id', user.id)
      .eq('bet_type', 'team')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (teamBetsError) {
      console.error('Error fetching team bets:', teamBetsError)
      return NextResponse.json(
        { error: 'Failed to fetch team bets' },
        { status: 500 }
      )
    }

    // Fetch player bets with player details
    const { data: playerBets, error: playerBetsError } = await supabase
      .from('bets')
      .select(`
        id,
        bet_type,
        amount,
        potential_win,
        status,
        created_at,
        gameweek,
        player_id,
        metric,
        prediction,
        actual_value,
        players!player_id (
          name,
          team,
          position
        )
      `)
      .eq('user_id', user.id)
      .eq('bet_type', 'player')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (playerBetsError) {
      console.error('Error fetching player bets:', playerBetsError)
      return NextResponse.json(
        { error: 'Failed to fetch player bets' },
        { status: 500 }
      )
    }

    // Format the response
    const formattedTeamBets = (teamBets as TeamBet[]).map(bet => ({
      id: bet.id,
      type: 'team',
      amount: bet.amount,
      potentialWin: bet.potential_win,
      createdAt: bet.created_at,
      gameweek: bet.gameweek,
      details: {
        team1: {
          id: bet.team1_id,
          name: bet.teams[0]?.name,
          points: bet.team1_points
        },
        team2: {
          id: bet.team2_id,
          name: bet.teams[1]?.name,
          points: bet.team2_points
        },
        selectedTeam: {
          id: bet.selected_team_id,
          name: bet.teams[2]?.name
        }
      }
    }))

    const formattedPlayerBets = (playerBets as PlayerBet[]).map(bet => ({
      id: bet.id,
      type: 'player',
      amount: bet.amount,
      potentialWin: bet.potential_win,
      createdAt: bet.created_at,
      gameweek: bet.gameweek,
      details: {
        player: {
          id: bet.player_id,
          name: bet.players[0]?.name,
          team: bet.players[0]?.team,
          position: bet.players[0]?.position
        },
        metric: bet.metric,
        prediction: bet.prediction,
        actualValue: bet.actual_value
      }
    }))

    return NextResponse.json({
      teamBets: formattedTeamBets,
      playerBets: formattedPlayerBets
    })

  } catch (error) {
    console.error('Error in active-bets route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 