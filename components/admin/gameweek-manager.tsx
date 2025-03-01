'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Edit, Trash, Play, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

interface Gameweek {
  id: string
  number: number
  start_date: string
  end_date: string
  status: 'upcoming' | 'in_progress' | 'completed'
}

export function GameweekManager() {
  const [gameweeks, setGameweeks] = useState<Gameweek[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchGameweeks()
  }, [])

  const fetchGameweeks = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('gameweeks')
        .select('*')
        .order('number', { ascending: true })

      if (error) throw error
      setGameweeks(data || [])
    } catch (error) {
      console.error('Error fetching gameweeks:', error)
      toast({
        title: 'Error',
        description: 'Failed to load gameweeks',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateGameweekStatus = async (gameweekId: string, status: 'upcoming' | 'in_progress' | 'completed') => {
    try {
      setIsUpdating(gameweekId)
      
      // Update gameweek status
      const { error } = await supabase
        .from('gameweeks')
        .update({ status })
        .eq('id', gameweekId)

      if (error) throw error

      // If setting to in_progress, set all other gameweeks to not in_progress
      if (status === 'in_progress') {
        const { error: batchError } = await supabase
          .from('gameweeks')
          .update({ status: 'upcoming' })
          .neq('id', gameweekId)
          .eq('status', 'in_progress')

        if (batchError) throw batchError
      }

      // Refresh gameweeks
      await fetchGameweeks()
      
      // Show success message
      toast({
        title: 'Status Updated',
        description: `Gameweek status has been updated to ${status.replace('_', ' ')}`,
        variant: 'default',
      })
      
      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Error updating gameweek status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update gameweek status',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const deleteGameweek = async (gameweekId: string) => {
    if (!confirm('Are you sure you want to delete this gameweek? This action cannot be undone.')) {
      return
    }

    try {
      setIsUpdating(gameweekId)
      
      // Delete gameweek
      const { error } = await supabase
        .from('gameweeks')
        .delete()
        .eq('id', gameweekId)

      if (error) throw error

      // Refresh gameweeks
      await fetchGameweeks()
      
      // Show success message
      toast({
        title: 'Gameweek Deleted',
        description: 'The gameweek has been successfully deleted',
        variant: 'default',
      })
      
      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Error deleting gameweek:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete gameweek. It may have associated matches or player statistics.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="warning" className="ml-2"><Clock className="h-3 w-3 mr-1" /> Upcoming</Badge>
      case 'in_progress':
        return <Badge variant="tertiary" className="ml-2"><Play className="h-3 w-3 mr-1" /> In Progress</Badge>
      case 'completed':
        return <Badge variant="success" className="ml-2"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gameweeks</h2>
        <Button asChild>
          <Link href="/admin/gameweeks/new">
            <Plus className="h-4 w-4 mr-2" />
            New Gameweek
          </Link>
        </Button>
      </div>

      {gameweeks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-muted-foreground">No gameweeks found. Create your first gameweek to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gameweeks.map((gameweek) => (
            <Card key={gameweek.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Gameweek {gameweek.number}
                  {getStatusBadge(gameweek.status)}
                </CardTitle>
                <CardDescription>
                  {formatDate(gameweek.start_date)} - {formatDate(gameweek.end_date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className="text-sm">{gameweek.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                  >
                    <Link href={`/admin/gameweeks/${gameweek.id}`}>
                      View
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                  >
                    <Link href={`/admin/gameweeks/${gameweek.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
                <div className="flex space-x-2">
                  {gameweek.status !== 'in_progress' && (
                    <Button 
                      variant="tertiary" 
                      size="sm"
                      onClick={() => updateGameweekStatus(gameweek.id, 'in_progress')}
                      disabled={!!isUpdating}
                    >
                      {isUpdating === gameweek.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      Start
                    </Button>
                  )}
                  {gameweek.status !== 'completed' && gameweek.status === 'in_progress' && (
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => updateGameweekStatus(gameweek.id, 'completed')}
                      disabled={!!isUpdating}
                    >
                      {isUpdating === gameweek.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Complete
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteGameweek(gameweek.id)}
                    disabled={!!isUpdating}
                  >
                    {isUpdating === gameweek.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Trash className="h-4 w-4 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 