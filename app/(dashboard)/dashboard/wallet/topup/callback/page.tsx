'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/components/ui/use-toast'
import { PaymentStatus } from '@/components/wallet/payment-status'

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Verifying your payment...')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const reference = searchParams.get('reference')
  const supabase = createClientComponentClient()

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('error')
        setMessage('Invalid payment reference')
        return
      }

      try {
        // Verify the payment with our API
        const response = await fetch(`/api/wallet/topup?reference=${reference}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Payment verification failed')
        }

        // Fetch updated wallet balance
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('wallets').select('balance').eq('user_id', user.id).single()
        }

        setStatus('success')
        setMessage(data.message || 'Payment successful! Your wallet has been topped up.')
        
        // Show success toast
        toast({
          title: 'Payment Successful',
          description: 'Your wallet has been topped up successfully.',
          variant: 'default',
        })

        // Redirect to wallet page after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } catch (error) {
        console.error('Error verifying payment:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Payment verification failed')
        
        // Show error toast
        toast({
          title: 'Payment Failed',
          description: error instanceof Error ? error.message : 'Failed to verify payment',
          variant: 'destructive',
        })
      }
    }

    verifyPayment()
  }, [reference, router, toast, supabase])

  return <PaymentStatus status={status} message={message} />
} 