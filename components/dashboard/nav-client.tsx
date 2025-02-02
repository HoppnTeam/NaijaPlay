'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import {
  Trophy,
  LineChart,
  Target,
  DollarSign,
  Menu,
  User,
  LogOut,
  Coins,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavClientProps {
  profile: {
    username: string | null
    full_name: string | null
  } | null
}

export function NavClient({ profile }: NavClientProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <nav className="bg-[#008753] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold">
                NaijaPlay
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
                <DollarSign className="w-4 h-4 mr-2" />
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
                <Coins className="w-4 h-4 mr-2" />
                Tokens
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#FFD700] text-[#008753]">
                      {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center sm:hidden">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
} 