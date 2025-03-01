'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
            <p className="text-gray-600">
              We're sorry, but there was an error loading this page. Our team has been notified.
            </p>
            <div className="pt-4 flex justify-center space-x-4">
              <Button 
                onClick={() => reset()}
                className="bg-[#008753] text-white hover:bg-[#006B42]"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
              >
                Go Home
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
      </body>
    </html>
  )
} 