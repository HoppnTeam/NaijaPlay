import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Calendar, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminGameweeksPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated and has admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }
  
  // Fetch all gameweeks ordered by number
  const { data: gameweeks, error } = await supabase
    .from('gameweeks')
    .select('*')
    .order('number', { ascending: true })
  
  if (error) {
    console.error('Error fetching gameweeks:', error)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>
      case 'in_progress':
        return <Badge variant="success">In Progress</Badge>
      case 'completed':
        return <Badge>Completed</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gameweeks</h1>
        <Link href="/admin/gameweeks/new" passHref>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Gameweek
          </Button>
        </Link>
      </div>
      
      {gameweeks && gameweeks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gameweeks.map((gameweek) => (
            <Link 
              key={gameweek.id} 
              href={`/admin/gameweeks/${gameweek.id}`}
              className="transition-all hover:scale-[1.01]"
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Gameweek {gameweek.number}</CardTitle>
                    {getStatusBadge(gameweek.status)}
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(gameweek.start_date)} - {formatDate(gameweek.end_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Click to view matches and details
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Gameweeks Found</CardTitle>
            <CardDescription>
              Get started by creating your first gameweek.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/gameweeks/new" passHref>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Create First Gameweek
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 