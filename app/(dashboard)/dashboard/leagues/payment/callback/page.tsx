'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function LeaguePaymentCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [leagueId, setLeagueId] = useState<string | null>(null)
  const [message, setMessage] = useState('Verifying your payment...')
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('error')
        setMessage('Invalid payment reference')
        return
      }

      try {
        // Verify the transaction with Paystack
        const response = await fetch(`/api/wallet/verify?reference=${reference}`, {
          method: 'GET',
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          setStatus('error')
          setMessage(data.error || 'Payment verification failed')
          return
        }

        // Get transaction details
        const { data: transaction, error: transactionError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('id', reference)
          .single()

        if (transactionError || !transaction) {
          setStatus('error')
          setMessage('Transaction not found')
          return
        }

        // Get league ID from transaction metadata
        const leagueId = transaction.metadata?.league_id
        if (!leagueId) {
          setStatus('error')
          setMessage('League information not found')
          return
        }

        setLeagueId(leagueId)

        // Update league status from pending_payment to upcoming
        const { error: leagueError } = await supabase
          .from('leagues')
          .update({ status: 'upcoming' })
          .eq('id', leagueId)

        if (leagueError) {
          setStatus('error')
          setMessage('Failed to update league status')
          return
        }

        // Create league settings with default values
        const { error: settingsError } = await supabase
          .from('league_settings')
          .insert({
            league_id: leagueId,
            points_per_goal: 4,
            points_per_assist: 3,
            points_per_clean_sheet: 4,
            points_per_penalty_save: 5,
            points_per_penalty_miss: -2,
            points_per_yellow_card: -1,
            points_per_red_card: -3,
            points_per_own_goal: -2,
            points_per_save: 0.5,
            points_per_goal_conceded: -1
          })

        if (settingsError) {
          console.error('Error creating league settings:', settingsError)
          // Don't fail the process for this error
        }

        setStatus('success')
        setMessage('Payment successful! Your league has been created.')

        // Show success toast
        toast({
          title: "Payment Successful",
          description: "Your league has been created successfully!",
        })
      } catch (error) {
        console.error('Error verifying payment:', error)
        setStatus('error')
        setMessage('An error occurred while verifying your payment')
      }
    }

    verifyPayment()
  }, [reference, supabase, toast])

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>League Payment</CardTitle>
          <CardDescription>
            {status === 'loading' ? 'Processing your payment' : 
             status === 'success' ? 'Payment successful' : 'Payment failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-4">
          {status === 'loading' && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="h-12 w-12 text-red-500" />
          )}
          <p className="text-center text-muted-foreground">{message}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === 'success' && (
            <Button onClick={() => router.push(`/dashboard/leagues/${leagueId}`)}>
              Go to League
            </Button>
          )}
          {status === 'error' && (
            <Button onClick={() => router.push('/dashboard/leagues')}>
              Back to Leagues
            </Button>
          )}
          {status === 'loading' && (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 