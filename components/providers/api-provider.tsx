'use client'

import { useEffect, useState } from 'react'
import { initializeApi } from '@/lib/api-football/init'
import { Loader2 } from 'lucide-react'

interface ApiProviderProps {
  children: React.ReactNode
}

export function ApiProvider({ children }: ApiProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeApi()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize API Football client:', error)
        setError(error instanceof Error ? error.message : 'Failed to initialize API')
      }
    }

    initialize()
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <p className="text-sm text-gray-500">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
} 