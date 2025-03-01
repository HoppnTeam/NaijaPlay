import { Metadata } from 'next'
import { MatchDataUpdater } from '@/components/match/match-data-updater'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin - Match Data Update',
  description: 'Update player statistics and fantasy points based on real match data',
}

export default async function AdminMatchDataPage() {
  // Check if user is admin
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (error || !profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Match Data Update</h1>
      </div>
      <p className="text-muted-foreground">
        Update player statistics and fantasy points based on real match data.
      </p>
      
      <div className="grid gap-8">
        <MatchDataUpdater />
      </div>
    </div>
  )
} 