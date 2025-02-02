import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '../database.types'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Enhanced validation with detailed error messages
function validateEnvironmentVariables() {
  const missingVars = []
  const invalidVars = []

  if (!supabaseUrl) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  } else if (!supabaseUrl.includes('supabase.co')) {
    invalidVars.push('NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  } else if (!supabaseAnonKey.startsWith('eyJ')) {
    invalidVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  if (!supabaseServiceKey) {
    missingVars.push('SUPABASE_SERVICE_ROLE_KEY')
  } else if (!supabaseServiceKey.startsWith('eyJ')) {
    invalidVars.push('SUPABASE_SERVICE_ROLE_KEY')
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  if (invalidVars.length > 0) {
    throw new Error(`Invalid environment variables: ${invalidVars.join(', ')}`)
  }
}

export function createServerClient() {
  try {
    validateEnvironmentVariables()
    return createServerComponentClient<Database>({ cookies })
  } catch (error) {
    console.error('Error creating Supabase server client:', error)
    throw new Error('Failed to initialize Supabase server client. Please check your configuration.')
  }
} 