'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Wallet, TrendingUp, History, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { WalletCardSkeleton } from './wallet-card-skeleton'
import { useRouter } from "next/navigation"
import Link from "next/link"

interface WalletCardProps {
  variant?: 'default' | 'compact'
  className?: string
}

interface Transaction {
  id: string
  amount: number
  created_at: string
  type: string
  status: string
  description?: string
}

export function WalletCard({ variant = 'default', className }: WalletCardProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTransactions, setShowTransactions] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [amount, setAmount] = useState<number | "">("")

  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleDeposit = async () => {
    if (!amount || amount < 500) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit amount is ₦500",
        variant: "destructive"
      })
      return
    }
    
    if (amount > 500000) {
      toast({
        title: "Amount Exceeds Limit",
        description: "Maximum deposit amount is ₦500,000",
        variant: "destructive"
      })
      return
    }
    
    setIsProcessing(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue",
          variant: "destructive"
        })
        return
      }

      const response = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate deposit")
      }
      
      // Close modal
      setIsDepositModalOpen(false)
      
      // Reset form
      setAmount("")
      setCustomAmount("")
      
      // Redirect to payment page
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        router.push("/dashboard/wallet/topup/processing")
      }
    } catch (error) {
      console.error("Deposit error:", error)
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomAmount(value)
    setAmount(value === "" ? "" : parseInt(value, 10))
  }

  const handleAmountSelect = (value: number) => {
    setAmount(value)
    setCustomAmount(value.toString())
  }

  const handleDepositClick = () => {
    if (selectedAmount) {
      handleDeposit()
    } else if (customAmount) {
      handleDeposit()
    } else {
      toast({
        title: "No Amount Selected",
        description: "Please select or enter an amount to deposit",
        variant: "destructive"
      })
    }
  }

  const handleWithdrawal = (amount: number) => {
    // Implement withdrawal logic
    router.push("/dashboard/wallet/withdraw")
  }
  
  // Helper function to get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'debit':
      case 'transfer_out':
        return <ArrowUpFromLine className="h-4 w-4 text-red-500" />
      case 'credit':
      case 'transfer_in':
        return <ArrowDownToLine className="h-4 w-4 text-green-500" />
      default:
        return <History className="h-4 w-4 text-gray-500" />
    }
  }

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Fetch wallet balance
          const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single()
          
          if (walletError) {
            throw walletError
          }
          
          if (wallet) {
            setBalance(wallet.balance)
          }
          
          // Fetch recent transactions
          const { data: recentTransactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)
          
          if (transactionsError) {
            throw transactionsError
          }
          
          if (recentTransactions) {
            setTransactions(recentTransactions)
          }
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error)
        toast({
          title: "Failed to load wallet data",
          description: "Please refresh the page to try again",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchWalletData()
  }, [supabase, toast])

  if (loading) {
    return <WalletCardSkeleton variant={variant} />
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Balance</div>
              <div className="text-2xl font-bold">{formatNaira(balance || 0)}</div>
            </div>
            <Button size="sm" onClick={() => setIsDepositModalOpen(true)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Deposit
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Your Wallet
          </CardTitle>
          <CardDescription>
            Manage your betting funds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center p-4 sm:p-6 border rounded-lg bg-muted/50">
            <div className="text-sm font-medium text-muted-foreground mb-1">Available Balance</div>
            <div className="text-3xl sm:text-4xl font-bold">{formatNaira(balance || 0)}</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Button 
              className="w-full py-3 sm:py-4" 
              size="lg"
              onClick={() => router.push("/dashboard/wallet/deposit")}
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Deposit
            </Button>
            
            <Button 
              className="w-full py-3 sm:py-4" 
              variant="outline" 
              size="lg"
              onClick={() => router.push("/dashboard/wallet/withdraw")}
            >
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground">
            Need help? <Link href="/dashboard/wallet/guide" className="underline">View wallet guide</Link>
          </div>
        </CardFooter>
      </Card>

      {/* Deposit Modal */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Add funds to your wallet using our secure payment gateway.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <div className="grid grid-cols-3 gap-2">
                {[1000, 2000, 5000].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={selectedAmount === value ? "default" : "outline"}
                    onClick={() => {
                      setSelectedAmount(value)
                      setAmount(value)
                      setCustomAmount('')
                    }}
                    className="h-12 text-base"
                  >
                    ₦{value.toLocaleString()}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[10000, 20000, 50000].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={selectedAmount === value ? "default" : "outline"}
                    onClick={() => {
                      setSelectedAmount(value)
                      setAmount(value)
                      setCustomAmount('')
                    }}
                    className="h-12 text-base"
                  >
                    ₦{value.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-amount">Custom Amount</Label>
              <Input
                id="custom-amount"
                type="text"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  setCustomAmount(value)
                  setSelectedAmount(null)
                  setAmount(value ? parseInt(value) : "")
                }}
                className="h-12 text-base"
              />
              <p className="text-xs text-muted-foreground">
                Min: ₦500 | Max: ₦500,000
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDepositModalOpen(false)}
              className="h-11 sm:h-10"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleDeposit}
              disabled={isProcessing || !amount}
              className="h-11 sm:h-10"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal */}
      <Dialog open={showTransactions} onOpenChange={setShowTransactions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recent Transactions</DialogTitle>
            <DialogDescription>
              Your recent wallet activity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 sm:p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium">{transaction.description || transaction.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatNaira(transaction.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No transactions yet
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowTransactions(false)}
              className="w-full sm:w-auto h-11 sm:h-10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 