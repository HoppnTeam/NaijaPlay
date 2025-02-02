import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SquadManagement } from '@/components/team/squad-management'

interface TeamPageProps {
  params: {
    id: string
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch team data including players
  const { data: team } = await supabase
    .from('teams')
    .select(`
      *,
      team_players(
        *,
        player:players(*)
      )
    `)
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <Link href={`/dashboard/team/${team.id}/edit`}>
          <Button variant="outline">Edit Team</Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="squad">Squad</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Add overview content */}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="squad">
          <Card className="p-6">
            <SquadManagement 
              teamId={team.id}
              budget={team.budget}
              players={players}
            />
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card className="p-6">
            {/* Add transfers content */}
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            {/* Add statistics content */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 