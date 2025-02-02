'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { validateTeamName } from '@/lib/validations/team'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '5-3-2', '4-2-3-1']
const PLAYING_STYLES = ['Attacking', 'Defensive', 'Possession', 'Counter-Attack']
const MENTALITIES = ['Balanced', 'Aggressive', 'Conservative']

interface Team {
  id: string
  name: string
  formation: string
  playing_style: string
  mentality: string
  league_members?: Array<{
    leagues: {
      name: string
    }
  }>
}

interface EditTeamFormProps {
  team: Team
}

export function EditTeamForm({ team }: EditTeamFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: team.name,
    formation: team.formation,
    playing_style: team.playing_style,
    mentality: team.mentality
  })

  const isInLeague = team.league_members && team.league_members.length > 0
  const leagueNames = team.league_members?.map(member => member.leagues.name).join(', ')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Validate team name if it changed
      if (formData.name !== team.name) {
        const { success, error: validationError } = await validateTeamName(formData.name, supabase)
        if (!success) {
          toast({
            title: "Validation Error",
            description: validationError,
            variant: "destructive"
          })
          return
        }
      }

      // Update team
      const { error } = await supabase
        .from('teams')
        .update({
          name: formData.name,
          formation: formData.formation,
          playing_style: formData.playing_style,
          mentality: formData.mentality
        })
        .eq('id', team.id)

      if (error) throw error

      toast({
        title: "Team Updated",
        description: "Your team has been updated successfully!"
      })

      router.refresh()
    } catch (error) {
      console.error('Error updating team:', error)
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTeam = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id)

      if (error) throw error

      toast({
        title: "Team Deleted",
        description: "Your team has been deleted successfully!"
      })

      router.push('/dashboard/team')
    } catch (error) {
      console.error('Error deleting team:', error)
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isInLeague && (
        <div className="rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">
            This team is part of the following leagues: {leagueNames}. 
            Some settings may be locked during active leagues.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter your team name"
          required
          minLength={3}
          maxLength={30}
          pattern="^[a-zA-Z0-9\s-]+$"
          disabled={isLoading || isInLeague}
        />
        <p className="text-sm text-muted-foreground">
          3-30 characters, letters, numbers, spaces, and hyphens only
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="formation">Formation</Label>
        <Select
          value={formData.formation}
          onValueChange={(value) => setFormData(prev => ({ ...prev, formation: value }))}
          disabled={isLoading}
        >
          <SelectTrigger id="formation">
            <SelectValue placeholder="Select formation" />
          </SelectTrigger>
          <SelectContent>
            {FORMATIONS.map((formation) => (
              <SelectItem key={formation} value={formation}>
                {formation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="playing_style">Playing Style</Label>
        <Select
          value={formData.playing_style}
          onValueChange={(value) => setFormData(prev => ({ ...prev, playing_style: value }))}
          disabled={isLoading}
        >
          <SelectTrigger id="playing_style">
            <SelectValue placeholder="Select playing style" />
          </SelectTrigger>
          <SelectContent>
            {PLAYING_STYLES.map((style) => (
              <SelectItem key={style} value={style}>
                {style}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mentality">Team Mentality</Label>
        <Select
          value={formData.mentality}
          onValueChange={(value) => setFormData(prev => ({ ...prev, mentality: value }))}
          disabled={isLoading}
        >
          <SelectTrigger id="mentality">
            <SelectValue placeholder="Select mentality" />
          </SelectTrigger>
          <SelectContent>
            {MENTALITIES.map((mentality) => (
              <SelectItem key={mentality} value={mentality}>
                {mentality}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={isLoading || isInLeague}>
              Delete Team
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your team
                and remove it from any leagues it's part of.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTeam}>
                Delete Team
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  )
} 