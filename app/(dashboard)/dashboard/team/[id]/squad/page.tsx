import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SquadManagement } from '@/components/team/squad-management'

interface SquadPageProps {
  params: {
    id: string
  }
}

export default async function SquadPage({ params }: SquadPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch team data including players
  const { data: team } = await supabase
    .from('teams')
    .select('*, team_players(*, player:players(*))')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!team) redirect('/dashboard/team')

  // Transform the data for the SquadManagement component
  const players = team.team_players?.map((tp: any) => ({
    player: {
      id: tp.player.id,
      name: tp.player.name,
      position: tp.player.position,
      team: tp.player.team,
      current_price: tp.player.current_price
    },
    is_captain: tp.is_captain,
    is_vice_captain: tp.is_vice_captain,
    is_for_sale: tp.is_for_sale,
    sale_price: tp.sale_price
  })) || []

  return (
    <div className="space-y-6">
      <SquadManagement 
        teamId={team.id}
        budget={200000000}
        players={players}
      />
    </div>
  )
} 