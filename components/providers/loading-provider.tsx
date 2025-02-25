'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLoadingStore } from '@/lib/store/loading-store'
import { Progress } from '@/components/ui/progress'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

function LoadingContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isGlobalLoading, isRouteChanging, setRouteChanging } = useLoadingStore()

  useEffect(() => {
    // Route change started
    setRouteChanging(true)

    // Simulate completion after a short delay
    const timer = setTimeout(() => {
      setRouteChanging(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname, searchParams, setRouteChanging])

  return (
    <>
      {(isGlobalLoading || isRouteChanging) && (
        <div className="fixed top-0 left-0 w-full z-50">
          <Progress value={100} className="w-full h-1" />
        </div>
      )}
    </>
  )
}

export function LoadingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary fallback={<div>Error loading progress indicator</div>}>
      <Suspense fallback={null}>
        <LoadingContent />
      </Suspense>
      {children}
    </ErrorBoundary>
  )
} 