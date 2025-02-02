import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTeamForm } from '@/components/team/create-team-form'

export default async function CreateTeamPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user has reached the team limit
  const { data: teams } = await supabase
    .from('teams')
    .select('id')
    .eq('user_id', user.id)

  if (teams && teams.length >= 5) {
    redirect('/dashboard/team')
  }

  return (
    <div className="container max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Team</CardTitle>
          <CardDescription>
            Set up your team with a unique name and formation. You can change these settings later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTeamForm />
        </CardContent>
      </Card>
    </div>
  )
} 