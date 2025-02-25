import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

type Player = Database['public']['Tables']['players']['Row']
type TeamPlayer = Database['public']['Tables']['team_players']['Row'] & {
  players: Player
}

interface TransformedPlayer extends Omit<Player, 'id' | 'created_at' | 'updated_at'> {
  id: string
  purchase_price: number
  is_captain: boolean
  is_vice_captain: boolean
  is_for_sale: boolean
  sale_price?: number
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      )
    }

    // Verify user owns the team
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get team players with all their details
    const { data: teamPlayers, error } = await supabase
      .from('team_players')
      .select(`
        *,
        players!inner (*)
      `)
      .eq('team_id', teamId)

    if (error) {
      console.error('Error fetching team players:', error)
      return NextResponse.json(
        { error: 'Failed to fetch players' },
        { status: 500 }
      )
    }

    if (!teamPlayers) {
      return NextResponse.json({
        players: [],
        squadRequirements: {
          isComplete: false,
          missing: ['2 Goalkeepers', '5 Defenders', '5 Midfielders', '3 Forwards']
        }
      })
    }

    // Transform the data
    const players = (teamPlayers as TeamPlayer[]).map(tp => {
      const player = tp.players

      return {
        id: tp.player_id,
        name: player.name,
        position: player.position,
        team: player.team,
        league: player.league || 'NPFL',
        current_price: player.current_price,
        base_price: player.base_price || player.current_price,
        purchase_price: tp.purchase_price,
        is_captain: tp.is_captain || false,
        is_vice_captain: tp.is_vice_captain || false,
        is_for_sale: tp.is_for_sale || false,
        sale_price: tp.sale_price,
        minutes_played: player.minutes_played || 0,
        goals_scored: player.goals_scored || 0,
        assists: player.assists || 0,
        clean_sheets: player.clean_sheets || 0,
        goals_conceded: player.goals_conceded || 0,
        own_goals: player.own_goals || 0,
        penalties_saved: player.penalties_saved || 0,
        penalties_missed: player.penalties_missed || 0,
        yellow_cards: player.yellow_cards || 0,
        red_cards: player.red_cards || 0,
        saves: player.saves || 0,
        bonus: player.bonus || 0,
        form_rating: player.form_rating || 0,
        ownership_percent: player.ownership_percent || 0
      } satisfies TransformedPlayer
    })

    // Calculate squad requirements
    const positionCounts = players.reduce((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const requirements = {
      Goalkeeper: { required: 2, current: positionCounts['Goalkeeper'] || 0 },
      Defender: { required: 5, current: positionCounts['Defender'] || 0 },
      Midfielder: { required: 5, current: positionCounts['Midfielder'] || 0 },
      Forward: { required: 3, current: positionCounts['Forward'] || 0 }
    }

    const missingPlayers = Object.entries(requirements)
      .filter(([_, counts]) => counts.current < counts.required)
      .map(([position, counts]) => `${counts.required - counts.current} ${position}${counts.required - counts.current > 1 ? 's' : ''}`)

    return NextResponse.json({
      players,
      squadRequirements: {
        isComplete: missingPlayers.length === 0,
        missing: missingPlayers
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 