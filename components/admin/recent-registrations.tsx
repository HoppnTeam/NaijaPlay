'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface UserRegistration {
  id: string
  full_name: string
  email: string
  created_at: string
  avatar_url?: string
  status: 'active' | 'pending' | 'inactive'
}

interface RecentRegistrationsProps {
  initialData?: UserRegistration[]
}

export function RecentRegistrations({ initialData }: RecentRegistrationsProps) {
  const [registrations, setRegistrations] = useState<UserRegistration[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialData) {
      fetchRegistrations()
    }
  }, [initialData])

  async function fetchRegistrations() {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/recent-registrations')
      if (!response.ok) {
        throw new Error('Failed to fetch recent registrations')
      }
      
      const data = await response.json()
      setRegistrations(data)
    } catch (err) {
      console.error('Error fetching recent registrations:', err)
      setError('Failed to load recent registrations')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-[200px] animate-pulse rounded bg-muted" />
                  <div className="h-3 w-[150px] animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Recent Registrations Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Registrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {registrations.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge 
                  variant={
                    user.status === 'active' 
                      ? 'success' 
                      : user.status === 'pending' 
                      ? 'warning' 
                      : 'secondary'
                  }
                >
                  {user.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(user.created_at)}
                </span>
              </div>
            </div>
          ))}
          {registrations.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No recent registrations
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 