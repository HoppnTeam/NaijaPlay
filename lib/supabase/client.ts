import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
}

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase client cannot be created: Missing environment variables')
  }

  try {
    return createClientComponentClient<Database>({
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    })
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw new Error('Failed to initialize Supabase client')
  }
}