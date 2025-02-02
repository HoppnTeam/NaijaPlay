import { z } from 'zod'

export const teamNameSchema = z.object({
  name: z
    .string()
    .min(3, 'Team name must be at least 3 characters')
    .max(30, 'Team name must be less than 30 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Team name can only contain letters, numbers, spaces, and hyphens')
    .refine(
      (name) => !name.toLowerCase().includes('admin'),
      'Team name cannot contain the word "admin"'
    )
})

export const teamSchema = z.object({
  name: teamNameSchema.shape.name,
  formation: z.enum(['4-3-3', '4-4-2', '3-5-2', '5-3-2', '4-2-3-1']),
  playing_style: z.enum(['Attacking', 'Defensive', 'Possession', 'Counter-Attack']),
  mentality: z.enum(['Balanced', 'Aggressive', 'Conservative'])
})

export type TeamFormData = z.infer<typeof teamSchema>

export const validateTeamName = async (name: string, supabase: any) => {
  try {
    // Only validate the format for new teams
    const parsed = teamNameSchema.parse({ name })
    return { success: true }
  } catch (error) {
    console.error('Validation error:', error)
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0].message 
      }
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Invalid team name'
    }
  }
} 