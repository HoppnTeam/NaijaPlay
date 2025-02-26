import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'

interface PrizePoolFundingProps {
  leagueId: string
  userId: string
  onUpdate?: () => void
}

export function PrizePoolFunding({ leagueId, userId, onUpdate }: PrizePoolFundingProps) {
  const [leagueData, setLeagueData] = useState<any>(null)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [additionalAmount, setAdditionalAmount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFunding, setIsFunding] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('wallet')
  
  const { toast } = useToast()
  const router = useRouter()
  
  useEffect(() => {
    fetchLeagueData()
    fetchWalletBalance()
  }, [leagueId, userId])
  
  const fetchLeagueData = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*, teams(*)')
        .eq('id', leagueId)
        .single()
      
      if (error) throw error
      
      setLeagueData(data)
    } catch (error) {
      console.error('Error fetching league data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load league data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchWalletBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      
      if (data) {
        setWalletBalance(data.balance || 0)
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      toast({
        title: 'Error',
        description: 'Failed to load wallet balance',
        variant: 'destructive'
      })
    }
  }
  
  const handleFundFromWallet = async () => {
    if (additionalAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to fund',
        variant: 'destructive'
      })
      return
    }
    
    if (additionalAmount > walletBalance) {
      toast({
        title: 'Insufficient Balance',
        description: 'Your wallet balance is insufficient for this transaction',
        variant: 'destructive'
      })
      return
    }
    
    setIsFunding(true)
    
    try {
      // Start a transaction to update both wallet and league
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('User not authenticated')
      
      // 1. Deduct from wallet
      const { error: walletError } = await supabase.rpc('deduct_from_wallet', {
        p_user_id: userId,
        p_amount: additionalAmount
      })
      
      if (walletError) throw walletError
      
      // 2. Update league prize pool
      const currentAdditional = leagueData.additional_prize_amount || 0
      const newAdditionalAmount = currentAdditional + additionalAmount
      
      const { error: leagueError } = await supabase
        .from('leagues')
        .update({
          additional_prize_amount: newAdditionalAmount,
          prize_pool_funded: true
        })
        .eq('id', leagueId)
      
      if (leagueError) throw leagueError
      
      // 3. Record the transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: additionalAmount,
          type: 'league_funding',
          status: 'completed',
          description: `Prize pool funding for league: ${leagueData.name}`,
          metadata: { league_id: leagueId }
        })
      
      if (transactionError) throw transactionError
      
      // Success
      toast({
        title: 'Success',
        description: `Successfully funded prize pool with ₦${additionalAmount.toLocaleString()}`
      })
      
      // Reset form and refresh data
      setAdditionalAmount(0)
      fetchLeagueData()
      fetchWalletBalance()
      
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error funding prize pool:', error)
      toast({
        title: 'Error',
        description: 'Failed to fund prize pool. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsFunding(false)
    }
  }
  
  const handlePaystackFunding = async () => {
    if (additionalAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to fund',
        variant: 'destructive'
      })
      return
    }
    
    setIsFunding(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('User not authenticated')
      
      // Get user email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()
      
      if (userError) throw userError
      
      // Initialize Paystack transaction
      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: additionalAmount,
          email: userData.email,
          metadata: {
            type: 'league_funding',
            league_id: leagueId
          }
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to initialize payment')
      }
      
      // Redirect to Paystack checkout
      router.push(result.data.authorization_url)
    } catch (error) {
      console.error('Error initializing payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive'
      })
      setIsFunding(false)
    }
  }
  
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  if (isLoading || !leagueData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prize Pool Funding</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  // Calculate prize pool details
  const entryFee = leagueData.entry_fee || 0
  const maxTeams = leagueData.max_teams || 0
  const currentTeams = leagueData.teams?.length || 0
  const basePrize = leagueData.total_prize || 0
  const additionalPrize = leagueData.additional_prize_amount || 0
  const totalPrizePool = basePrize + additionalPrize
  const potentialEntryFees = entryFee * maxTeams
  const currentEntryFees = entryFee * currentTeams
  const platformFee = currentEntryFees * 0.1 // 10% platform fee
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prize Pool Funding</CardTitle>
        <CardDescription>Add funds to increase the prize pool for your league</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">League Prize Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Entry Fee</p>
                <p className="text-lg font-bold">{formatNaira(entryFee)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Teams</p>
                <p className="text-lg font-bold">{currentTeams} / {maxTeams}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Current Entry Fees</p>
                <p className="text-lg font-bold">{formatNaira(currentEntryFees)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Platform Fee (10%)</p>
                <p className="text-lg font-bold">{formatNaira(platformFee)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Base Prize Pool</p>
                <p className="text-lg font-bold">{formatNaira(basePrize)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Additional Funding</p>
                <p className="text-lg font-bold">{formatNaira(additionalPrize)}</p>
              </div>
              <div className="space-y-1 col-span-2 pt-2 border-t">
                <p className="text-sm font-medium">Total Prize Pool</p>
                <p className="text-xl font-bold">{formatNaira(totalPrizePool)}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wallet">Fund from Wallet</TabsTrigger>
                <TabsTrigger value="paystack">Fund with Paystack</TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet">
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="walletBalance">Your Wallet Balance</Label>
                    <span className="text-lg font-bold">{formatNaira(walletBalance)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="additionalAmount">Amount to Add</Label>
                    <Input
                      id="additionalAmount"
                      type="number"
                      value={additionalAmount}
                      onChange={(e) => setAdditionalAmount(Number(e.target.value))}
                      min={0}
                      max={walletBalance}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the amount you want to add to the prize pool from your wallet
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleFundFromWallet} 
                    disabled={isFunding || additionalAmount <= 0 || additionalAmount > walletBalance}
                    className="w-full"
                  >
                    {isFunding ? 'Processing...' : 'Fund Prize Pool'}
                  </Button>
                  
                  {walletBalance < 1000 && (
                    <p className="text-sm text-yellow-500 mt-2">
                      Your wallet balance is low. Consider topping up your wallet or use direct payment.
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="paystack">
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="paystackAmount">Amount to Add</Label>
                    <Input
                      id="paystackAmount"
                      type="number"
                      value={additionalAmount}
                      onChange={(e) => setAdditionalAmount(Number(e.target.value))}
                      min={100}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the amount you want to add to the prize pool (minimum ₦100)
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handlePaystackFunding} 
                    disabled={isFunding || additionalAmount < 100}
                    className="w-full"
                  >
                    {isFunding ? 'Processing...' : 'Pay with Paystack'}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    You will be redirected to Paystack to complete your payment securely.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Funds added to the prize pool cannot be withdrawn.
        </p>
      </CardFooter>
    </Card>
  )
} 