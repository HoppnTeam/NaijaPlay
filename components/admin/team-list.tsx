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
import { EditTeamDialog } from './edit-team-dialog'

type Team = {
  id: string
  name: string
  user_id: string
  league_id: string
  league_name: string
  created_at: string
}

type TeamListProps = {
  searchTerm: string
  leagueFilter: string
}

export function TeamList({ searchTerm, leagueFilter }: TeamListProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchTeams()
  }, [searchTerm, leagueFilter])

  const fetchTeams = async () => {
    setIsLoading(true)
    let query = supabase
      .from('teams')
      .select(`
        *,
        league:leagues(id, name)
      `)

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`)
    }

    if (leagueFilter !== 'all') {
      query = query.eq('league.name', leagueFilter)
    }

    const { data, error } = await query

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teams. Please try again.",
        variant: "destructive",
      })
    } else {
      setTeams(data?.map(team => ({
        ...team,
        league_name: team.league?.name
      })) || [])
    }
    setIsLoading(false)
  }

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', deletingTeam.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Team deleted successfully.",
      })
      fetchTeams()
    }
    setDeletingTeam(null)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>League</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : teams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">No teams found</TableCell>
            </TableRow>
          ) : (
            teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>
                <TableCell>{team.league_name}</TableCell>
                <TableCell>{new Date(team.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTeam(team)}
                    className="mr-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingTeam(team)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <EditTeamDialog
        team={editingTeam}
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        onTeamUpdated={fetchTeams}
      />

      <AlertDialog open={!!deletingTeam} onOpenChange={() => setDeletingTeam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

