import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { GameweekForm } from "@/components/admin/gameweek-form"

export default async function NewGameweekPage() {
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
        <h2 className="text-3xl font-bold tracking-tight">Create New Gameweek</h2>
        <p className="text-muted-foreground">
          Add a new gameweek to your fantasy football season.
        </p>
      </div>
      
      <GameweekForm />
    </div>
  )
} 