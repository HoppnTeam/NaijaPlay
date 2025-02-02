import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Properly type the process.env without causing recursive type references
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    }
  }
}

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Enhanced validation with detailed error messages
if (!supabaseUrl || !supabaseUrl.includes('supabase.co')) {
  throw new Error('Invalid or missing NEXT_PUBLIC_SUPABASE_URL. Please check your environment variables.')
}

if (!supabaseAnonKey || !supabaseAnonKey.startsWith('eyJ')) {
  throw new Error('Invalid or missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Please check your environment variables.')
}

// Create Supabase client with error handling
try {
  // Create Supabase client
  export const supabase = createClient<Database>(
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