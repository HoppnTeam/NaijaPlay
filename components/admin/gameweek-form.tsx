'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

// Define the schema for gameweek validation
const gameweekSchema = z.object({
  number: z.coerce.number().int().positive('Gameweek number must be positive'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.enum(['upcoming', 'in_progress', 'completed'], {
    required_error: 'Please select a status',
  }),
})

type GameweekFormValues = z.infer<typeof gameweekSchema>

interface GameweekFormProps {
  initialData?: {
    id: string
    number: number
    start_date: string
    end_date: string
    status: 'upcoming' | 'in_progress' | 'completed'
  }
}

export default function GameweekForm({ initialData }: GameweekFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Initialize form with default values or initial data
  const form = useForm<GameweekFormValues>({
    resolver: zodResolver(gameweekSchema),
    defaultValues: initialData ? {
      number: initialData.number,
      start_date: new Date(initialData.start_date).toISOString().split('T')[0],
      end_date: new Date(initialData.end_date).toISOString().split('T')[0],
      status: initialData.status,
    } : {
      number: 1,
      start_date: '',
      end_date: '',
      status: 'upcoming',
    },
  })

  async function onSubmit(data: GameweekFormValues) {
    setIsLoading(true)
    
    try {
      const endpoint = initialData 
        ? `/api/gameweeks/${initialData.id}` 
        : '/api/gameweeks'
      
      const method = initialData ? 'PATCH' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Something went wrong')
      }
      
      toast({
        title: initialData ? 'Gameweek updated' : 'Gameweek created',
        description: initialData 
          ? `Gameweek ${data.number} has been updated successfully.` 
          : `Gameweek ${data.number} has been created successfully.`,
      })
      
      // Redirect to gameweeks list or the updated gameweek
      if (initialData) {
        router.push(`/admin/gameweeks/${initialData.id}`)
      } else {
        router.push('/admin/gameweeks')
      }
      router.refresh()
    } catch (error) {
      console.error('Error submitting gameweek:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save gameweek',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{initialData ? 'Edit Gameweek' : 'Create Gameweek'}</CardTitle>
              <Link href={initialData ? `/admin/gameweeks/${initialData.id}` : '/admin/gameweeks'} passHref>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gameweek Number</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    The sequential number of this gameweek in the season
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Update Gameweek' : 'Create Gameweek'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
} 