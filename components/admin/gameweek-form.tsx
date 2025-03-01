'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface GameweekFormProps {
  gameweekId?: string
}

interface GameweekFormData {
  number: number
  start_date: string
  end_date: string
  status: 'upcoming' | 'in_progress' | 'completed'
}

export function GameweekForm({ gameweekId }: GameweekFormProps) {
  const [formData, setFormData] = useState<GameweekFormData>({
    number: 1,
    start_date: '',
    end_date: '',
    status: 'upcoming',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const isEditing = !!gameweekId

  useEffect(() => {
    if (isEditing) {
      fetchGameweek()
    } else {
      // For new gameweeks, set default dates to current week
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // Saturday
      
      setFormData({
        ...formData,
        start_date: startOfWeek.toISOString().split('T')[0],
        end_date: endOfWeek.toISOString().split('T')[0],
      })
      
      // Get the next gameweek number
      fetchNextGameweekNumber()
    }
  }, [gameweekId])

  const fetchGameweek = async () => {
    try {
      setIsFetching(true)
      const { data, error } = await supabase
        .from('gameweeks')
        .select('*')
        .eq('id', gameweekId)
        .single()

      if (error) throw error
      
      if (data) {
        setFormData({
          number: data.number,
          start_date: data.start_date.split('T')[0],
          end_date: data.end_date.split('T')[0],
          status: data.status,
        })
      }
    } catch (error) {
      console.error('Error fetching gameweek:', error)
      toast({
        title: 'Error',
        description: 'Failed to load gameweek data',
        variant: 'destructive',
      })
    } finally {
      setIsFetching(false)
    }
  }

  const fetchNextGameweekNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('gameweeks')
        .select('number')
        .order('number', { ascending: false })
        .limit(1)

      if (error) throw error
      
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          number: data[0].number + 1
        }))
      }
    } catch (error) {
      console.error('Error fetching next gameweek number:', error)
    }
  }

  const handleChange = (field: keyof GameweekFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      
      // Validate form data
      if (!formData.number || !formData.start_date || !formData.end_date) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        })
        return
      }
      
      // Format dates for database
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      // Validate dates
      if (startDate > endDate) {
        toast({
          title: 'Validation Error',
          description: 'Start date must be before end date',
          variant: 'destructive',
        })
        return
      }
      
      if (isEditing) {
        // Update existing gameweek
        const { error } = await supabase
          .from('gameweeks')
          .update({
            number: formData.number,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
          })
          .eq('id', gameweekId)

        if (error) throw error
        
        toast({
          title: 'Success',
          description: 'Gameweek updated successfully',
          variant: 'default',
        })
      } else {
        // Create new gameweek
        const { error } = await supabase
          .from('gameweeks')
          .insert({
            number: formData.number,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
          })

        if (error) throw error
        
        toast({
          title: 'Success',
          description: 'Gameweek created successfully',
          variant: 'default',
        })
      }
      
      // Redirect back to gameweeks list
      router.push('/dashboard/admin/gameweeks')
      router.refresh()
    } catch (error) {
      console.error('Error saving gameweek:', error)
      toast({
        title: 'Error',
        description: isEditing ? 'Failed to update gameweek' : 'Failed to create gameweek',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/dashboard/admin/gameweeks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gameweeks
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">{isEditing ? 'Edit Gameweek' : 'Create Gameweek'}</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Gameweek Details' : 'New Gameweek Details'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="number">Gameweek Number</Label>
              <Input
                id="number"
                type="number"
                min="1"
                value={formData.number}
                onChange={(e) => handleChange('number', parseInt(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/admin/gameweeks">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Gameweek' : 'Create Gameweek'}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 