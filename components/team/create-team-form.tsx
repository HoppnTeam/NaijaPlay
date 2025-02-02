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

const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '5-3-2', '4-2-3-1']
const PLAYING_STYLES = ['Attacking', 'Defensive', 'Possession', 'Counter-Attack']
const MENTALITIES = ['Balanced', 'Aggressive', 'Conservative']

export function CreateTeamForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    formation: '4-3-3',
    playing_style: 'Possession',
    mentality: 'Balanced'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Validate team name
      const { success, error: validationError } = await validateTeamName(formData.name, supabase)
      if (!success) {
        toast({
          title: "Validation Error",
          description: validationError,
          variant: "destructive"
        })
        return
      }

      // Create team
      const { data: team, error } = await supabase
        .from('teams')
        .insert({
          name: formData.name,
          formation: formData.formation,
          playing_style: formData.playing_style,
          mentality: formData.mentality,
          budget: 100000000, // 100M initial budget
          total_value: 0
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Team Created",
        description: "Your team has been created successfully!"
      })

      router.push(`/dashboard/team/${team.id}/manage-players`)
    } catch (error) {
      console.error('Error creating team:', error)
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          disabled={isLoading}
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Team"}
      </Button>
    </form>
  )
} 