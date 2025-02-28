import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DepositForm } from '@/components/wallet/deposit-form'

export default async function DepositPage() {
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

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/wallet">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Deposit Funds</h1>
          <p className="text-muted-foreground">
            Add money to your wallet to place bets
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deposit</CardTitle>
            <CardDescription>
              Choose an amount to deposit into your wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DepositForm userBalance={wallet.balance} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Deposit Information</CardTitle>
            <CardDescription>
              Important details about the deposit process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Payment Methods</h3>
              <p className="text-sm">
                We accept various payment methods including debit/credit cards (Visa, Mastercard, Verve)
                and bank transfers. All payments are processed securely through Paystack.
              </p>
            </div>
            
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Processing Time</h3>
              <p className="text-sm">
                Deposits are typically processed instantly. However, in some cases, it may take
                up to 30 minutes for funds to reflect in your wallet, depending on your payment method.
              </p>
            </div>
            
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Deposit Limits</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Minimum deposit: ₦500</li>
                <li>Maximum deposit: ₦500,000</li>
                <li>Daily deposit limit: ₦1,000,000</li>
              </ul>
            </div>
            
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm">
                If you have any questions or need assistance with your deposit,
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