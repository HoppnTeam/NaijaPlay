'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Edit2, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { EditLeagueDialog } from './edit-league-dialog'

type League = {
  id: string
  name: string
  type: string
  created_at: string
}

type LeagueListProps = {
  searchTerm: string
  typeFilter: string
}

export function LeagueList({ searchTerm, typeFilter }: LeagueListProps) {
  const [leagues, setLeagues] = useState<League[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingLeague, setEditingLeague] = useState<League | null>(null)
  const [deletingLeague, setDeletingLeague] = useState<League | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchLeagues()
  }, [searchTerm, typeFilter])

  const fetchLeagues = async () => {
    setIsLoading(true)
    let query = supabase
      .from('leagues')
      .select('*')

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`)
    }

    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter)
    }

    const { data, error } = await query

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leagues. Please try again.",
        variant: "destructive",
      })
    } else {
      setLeagues(data || [])
    }
    setIsLoading(false)
  }

  const handleDeleteLeague = async () => {
    if (!deletingLeague) return

    const { error } = await supabase
      .from('leagues')
      .delete()
      .eq('id', deletingLeague.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete league. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "League deleted successfully.",
      })
      fetchLeagues()
    }
    setDeletingLeague(null)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : leagues.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">No leagues found</TableCell>
            </TableRow>
          ) : (
            leagues.map((league) => (
              <TableRow key={league.id}>
                <TableCell>{league.name}</TableCell>
                <TableCell>{league.type}</TableCell>
                <TableCell>{new Date(league.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingLeague(league)}
                    className="mr-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingLeague(league)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <EditLeagueDialog
        league={editingLeague}
        isOpen={!!editingLeague}
        onClose={() => setEditingLeague(null)}
        onLeagueUpdated={fetchLeagues}
      />

      <AlertDialog open={!!deletingLeague} onOpenChange={() => setDeletingLeague(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the league
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLeague}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

