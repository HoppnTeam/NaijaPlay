import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, ChartBar, Settings } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function TeamPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch user's teams
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('user_id', user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Teams</h1>
        <Link href="/dashboard/team/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams?.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
              <CardDescription>
                Formation: {team.formation}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Link href={`/dashboard/team/${team.id}/squad`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Squad
                  </Button>
                </Link>
                <Link href={`/dashboard/team/${team.id}/stats`}>
                  <Button variant="outline" className="w-full justify-start">
                    <ChartBar className="mr-2 h-4 w-4" />
                    View Stats
                  </Button>
                </Link>
                <Link href={`/dashboard/team/${team.id}/edit`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Team Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {!teams?.length && (
          <Card>
            <CardHeader>
              <CardTitle>No Teams Yet</CardTitle>
              <CardDescription>
                Create your first team to start playing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/team/create">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 