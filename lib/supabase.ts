import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Properly type the process.env without causing recursive type references
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      NEXT_PUBLIC_SUPABASE_URL_PROD: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD: string
      SUPABASE_ENV: 'local' | 'production'
    }
  }
}

// Determine which environment to use
const isProduction = process.env.SUPABASE_ENV === 'production'

// Get the appropriate Supabase URL and key based on the environment
const supabaseUrl = isProduction 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD 
  : process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseAnonKey = isProduction 
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD 
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Enhanced validation with detailed error messages
if (!supabaseUrl) {
  throw new Error(`Invalid or missing Supabase URL for ${isProduction ? 'production' : 'local'} environment. Please check your environment variables.`)
}

if (!supabaseAnonKey) {
  throw new Error(`Invalid or missing Supabase Anon Key for ${isProduction ? 'production' : 'local'} environment. Please check your environment variables.`)
}

// Log which environment is being used (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log(`Using ${isProduction ? 'PRODUCTION' : 'LOCAL'} Supabase environment`)
  console.log(`Supabase URL: ${supabaseUrl}`)
}

// Create Supabase client
let supabase: ReturnType<typeof createClient<Database>>

// Initialize with error handling
try {
  supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: 'public',
      },
    }
  )
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
  throw new Error('Failed to initialize Supabase client. Please check your configuration.')
}

export { supabase }