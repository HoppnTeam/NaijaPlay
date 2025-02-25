'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const FORMATIONS = [
  { value: '4-3-3', label: '4-3-3', description: 'Balanced formation with strong attacking options' },
  { value: '4-4-2', label: '4-4-2', description: 'Classic formation with good defensive stability' },
  { value: '3-5-2', label: '3-5-2', description: 'Attacking formation with wing-backs' },
  { value: '5-3-2', label: '5-3-2', description: 'Defensive formation with counter-attack potential' },
  { value: '4-2-3-1', label: '4-2-3-1', description: 'Modern formation with strong midfield control' }
]

const PLAYING_STYLES = [
  { value: 'Attacking', label: 'Attacking', description: 'Focus on scoring goals, might concede more' },
  { value: 'Defensive', label: 'Defensive', description: 'Prioritize clean sheets, might score less' },
  { value: 'Possession', label: 'Possession', description: 'Control the game through ball possession' },
  { value: 'Counter-Attack', label: 'Counter-Attack', description: 'Defend deep and strike on the break' }
]

const MENTALITIES = [
  { value: 'Balanced', label: 'Balanced', description: 'Equal focus on attack and defense' },
  { value: 'Aggressive', label: 'Aggressive', description: 'High pressing, more risks' },
  { value: 'Conservative', label: 'Conservative', description: 'Careful approach, fewer risks' }
]

export function CreateTeamForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    general?: string;
  }>({})
  const [formData, setFormData] = useState({
    name: '',
    formation: '4-3-3',
    playing_style: 'Possession',
    mentality: 'Balanced'
  })

  const validateForm = () => {
    const errors: { name?: string; general?: string } = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Team name is required'
    } else if (formData.name.length < 3) {
      errors.name = 'Team name must be at least 3 characters'
    } else if (formData.name.length > 30) {
      errors.name = 'Team name must be less than 30 characters'
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(formData.name)) {
      errors.name = 'Team name can only contain letters, numbers, spaces, and hyphens'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    const supabase = createClientComponentClient<Database>()

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Auth error:', userError)
        throw new Error('Authentication failed. Please try logging in again.')
      }

      if (!user) {
        throw new Error('Please log in to create a team')
      }

      console.log('Creating team for user:', user.id)

      // Check if user already has maximum allowed teams (5)
      const { data: existingTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .eq('user_id', user.id)

      if (teamsError) {
        console.error('Error checking existing teams:', teamsError)
        throw new Error('Failed to verify team limit')
      }

      if (existingTeams && existingTeams.length >= 5) {
        throw new Error('Maximum number of teams (5) reached')
      }

      // Check if team name already exists
      const { data: existingTeam, error: checkError } = await supabase
        .from('teams')
        .select('id')
        .eq('name', formData.name)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking team name:', checkError)
        throw new Error('Error checking team name')
      }

      if (existingTeam) {
        setFormErrors({ name: 'Team name already exists' })
        return
      }

      console.log('Creating new team with data:', {
        ...formData,
        user_id: user.id
      })

      // Create team (budget will be set by trigger)
      const { data: team, error: createError } = await supabase
        .from('teams')
        .insert({
          name: formData.name,
          formation: formData.formation,
          playing_style: formData.playing_style,
          mentality: formData.mentality,
          total_value: 0,
          user_id: user.id
        })
        .select('*')  // Select all fields including budget
        .single()

      if (createError) {
        console.error('Error creating team:', createError)
        throw createError
      }

      if (!team) {
        console.error('No team returned after creation')
        throw new Error('Failed to create team')
      }

      console.log('Team created successfully:', team)

      toast({
        title: "Team Created Successfully",
        description: `Your team has been created with an initial budget of ${formatNaira(200000000)}!`,
        variant: "default"
      })

      // Redirect to squad management
      router.push(`/dashboard/team/${team.id}/squad`)
      
    } catch (error) {
      console.error('Error in team creation:', error)
      
      let errorMessage = 'Failed to create team'
      if (error instanceof Error) {
        errorMessage = error.message
        // Handle specific database errors
        if (error.message.includes('duplicate key')) {
          errorMessage = 'Team name already exists'
          setFormErrors({ name: errorMessage })
        } else if (error.message.includes('auth')) {
          errorMessage = 'Please log in again to create a team'
        }
      }
      
      setFormErrors({
        general: errorMessage
      })
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Initial Budget Policy</CardTitle>
            <CardDescription>
              All teams receive an initial budget of 200M Naira.
              Additional tokens can be purchased to increase your available budget.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-1">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }))
                setFormErrors(prev => ({ ...prev, name: undefined }))
              }}
              placeholder="Enter your team name"
              className={formErrors.name ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {formErrors.name && (
              <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
            )}
            <p className="text-sm text-muted-foreground">
              3-30 characters, letters, numbers, spaces, and hyphens only
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="formation">Formation</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose how your players will be positioned on the field</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
                <SelectItem key={formation.value} value={formation.value}>
                  <div className="flex flex-col">
                    <span>{formation.label}</span>
                    <span className="text-xs text-muted-foreground">{formation.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="playing_style">Playing Style</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Define how your team approaches the game</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
                <SelectItem key={style.value} value={style.value}>
                  <div className="flex flex-col">
                    <span>{style.label}</span>
                    <span className="text-xs text-muted-foreground">{style.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="mentality">Team Mentality</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Set your team's approach to risk and reward</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
                <SelectItem key={mentality.value} value={mentality.value}>
                  <div className="flex flex-col">
                    <span>{mentality.label}</span>
                    <span className="text-xs text-muted-foreground">{mentality.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formErrors.general && (
          <p className="text-sm text-red-500 mt-2">{formErrors.general}</p>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Team...
            </span>
          ) : (
            "Create Team"
          )}
        </Button>
      </form>
    </TooltipProvider>
  )
} 