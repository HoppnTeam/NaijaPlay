import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  try {
    const [teamData, leagueData, allPlayers] = await Promise.all([
      supabase
        .from('teams')
        .select('*, team_players(player:players(*))')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(res => res.data),
      supabase
        .from('leagues')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(res => res.data),
      supabase
        .from('players')
        .select('*')
        .limit(10)
        .then(res => res.data || [])
    ])

    return (
      <DashboardContent 
        teamData={teamData} 
        leagueData={leagueData} 
        allPlayers={allPlayers} 
      />
    )
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return <div>Error loading dashboard</div>
  }
}

