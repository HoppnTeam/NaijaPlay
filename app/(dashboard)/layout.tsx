import { headers, cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { NavClient } from '@/components/dashboard/nav-client'
import Link from 'next/link'
import type { Database } from '@/lib/database.types'
import { Trophy, Home, Users, DollarSign, BarChart, Calendar, Shield, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Get authenticated user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('Error fetching user:', userError.message)
      redirect('/login')
    }

    if (!user) {
      redirect('/login')
    }

    // Get user profile with explicit fields
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, email, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError.message)
      // Continue without profile data, but log the error
    }

    // Check if user has admin role
    const isAdmin = profile?.role === 'admin'

    // Create navigation items based on user role
    const navigationItems = [
      {
        name: 'Home',
        href: '/',
        icon: Home
      },
      {
        name: 'Games',
        href: '/games',
        icon: Trophy
      },
      {
        name: 'Leaderboard',
        href: '/leaderboard',
        icon: BarChart
      },
      {
        name: 'Transactions',
        href: '/transactions',
        icon: DollarSign
      },
      {
        name: 'Calendar',
        href: '/calendar',
        icon: Calendar
      },
      {
        name: 'Security',
        href: '/security',
        icon: Shield
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings
      }
    ]
    
    // Add admin dashboard link for admin users
    if (isAdmin) {
      navigationItems.push({
        name: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: Settings
      })
    }

    return (
      <div className="min-h-screen bg-background">
        <NavClient profile={profile} />
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </main>
        <footer className="bg-naijaplay-green/5 border-t border-naijaplay-green/10 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-naijaplay-green font-semibold mb-4 md:mb-0">
                NaijaPlay © {new Date().getFullYear()}
              </div>
              <div className="flex space-x-6">
                <Link href="/terms" className="text-gray-600 hover:text-naijaplay-green">
                  Terms
                </Link>
                <Link href="/privacy" className="text-gray-600 hover:text-naijaplay-green">
                  Privacy
                </Link>
                <Link href="/contact" className="text-gray-600 hover:text-naijaplay-green">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  } catch (error) {
    console.error('Unexpected error in dashboard layout:', error)
    redirect('/login?error=unexpected')
  }
}

