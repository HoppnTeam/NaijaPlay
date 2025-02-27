import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import GameweekForm from '@/components/admin/gameweek-form'

export default async function AdminEditGameweekPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated and has admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }
  
  // Fetch gameweek details
  const { data: gameweek, error } = await supabase
    .from('gameweeks')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error || !gameweek) {
    redirect('/admin/gameweeks')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Gameweek {gameweek.number}</h1>
      <GameweekForm initialData={gameweek} />
    </div>
  )
} 