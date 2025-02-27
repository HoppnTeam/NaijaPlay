'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Wallet, TrendingUp, History } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Database } from '@/types/supabase'

interface WalletCardProps {
  variant?: 'default' | 'compact'
}

interface Transaction {
  id: string
  type: string
  amount: number
  created_at: string
  status: 'completed' | 'pending' | 'failed'
  description?: string
  metadata?: any
}

export function WalletCard({ variant = 'default' }: WalletCardProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTransactions, setShowTransactions] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  const supabase = createClientComponentClient()
  const { toast } = useToast()

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
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setBalance(data?.balance || 0)
    } catch (error) {
      console.error('Error fetching balance:', error)
      toast({
        title: "Error",
        description: "Failed to fetch balance",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to make a deposit",
          variant: "destructive"
        })
        return
      }

      // Convert amount to kobo for Paystack
      const amountInKobo = amount * 100

      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInKobo,
          email: user.email
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize deposit')
      }

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url
    } catch (error) {
      console.error('Error initiating deposit:', error)
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Failed to process deposit",
        variant: "destructive",
      })
    }
  }

  const handleWithdrawal = async (amount: number) => {
    // Implement withdrawal logic here
    toast({
      title: "Coming Soon",
      description: "Withdrawal functionality will be available soon!",
    })
  }

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  useEffect(() => {
    fetchBalance()
    fetchTransactions()
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'debit':
      case 'transfer_out':
        return <History className="h-4 w-4 text-orange-500" />
      case 'credit':
      case 'transfer_in':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      default:
        return <History className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <span className="font-medium">Balance:</span>
              <span className="font-bold">{formatNaira(balance || 0)}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="default" 
                onClick={() => setIsDepositModalOpen(true)}
              >
                Deposit
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleWithdrawal(0)}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Betting Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Available Balance</div>
              <div className="text-3xl font-bold">{formatNaira(balance || 0)}</div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => setIsDepositModalOpen(true)}
              >
                Deposit
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleWithdrawal(0)}
              >
                Withdraw
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowTransactions(true)}
              >
                History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showTransactions} onOpenChange={setShowTransactions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="font-medium">
                          {transaction.description || (
                            transaction.type === 'credit' ? 'Deposit' :
                            transaction.type === 'debit' ? 'Withdrawal' :
                            transaction.type === 'transfer_in' ? 'Transfer In' :
                            transaction.type === 'transfer_out' ? 'Transfer Out' : 
                            'Transaction'
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {transaction.amount > 0 ? '+' : ''}{formatNaira(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Amount</Label>
              <div className="grid grid-cols-2 gap-2">
                {[1000, 2000, 5000, 10000].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => {
                      setIsDepositModalOpen(false)
                      handleDeposit(amount)
                    }}
                  >
                    {formatNaira(amount)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 