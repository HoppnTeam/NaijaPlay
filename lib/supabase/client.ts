import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

// Determine which environment to use
const isProduction = process.env.SUPABASE_ENV === 'production'

// Log which environment is being used (only in development and client-side)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log(`Using ${isProduction ? 'PRODUCTION' : 'LOCAL'} Supabase environment (client)`)
}

// Create a single instance of the Supabase client
const createClient = () => {
  return createClientComponentClient<Database>({
    supabaseUrl: isProduction 
      ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD 
      : process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: isProduction 
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD 
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}

// Export a singleton instance
export const supabase = createClient()

// Also export the create function for cases where a new instance is needed
export { createClient }