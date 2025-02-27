import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Database } from '@/lib/database.types'
import { Trophy, Home, Users, DollarSign, BarChart, Calendar, Shield, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Create navigation items
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home
    },
    {
      name: 'My Teams',
      href: '/dashboard/team',
      icon: Shield
    },
    {
      name: 'Leagues',
      href: '/dashboard/leagues',
      icon: Trophy
    },
    {
      name: 'Tokens',
      href: '/dashboard/tokens',
      icon: DollarSign
    },
    {
      name: 'Match Simulation',
      href: '/dashboard/match-simulation',
      icon: Trophy
    },
    {
      name: 'Gameweek',
      href: '/dashboard/gameweek',
      icon: Calendar
    },
    {
      name: 'Statistics',
      href: '/dashboard/stats',
      icon: BarChart
    }
  ]
  
  // Add admin dashboard link for admin users
  if (isAdmin) {
    navigation.push({
      name: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: Settings
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-gray-900">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-bold text-white">NaijaPlay</span>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-6 w-6',
                      'text-gray-400 group-hover:text-gray-300'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 pb-8">
          {children}
        </main>
      </div>
    </div>
  )
} 