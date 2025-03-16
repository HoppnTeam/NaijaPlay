import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '../database.types'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Get the Supabase URL and keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Enhanced validation with detailed error messages
function validateEnvironmentVariables() {
  const missingVars = []
  const invalidVars = []

  if (!supabaseUrl) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
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

/**
 * Creates a Supabase client for server components and API routes
 */
export function createClient() {
  validateEnvironmentVariables()
  
  // The createServerComponentClient doesn't accept supabaseUrl and supabaseKey directly
  // It uses the environment variables by default
  return createServerComponentClient<Database>({ cookies })
}

// Create a server client with service role for admin operations
export function createServiceClient() {
  validateEnvironmentVariables()
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required environment variables for service client')
  }
  
  return createSupabaseClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
} 