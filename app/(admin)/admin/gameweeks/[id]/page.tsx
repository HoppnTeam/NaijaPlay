import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Calendar, Edit } from 'lucide-react'
import Link from 'next/link'
import MatchList from '@/components/admin/match-list'

export default async function AdminGameweekDetailPage({ params }: { params: { id: string } }) {
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
  
  // Fetch gameweek details
  const { data: gameweek, error } = await supabase
    .from('gameweeks')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error || !gameweek) {
    redirect('/admin/gameweeks')
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
        <div className="flex items-center gap-4">
          <Link href="/admin/gameweeks" passHref>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Gameweeks
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Gameweek {gameweek.number}</h1>
          {getStatusBadge(gameweek.status)}
        </div>
        <Link href={`/admin/gameweeks/${gameweek.id}/edit`} passHref>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-1" />
            Edit Gameweek
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gameweek Details
          </CardTitle>
          <CardDescription>
            {formatDate(gameweek.start_date)} - {formatDate(gameweek.end_date)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Start Date</p>
              <p>{new Date(gameweek.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">End Date</p>
              <p>{new Date(gameweek.end_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="capitalize">{gameweek.status.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gameweek Number</p>
              <p>{gameweek.number}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <MatchList gameweekId={gameweek.id} />
    </div>
  )
} 