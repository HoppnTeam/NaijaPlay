'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

function PaymentCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get('reference')
        if (!reference) {
          setStatus('error')
          setMessage('Invalid payment reference')
          return
        }

        const response = await fetch(`/api/wallet/topup?reference=${reference}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setStatus('success')
          setMessage('Payment successful! Your wallet has been credited.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Payment verification failed')
        }
      } catch (error) {
        console.error('Error verifying payment:', error)
        setStatus('error')
        setMessage('An error occurred while verifying your payment')
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="container max-w-lg py-12">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">Verifying Payment</h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your payment...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold text-green-500">Payment Successful</h2>
                <p className="text-muted-foreground">{message}</p>
                <Button 
                  className="mt-4" 
                  onClick={() => router.push('/betting')}
                >
                  Return to Betting
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-semibold text-destructive">Payment Failed</h2>
                <p className="text-muted-foreground">{message}</p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => router.push('/betting')}
                >
                  Return to Betting
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={<div className="container max-w-lg py-12">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Loading...</h2>
          </div>
        </CardContent>
      </Card>
    </div>}>
      <PaymentCallbackContent />
    </Suspense>
  )
} 