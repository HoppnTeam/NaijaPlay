'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, BarChart, Settings, LogOut, Trophy, RefreshCw, Calendar, ShieldAlert, Layers } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Define the menu items with icon components instead of JSX elements
const menuItems = [
  {
    icon: BarChart,
    label: 'Admin Dashboard',
    href: '/admin/dashboard',
  },
  {
    icon: Users,
    label: 'User Management',
    href: '/admin/users',
  },
  {
    icon: Calendar,
    label: 'Gameweek Management',
    href: '/admin/gameweeks',
  },
  {
    icon: RefreshCw,
    label: 'Match Data Update',
    href: '/admin/match-data',
  },
  {
    icon: Layers,
    label: 'League Management',
    href: '/admin/leagues',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/admin/settings',
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border bg-naijaplay-green/5">
        <SidebarHeader className="text-naijaplay-green">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link 
                    href={item.href} 
                    className={`flex items-center ${pathname === item.href ? 'text-naijaplay-green font-medium' : 'hover:text-naijaplay-green'}`}
                  >
                    {/* Use the Icon component properly */}
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start hover:text-naijaplay-orange">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

