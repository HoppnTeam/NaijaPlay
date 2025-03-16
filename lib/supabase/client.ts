import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

// Create a single instance of the Supabase client
const createClient = () => {
  // Check if required environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    // Don't throw an error, just warn and return a client that will trigger proper server-side errors
  }
  
  return createClientComponentClient<Database>()
}

// Export a singleton instance
export const supabase = createClient()

// Also export the create function for cases where a new instance is needed
export { createClient }