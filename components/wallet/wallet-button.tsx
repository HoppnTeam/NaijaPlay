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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'

interface WalletButtonProps {
  variant?: "default" | "outline" | "secondary"
}

export function WalletButton({ variant = "default" }: WalletButtonProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
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
      setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={variant} className="flex gap-2">
          <Wallet className="h-4 w-4" />
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            formatNaira(balance || 0)
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Available Balance</div>
                  <div className="text-3xl font-bold">{formatNaira(balance || 0)}</div>
                </div>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => window.location.href = '/dashboard/tokens'}
                >
                  Manage Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
} 