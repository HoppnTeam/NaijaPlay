import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { GameweekManager } from "@/components/admin/gameweek-manager"

export default async function GameweeksAdminPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gameweek Management</h2>
        <p className="text-muted-foreground">
          Create, edit, and manage gameweeks for your fantasy football leagues.
        </p>
      </div>
      
      <GameweekManager />
    </div>
  )
} 