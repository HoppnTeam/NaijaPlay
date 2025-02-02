'use client'

import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <Button 
      onClick={handleSignOut}
      variant="outline" 
      className="border-[#FFD700] text-white hover:bg-[#FFD700] hover:text-[#008753] transition-colors"
    >
      Sign out
    </Button>
  )
} 