import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface DatabasePlayer {
  id: string
  name: string
  position: string
  team: string
  league: string
  current_price: number
  base_price: number
  minutes_played: number
  goals_scored: number
  assists: number
  clean_sheets: number
  goals_conceded: number
  own_goals: number
  penalties_saved: number
  penalties_missed: number
  yellow_cards: number
  red_cards: number
  saves: number
  bonus: number
  form_rating: number
  ownership_percent: number
}

interface DatabaseTeamPlayer {
  team_id: string
  player_id: string
  purchase_price: number
  is_captain: boolean
  is_vice_captain: boolean
  is_for_sale: boolean
  sale_price?: number
  player: DatabasePlayer
}

interface PlayerResponse {
  id: string
  name: string
  position: string
  team: string
  league: string
  current_price: number
  base_price: number
  minutes_played: number
  goals_scored: number
  assists: number
  clean_sheets: number
  goals_conceded: number
  own_goals: number
  penalties_saved: number
  penalties_missed: number
  yellow_cards: number
  red_cards: number
  saves: number
  bonus: number
  form_rating: number
  ownership_percent: number
}

interface TeamPlayerResponse {
  team_id: string
  player_id: string
  purchase_price: number
  is_captain: boolean
  is_vice_captain: boolean
  is_for_sale: boolean
  sale_price?: number
  player: PlayerResponse
}

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const teamId = params.teamId

    // Verify user owns the team
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get team details including budget
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('budget')
      .eq('id', teamId)
      .single()

    if (teamError) {
      console.error('Error fetching team:', teamError)
      return NextResponse.json(
        { error: 'Failed to fetch team details' },
        { status: 500 }
      )
    }

    // Get team players with their details
    const { data: teamPlayers, error: playersError } = await supabase
      .from('team_players')
      .select(`
        team_id,
        player_id,
        purchase_price,
        is_captain,
        is_vice_captain,
        is_for_sale,
        sale_price,
        players (
          id,
          name,
          position,
          team,
          league,
          current_price,
          base_price,
          minutes_played,
          goals_scored,
          assists,
          clean_sheets,
          goals_conceded,
          own_goals,
          penalties_saved,
          penalties_missed,
          yellow_cards,
          red_cards,
          saves,
          bonus,
          form_rating,
          ownership_percent
        )
      `)
      .eq('team_id', teamId)

    if (playersError) {
      console.error('Error fetching players:', playersError)
      return NextResponse.json(
        { error: 'Failed to fetch team players' },
        { status: 500 }
      )
    }

    // Log the raw response for debugging
    console.log('Raw team players response:', JSON.stringify(teamPlayers, null, 2))
    console.log('Team ID being queried:', teamId)
    console.log('Number of players found:', teamPlayers?.length || 0)
    console.log('Team budget:', team.budget)
    
    if (teamPlayers?.length === 0) {
      console.log('No players found for team. Verifying team exists...')
      const { data: teamExists, error: teamExistsError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', teamId)
        .single()
      
      if (teamExistsError) {
        console.log('Error verifying team:', teamExistsError)
      } else {
        console.log('Team exists:', teamExists)
      }
    }

    // Transform the data to ensure all fields are present and handle potential null values
    const transformedPlayers = (teamPlayers || []).map((tp: any) => {
      const playerData = tp.players || {}
      return {
        team_id: tp.team_id,
        player_id: tp.player_id,
        purchase_price: tp.purchase_price || 0,
        is_captain: tp.is_captain || false,
        is_vice_captain: tp.is_vice_captain || false,
        is_for_sale: tp.is_for_sale || false,
        sale_price: tp.sale_price,
        player: {
          id: playerData.id,
          name: playerData.name || '',
          position: playerData.position || '',
          team: playerData.team || '',
          league: playerData.league || '',
          current_price: playerData.current_price || playerData.base_price || 0,
          base_price: playerData.base_price || playerData.current_price || 0,
          minutes_played: playerData.minutes_played || 0,
          goals_scored: playerData.goals_scored || 0,
          assists: playerData.assists || 0,
          clean_sheets: playerData.clean_sheets || 0,
          goals_conceded: playerData.goals_conceded || 0,
          own_goals: playerData.own_goals || 0,
          penalties_saved: playerData.penalties_saved || 0,
          penalties_missed: playerData.penalties_missed || 0,
          yellow_cards: playerData.yellow_cards || 0,
          red_cards: playerData.red_cards || 0,
          saves: playerData.saves || 0,
          bonus: playerData.bonus || 0,
          form_rating: playerData.form_rating || 0,
          ownership_percent: playerData.ownership_percent || 0
        }
      }
    })

    // Log the transformed data for debugging
    console.log('Transformed players:', transformedPlayers)

    return NextResponse.json({ 
      players: transformedPlayers,
      budget: team.budget 
    })
  } catch (error) {
    console.error('Error in team players endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 