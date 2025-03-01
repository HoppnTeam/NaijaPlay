import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'

import { SystemStats } from '@/components/admin/system-stats'
import { SystemHealth } from '@/components/admin/system-health'
import { RecentRegistrations } from '@/components/admin/recent-registrations'
import { SystemNotifications } from '@/components/admin/system-notifications'
import { AdminActivityTracker } from '@/components/admin/activity-tracker'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getInitialData() {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated and is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch initial data for stats
  const { data: statsData } = await supabase.rpc('get_system_stats')

  // Fetch recent registrations
  const { data: registrationsData } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch system notifications
  const { data: notificationsData } = await supabase
    .from('system_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch user activities
  const { data: activitiesData } = await supabase
    .from('user_activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    stats: statsData || null,
    registrations: registrationsData || [],
    notifications: notificationsData || [],
    activities: activitiesData || []
  }
}

export default async function AdminDashboard() {
  const initialData = await getInitialData()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SystemStats initialData={initialData.stats} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SystemHealth className="col-span-4" />
        <SystemNotifications 
          initialData={initialData.notifications}
          className="col-span-3"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <RecentRegistrations initialData={initialData.registrations} />
        <AdminActivityTracker initialData={initialData.activities} />
      </div>
    </div>
  )
}

