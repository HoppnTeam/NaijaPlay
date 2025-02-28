import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const pathname = requestUrl.pathname

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/reset-password', '/auth/callback']
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // Create supabase server client
    const supabase = createServerClient()

    // Get authenticated user if available
    const { data: { user }, error } = await supabase.auth.getUser()

    // Handle authentication
    if (!user) {
      // Redirect unauthenticated users to login
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check user role for admin routes
    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        // Redirect non-admin users to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Allow access to protected routes
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Redirect to login on error
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('error', 'An unexpected error occurred')
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/admin/:path*',
    // Auth routes
    '/login',
    '/signup',
    '/reset-password',
    '/auth/callback',
  ],
}

