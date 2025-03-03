import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '../database.types'
import { createClient } from '@supabase/supabase-js'

// Determine which environment to use
const isProduction = process.env.SUPABASE_ENV === 'production'

// Get the appropriate Supabase URL and keys based on the environment
const supabaseUrl = isProduction 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD 
  : process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseAnonKey = isProduction 
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD 
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseServiceKey = isProduction 
  ? process.env.SUPABASE_SERVICE_ROLE_KEY_PROD 
  : process.env.SUPABASE_SERVICE_ROLE_KEY

// Log which environment is being used (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log(`Using ${isProduction ? 'PRODUCTION' : 'LOCAL'} Supabase environment (server)`)
}

// Enhanced validation with detailed error messages
function validateEnvironmentVariables() {
  const missingVars = []
  const invalidVars = []

  if (!supabaseUrl) {
    missingVars.push(`${isProduction ? 'NEXT_PUBLIC_SUPABASE_URL_PROD' : 'NEXT_PUBLIC_SUPABASE_URL'}`)
  }

  if (!supabaseAnonKey) {
    missingVars.push(`${isProduction ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'}`)
  } else if (!supabaseAnonKey.startsWith('eyJ')) {
    invalidVars.push(`${isProduction ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'}`)
  }

  if (!supabaseServiceKey) {
    missingVars.push(`${isProduction ? 'SUPABASE_SERVICE_ROLE_KEY_PROD' : 'SUPABASE_SERVICE_ROLE_KEY'}`)
  } else if (!supabaseServiceKey.startsWith('eyJ')) {
    invalidVars.push(`${isProduction ? 'SUPABASE_SERVICE_ROLE_KEY_PROD' : 'SUPABASE_SERVICE_ROLE_KEY'}`)
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  if (invalidVars.length > 0) {
    throw new Error(`Invalid environment variables: ${invalidVars.join(', ')}`)
  }
}

export function createServerClient() {
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
  
  return createClient<Database>(
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