'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Wallet } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { WalletCard } from './wallet-card'

export function WalletButton() {
  const [balance, setBalance] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setBalance(data?.balance || 0)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <Wallet className="h-4 w-4" />
          {formatNaira(balance || 0)}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="mt-6">
          <WalletCard />
        </div>
      </SheetContent>
    </Sheet>
  )
} 