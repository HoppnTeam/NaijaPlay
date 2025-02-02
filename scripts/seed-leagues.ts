import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

async function seedLeagues() {
  const sampleLeagues = [
    {
      name: 'NPFL Pro League 2024',
      type: 'NPFL',
      max_teams: 20,
      entry_fee: 5000,
      total_prize: 1000000,
      start_date: '2024-03-01',
      end_date: '2024-05-30',
      status: 'upcoming',
    },
    {
      name: 'NPFL Rising Stars',
      type: 'NPFL',
      max_teams: 30,
      entry_fee: 2000,
      total_prize: 500000,
      start_date: '2024-03-15',
      end_date: '2024-06-15',
      status: 'upcoming',
    },
    {
      name: 'EPL Masters League',
      type: 'EPL',
      max_teams: 16,
      entry_fee: 10000,
      total_prize: 2000000,
      start_date: '2024-03-01',
      end_date: '2024-05-30',
      status: 'upcoming',
    },
    {
      name: 'EPL Classic League',
      type: 'EPL',
      max_teams: 24,
      entry_fee: 5000,
      total_prize: 1000000,
      start_date: '2024-03-10',
      end_date: '2024-06-10',
      status: 'upcoming',
    },
  ]

  try {
    const { data, error } = await supabase
      .from('leagues')
      .insert(sampleLeagues)
      .select()

    if (error) {
      console.error('Error seeding leagues:', error)
      return
    }

    console.log('Successfully seeded leagues:', data)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the seeding
seedLeagues() 