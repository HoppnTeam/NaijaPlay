import { createMiddlewareClient as createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { type NextRequest, type NextResponse } from 'next/server'
import { type Database } from '../database.types'

export const createMiddlewareClient = (req: NextRequest, res: NextResponse) => {
  return createMiddlewareSupabaseClient<Database>({ req, res })
} 