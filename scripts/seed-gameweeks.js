import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedGameweeks() {
  try {
    // Create first gameweek (upcoming)
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 7)

    const { data: gameweek1, error: gameweek1Error } = await supabase
      .from('gameweeks')
      .insert({
        number: 1,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'upcoming'
      })
      .select()
      .single()

    if (gameweek1Error) throw gameweek1Error

    // Create second gameweek (in_progress)
    const gw2StartDate = new Date(startDate)
    gw2StartDate.setDate(gw2StartDate.getDate() - 7)
    const gw2EndDate = new Date(gw2StartDate)
    gw2EndDate.setDate(gw2EndDate.getDate() + 7)

    const { data: gameweek2, error: gameweek2Error } = await supabase
      .from('gameweeks')
      .insert({
        number: 2,
        start_date: gw2StartDate.toISOString(),
        end_date: gw2EndDate.toISOString(),
        status: 'in_progress'
      })
      .select()
      .single()

    if (gameweek2Error) throw gameweek2Error

    // Fetch some teams to create matches
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .limit(6)

    if (teamsError) throw teamsError
    if (!teams || teams.length < 2) {
      console.log('Not enough teams to create matches')
      return
    }

    // Create matches for gameweek 1 (upcoming)
    const gw1Matches = []
    for (let i = 0; i < teams.length - 1; i += 2) {
      const matchDate = new Date(startDate)
      matchDate.setHours(matchDate.getHours() + i)

      gw1Matches.push({
        gameweek_id: gameweek1.id,
        home_team_id: teams[i].id,
        away_team_id: teams[i + 1].id,
        match_date: matchDate.toISOString(),
        status: 'scheduled'
      })
    }

    // Create matches for gameweek 2 (in_progress)
    const gw2Matches = []
    for (let i = 0; i < teams.length - 1; i += 2) {
      const matchDate = new Date(gw2StartDate)
      matchDate.setHours(matchDate.getHours() + i)

      gw2Matches.push({
        gameweek_id: gameweek2.id,
        home_team_id: teams[i + 1].id,
        away_team_id: teams[i].id,
        match_date: matchDate.toISOString(),
        status: 'in_progress',
        home_score: Math.floor(Math.random() * 4),
        away_score: Math.floor(Math.random() * 4)
      })
    }

    // Insert matches
    const { error: matchesError } = await supabase
      .from('match_history')
      .insert([...gw1Matches, ...gw2Matches])

    if (matchesError) throw matchesError

    // Create team gameweek stats for each team
    const teamStats = teams.map(team => ({
      team_id: team.id,
      gameweek_id: gameweek2.id,
      total_points: Math.floor(Math.random() * 100),
      points_on_bench: Math.floor(Math.random() * 20),
      transfers_made: Math.floor(Math.random() * 3),
      transfers_cost: Math.floor(Math.random() * 8) * 4,
      captain_points: Math.floor(Math.random() * 24),
      vice_captain_points: Math.floor(Math.random() * 12)
    }))

    const { error: statsError } = await supabase
      .from('team_gameweek_stats')
      .insert(teamStats)

    if (statsError) throw statsError

    console.log('Successfully seeded gameweeks and matches!')
  } catch (error) {
    console.error('Error seeding gameweeks:', error)
  }
}

// Run the seeding
seedGameweeks() 