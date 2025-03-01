'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-4 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-red-600">Admin Panel Error</h2>
        <p className="text-gray-600">
          We encountered an error while loading this admin page. Our team has been notified.
        </p>
        <div className="pt-4 flex justify-center space-x-4">
          <Button 
            onClick={() => reset()}
            className="bg-[#008753] text-white hover:bg-[#006B42]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            asChild
          >
            <Link href="/admin/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Admin Home
            </Link>
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md text-left overflow-auto max-h-64">
            <p className="font-mono text-sm text-red-600">{error.message}</p>
            {error.stack && (
              <pre className="mt-2 font-mono text-xs text-gray-700 whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 