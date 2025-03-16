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

  if (!supabaseUrl) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  if (!supabaseServiceKey) {
    missingVars.push('SUPABASE_SERVICE_ROLE_KEY')
  }

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`)
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
    console.error('Missing required environment variables for service client')
    return null
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