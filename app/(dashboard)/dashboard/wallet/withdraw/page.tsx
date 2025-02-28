import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { WithdrawalForm } from '@/components/wallet/withdrawal-form'

export default async function WithdrawPage() {
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
  
  if (walletError) {
    // Handle error - redirect to wallet page with error message
    redirect('/dashboard/wallet?error=wallet_not_found')
  }
  
  // Check if user has pending withdrawal requests
  const { data: pendingWithdrawals, error: pendingError } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'debit')
    .eq('status', 'pending')
    .limit(1)
  
  const hasPendingWithdrawal = pendingWithdrawals && pendingWithdrawals.length > 0

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/wallet">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Withdraw Funds</h1>
          <p className="text-muted-foreground">
            Request a withdrawal from your wallet to your bank account
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Request</CardTitle>
            <CardDescription>
              Fill in the form to request a withdrawal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPendingWithdrawal ? (
              <div className="text-center py-6 space-y-4">
                <h3 className="text-lg font-medium">You have a pending withdrawal request</h3>
                <p className="text-muted-foreground">
                  Please wait for your current request to be processed before submitting a new one.
                  Withdrawals are typically processed within 24 hours.
                </p>
                <Button asChild>
                  <Link href="/dashboard/wallet/transactions">
                    View Transactions
                  </Link>
                </Button>
              </div>
            ) : wallet.balance < 1000 ? (
              <div className="text-center py-6 space-y-4">
                <h3 className="text-lg font-medium">Insufficient Balance</h3>
                <p className="text-muted-foreground">
                  You need a minimum balance of ₦1,000 to request a withdrawal.
                  Your current balance is ₦{wallet.balance.toLocaleString()}.
                </p>
                <Button asChild>
                  <Link href="/dashboard/wallet">
                    Go to Wallet
                  </Link>
                </Button>
              </div>
            ) : (
              <WithdrawalForm 
                userBalance={wallet.balance} 
                onSuccess={() => redirect('/dashboard/wallet/transactions')}
              />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Information</CardTitle>
            <CardDescription>
              Important details about the withdrawal process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Processing Time</h3>
              <p className="text-sm">
                Withdrawal requests are processed within 24 hours during business days.
                Requests made on weekends or public holidays will be processed on the next business day.
              </p>
            </div>
            
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Bank Transfer Details</h3>
              <p className="text-sm">
                Funds will be transferred to the bank account provided in your request.
                Please ensure that your bank details are correct to avoid delays.
              </p>
            </div>
            
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Withdrawal Limits</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Minimum withdrawal: ₦1,000</li>
                <li>Maximum withdrawal: ₦500,000</li>
                <li>Daily withdrawal limit: ₦1,000,000</li>
              </ul>
            </div>
            
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm">
                If you have any questions or need assistance with your withdrawal,
                please contact our support team at support@naijaplay.com or through
                the help section in your dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 