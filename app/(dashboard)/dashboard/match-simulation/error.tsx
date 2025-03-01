'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function MatchSimulationError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Match Simulation error:', error)
  }, [error])

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <CardTitle className="text-xl">Error Loading Match Simulation</CardTitle>
          </div>
          <CardDescription>
            There was a problem loading the match simulation data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We're sorry, but something went wrong while trying to load the match simulation data. 
            You can try refreshing the page or return to the dashboard.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-32">
              <p className="font-semibold">Error: {error.message}</p>
              {error.stack && (
                <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 