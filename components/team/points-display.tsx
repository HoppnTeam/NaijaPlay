'use client'

import { useEffect } from 'react'
import { usePoints } from '@/hooks/use-points'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'

interface PointsDisplayProps {
  teamId: string
  gameweekId: string
}

export function PointsDisplay({ teamId, gameweekId }: PointsDisplayProps) {
  const { points, loading, error, fetchPoints, updatePoints } = usePoints({
    teamId,
    gameweekId,
  })

  useEffect(() => {
    fetchPoints()
  }, [teamId, gameweekId])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Gameweek Points</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={updatePoints}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          ) : error ? (
            <div className="text-sm text-destructive">Error loading points</div>
          ) : (
            points ?? 0
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Updated automatically after matches
        </p>
      </CardContent>
    </Card>
  )
} 