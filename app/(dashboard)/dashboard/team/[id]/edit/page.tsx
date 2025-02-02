import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditTeamForm } from '@/components/team/edit-team-form'

interface EditTeamPageProps {
  params: {
    id: string
  }
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch team data
  const { data: team, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_players (
        count
      ),
      league_members (
        leagues (
          name
        )
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !team) {
    console.error('Error fetching team:', error)
    redirect('/dashboard/team')
  }

  return (
    <div className="container max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Team</CardTitle>
          <CardDescription>
            Update your team settings and formation. Some settings may be locked if you're part of an active league.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditTeamForm team={team} />
        </CardContent>
      </Card>
    </div>
  )
} 