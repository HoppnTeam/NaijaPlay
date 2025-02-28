'use client'

import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface PaymentStatusProps {
  status: 'processing' | 'success' | 'error'
  message: string
}

export function PaymentStatus({ status, message }: PaymentStatusProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="text-center">
          {status === 'processing' && (
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
          )}
          
          <h2 className="mt-4 text-xl font-bold">
            {status === 'processing' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful'}
            {status === 'error' && 'Payment Failed'}
          </h2>
          
          <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
          
          {status === 'error' && (
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-4"
            >
              Return to Dashboard
            </Button>
          )}
          
          {status === 'success' && (
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-4"
              variant="outline"
            >
              Return to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 