'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function TopupCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')
  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const [redirectPath, setRedirectPath] = useState<string>('/dashboard/wallet')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  
  useEffect(() => {
    if (reference) {
      verifyPayment(reference)
    } else {
      setStatus('error')
      setMessage('No payment reference found')
    }
  }, [reference])
  
  const verifyPayment = async (reference: string) => {
    try {
      // Call the GET endpoint of the topup API to verify the payment
      const response = await fetch(`/api/wallet/topup?reference=${reference}`, {
        method: 'GET',
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setStatus('success')
        setMessage('Your wallet has been topped up successfully')
        
        // Fetch the transaction details
        const { data: transaction, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', reference)
          .single()
        
        if (error) {
          console.error('Error fetching transaction details:', error)
        } else {
          setTransactionDetails(transaction)
          
          // Check if this was a league funding transaction
          if (transaction?.metadata?.type === 'league_funding' && transaction?.metadata?.league_id) {
            // Update league prize pool
            const leagueId = transaction.metadata.league_id
            
            // Get current league data
            const { data: leagueData, error: leagueError } = await supabase
              .from('leagues')
              .select('additional_prize_amount')
              .eq('id', leagueId)
              .single()
            
            if (!leagueError && leagueData) {
              const currentAdditional = leagueData.additional_prize_amount || 0
              const amount = transaction.amount
              const newAdditionalAmount = currentAdditional + amount
              
              // Update league
              await supabase
                .from('leagues')
                .update({
                  additional_prize_amount: newAdditionalAmount,
                  prize_pool_funded: true
                })
                .eq('id', leagueId)
              
              // Set redirect path to league management
              setRedirectPath(`/dashboard/leagues/${leagueId}/manage?tab=prize-funding`)
            }
          }
        }
      } else {
        setStatus('error')
        setMessage(result.error || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setStatus('error')
      setMessage('An error occurred while verifying your payment')
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
  
  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'loading' && 'Verifying Payment'}
            {status === 'success' && 'Payment Successful'}
            {status === 'error' && 'Payment Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Please wait while we verify your payment...'}
            {status === 'success' && 'Your transaction has been processed successfully'}
            {status === 'error' && 'We encountered an issue with your payment'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">{message}</p>
                {transactionDetails && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Amount: {formatNaira(transactionDetails.amount)}</p>
                    <p>Reference: {transactionDetails.id}</p>
                    <p>Date: {new Date(transactionDetails.created_at).toLocaleString()}</p>
                    {transactionDetails.metadata?.type === 'league_funding' && (
                      <p className="text-green-600 font-medium">League Prize Pool Funding</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center">{message}</p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status !== 'loading' && (
            <Button asChild>
              <Link href={redirectPath}>
                {status === 'success' ? 'Continue' : 'Try Again'}
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 