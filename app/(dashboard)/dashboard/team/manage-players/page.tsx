import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { TransferMarket } from '@/components/transfer-market'

export default async function ManagePlayers() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('id, budget')
    .eq('user_id', user?.id)
    .single()

  if (teamError || !teamData) {
    return <div>Error loading team data</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Players</h1>
      <TransferMarket 
        teamId={teamData.id} 
        budget={teamData.budget} 
      />
    </div>
  )
}

