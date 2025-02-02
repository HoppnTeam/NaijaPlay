import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SquadManagement } from '@/components/team/squad-management'

interface ManagePlayersPageProps {
  params: {
    id: string
  }
}

export default async function ManagePlayersPage({ params }: ManagePlayersPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch team data with players
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select(`
      *,
      team_players (
        player:players (
          id,
          name,
          position,
          team,
          current_price
        ),
        is_captain,
        is_vice_captain,
        is_for_sale,
        sale_price
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (teamError || !team) {
    console.error('Error fetching team:', teamError)
    redirect('/dashboard/team')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Squad</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Squad Management</CardTitle>
          <CardDescription>
            Manage your team's players, set captain and vice-captain, and handle transfers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SquadManagement 
            teamId={team.id} 
            budget={team.budget}
            players={team.team_players}
          />
        </CardContent>
      </Card>
    </div>
  )
} 