'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface UsePointsOptions {
  teamId: string
  gameweekId: string
}

export function usePoints({ teamId, gameweekId }: UsePointsOptions) {
  const [points, setPoints] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPoints = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        `/api/gameweeks/points?teamId=${teamId}&gameweekId=${gameweekId}`
      )
      if (!response.ok) throw new Error('Failed to fetch points')
      const data = await response.json()
      setPoints(data.points)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast({
        title: 'Error',
        description: 'Failed to fetch points',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePoints = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/gameweeks/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, gameweekId }),
      })
      if (!response.ok) throw new Error('Failed to update points')
      await fetchPoints()
      toast({
        title: 'Success',
        description: 'Points updated successfully',
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast({
        title: 'Error',
        description: 'Failed to update points',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    points,
    loading,
    error,
    fetchPoints,
    updatePoints,
  }
} 