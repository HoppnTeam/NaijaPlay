import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

// Create a single instance of the Supabase client
const createClient = () => {
  // Check if required environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('Make sure these are set in your environment (Vercel dashboard for production)')
  }
  
  // Use the default configuration which automatically uses environment variables
  // This works better with Vercel's environment variable system
  return createClientComponentClient<Database>()
}

// Export a singleton instance
export const supabase = createClient()

// Also export the create function for cases where a new instance is needed
export { createClient }