'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import {
  Trophy,
  LineChart,
  Target,
  Menu,
  User,
  LogOut,
  Wallet,
  BookOpen,
  Settings,
} from "lucide-react"
import NairaSign from '@/components/icons/NairaSign'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from 'react'

interface NavClientProps {
  profile: {
    id?: string
    username?: string | null
    full_name?: string | null
    role?: string | null
    email?: string | null
  } | null
}

export function NavClient({ profile }: NavClientProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user has admin role
    const adminCheck = profile?.role === 'admin'
    setIsAdmin(adminCheck)
  }, [profile])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  // Get the first letter of the user's name for the avatar
  const getAvatarInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0)
    if (profile?.username) return profile.username.charAt(0)
    if (profile?.email) return profile.email.charAt(0)
    return 'U'
  }

  return (
    <nav className="bg-[#008753] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl sm:text-2xl font-bold py-2">
                NaijaPlay
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6 md:space-x-8">
              <Link 
                href="/dashboard" 
                className="border-[#FFD700] text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link 
                href="/dashboard/leagues" 
                className="border-transparent text-white/90 hover:text-white hover:border-[#FFD700] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                <Target className="w-4 h-4 mr-2" />
                Leagues
              </Link>
              <Link 
                href="/dashboard/betting" 
                className="border-transparent text-white/90 hover:text-white hover:border-[#FFD700] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                <NairaSign className="w-4 h-4 mr-2" />
                Betting
              </Link>
              <Link 
                href="/dashboard/stats" 
                className="border-transparent text-white/90 hover:text-white hover:border-[#FFD700] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                <LineChart className="w-4 h-4 mr-2" />
                Stats
              </Link>
              <Link 
                href="/dashboard/tokens" 
                className="border-transparent text-white/90 hover:text-white hover:border-[#FFD700] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Tokens
              </Link>
              <Link 
                href="/dashboard/user-guide" 
                className="border-transparent text-white/90 hover:text-white hover:border-[#FFD700] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                User Guide
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#FFD700] text-[#008753]">
                      {getAvatarInitial()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer py-2">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                {/* Admin link based on state */}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="cursor-pointer py-2">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-2">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-2 -mr-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer py-3">
                    <Trophy className="mr-2 h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/leagues" className="cursor-pointer py-3">
                    <Target className="mr-2 h-5 w-5" />
                    <span>Leagues</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/betting" className="cursor-pointer py-3">
                    <NairaSign className="mr-2 h-5 w-5" />
                    <span>Betting</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/stats" className="cursor-pointer py-3">
                    <LineChart className="mr-2 h-5 w-5" />
                    <span>Stats</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/tokens" className="cursor-pointer py-3">
                    <Wallet className="mr-2 h-5 w-5" />
                    <span>Tokens</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/user-guide" className="cursor-pointer py-3">
                    <BookOpen className="mr-2 h-5 w-5" />
                    <span>User Guide</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer py-3">
                    <User className="mr-2 h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                {/* Admin link for mobile */}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="cursor-pointer py-3">
                      <Settings className="mr-2 h-5 w-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-3">
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
} 