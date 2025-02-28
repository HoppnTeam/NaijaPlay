import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { WalletCard } from '@/components/wallet/wallet-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, HelpCircle, History, Wallet } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
  id: string
  type: string
  amount: number
  created_at: string
  status: 'completed' | 'pending' | 'failed'
  description?: string
  metadata?: any
}

export default async function WalletPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  
  // Fetch user's wallet
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .single()
  
  // Fetch recent transactions
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)
  
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</span>
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span>
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">{status}</span>
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your betting wallet, deposit funds, and view transaction history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/wallet/guide">
              <BookOpen className="mr-2 h-4 w-4" />
              User Guide
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/user-guide#wallet">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <WalletCard />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Your most recent wallet transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsError ? (
              <p className="text-center text-muted-foreground py-8">
                Failed to load transactions
              </p>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction: Transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(transaction.created_at)}</span>
                        <span>•</span>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    <div className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {transaction.amount > 0 ? '+' : ''}{formatNaira(transaction.amount)}
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/wallet/transactions">
                    View All Transactions
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposit-options">Deposit Options</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Overview</CardTitle>
              <CardDescription>
                Summary of your wallet activity and balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">Current Balance</div>
                  <div className="text-2xl font-bold">{formatNaira(wallet?.balance || 0)}</div>
                </div>
                
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Deposits</div>
                  <div className="text-2xl font-bold">
                    {formatNaira(
                      transactions
                        ?.filter(t => t.type === 'credit' && t.status === 'completed')
                        .reduce((sum, t) => sum + t.amount, 0) || 0
                    )}
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Withdrawals</div>
                  <div className="text-2xl font-bold">
                    {formatNaira(
                      transactions
                        ?.filter(t => t.type === 'debit' && t.status === 'completed')
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
                    )}
                  </div>
                </div>
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Wallet Usage Tips</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">1</span>
                    <span>Deposit funds to place bets on your favorite teams and matches.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">2</span>
                    <span>Winnings are automatically credited to your wallet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">3</span>
                    <span>Keep track of your transactions to manage your betting budget.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deposit-options" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Options</CardTitle>
              <CardDescription>
                Available methods to fund your wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Card Payment</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Deposit using your debit or credit card (Visa, Mastercard, Verve)
                  </p>
                  <Button size="sm" className="w-full" onClick={() => {}}>
                    Deposit with Card
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Bank Transfer</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Make a direct transfer from your bank account
                  </p>
                  <Button size="sm" className="w-full" onClick={() => {}}>
                    Deposit via Transfer
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border p-4 bg-muted">
                <h3 className="font-medium mb-2">Important Information</h3>
                <ul className="space-y-2 text-sm">
                  <li>Minimum deposit amount: ₦500</li>
                  <li>Maximum deposit amount: ₦500,000</li>
                  <li>Deposits are processed instantly</li>
                  <li>All transactions are secured by Paystack</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Information</CardTitle>
              <CardDescription>
                How we keep your funds and information safe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Secure Transactions</h3>
                <p className="text-sm">
                  All transactions are processed through Paystack, a PCI-DSS compliant payment processor. 
                  Your payment information is encrypted and never stored on our servers.
                </p>
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Account Protection</h3>
                <p className="text-sm">
                  Your account is protected by:
                </p>
                <ul className="list-disc pl-6 text-sm mt-2 space-y-1">
                  <li>Secure authentication</li>
                  <li>Email verification for sensitive actions</li>
                  <li>Transaction monitoring</li>
                  <li>Fraud detection systems</li>
                </ul>
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Responsible Gambling</h3>
                <p className="text-sm">
                  We encourage responsible gambling. You can set deposit limits and self-exclusion periods 
                  through your account settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 