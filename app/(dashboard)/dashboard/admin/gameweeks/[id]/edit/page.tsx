import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { GameweekForm } from "@/components/admin/gameweek-form"

interface EditGameweekPageProps {
  params: {
    id: string
  }
}

export default async function EditGameweekPage({ params }: EditGameweekPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Check if gameweek exists
  const { data: gameweek, error } = await supabase
    .from('gameweeks')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !gameweek) {
    redirect('/dashboard/admin/gameweeks')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Gameweek {gameweek.number}</h2>
        <p className="text-muted-foreground">
          Update gameweek details and status.
        </p>
      </div>
      
      <GameweekForm gameweekId={params.id} />
    </div>
  )
} 