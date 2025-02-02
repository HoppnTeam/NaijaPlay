import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MatchSchedule } from '@/components/match/match-schedule'
import { MatchHistory } from '@/components/match/match-history'

export default async function MatchPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's team
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!team) redirect('/dashboard/team/create')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Match Center</h1>
      
      {/* Upcoming Fixtures Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Fixtures</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchSchedule teamId={team.id} />
        </CardContent>
      </Card>

      {/* Recent Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchHistory teamId={team.id} />
        </CardContent>
      </Card>
    </div>
  )
} 