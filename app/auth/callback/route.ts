import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')
    const next = requestUrl.searchParams.get('next') || '/dashboard'

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, error_description)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error_description || 'Authentication failed')}`, request.url)
      )
    }

    if (!code) {
      console.error('No code provided')
      return NextResponse.redirect(
        new URL('/login?error=No authorization code provided', request.url)
      )
    }

    const supabase = createServerClient()
    
    // Exchange the code for a session
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Session exchange error:', exchangeError)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
      )
    }

    if (!session?.user) {
      return NextResponse.redirect(
        new URL('/login?error=Failed to create session', request.url)
      )
    }

    // Sync user profile
    const profile = await syncUserProfile(supabase, session.user)

    // Redirect based on user role
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      new URL('/login?error=An unexpected error occurred', request.url)
    )
  }
}

async function syncUserProfile(supabase: any, user: any) {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single()

    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0],
      avatar_url: user.user_metadata.avatar_url,
      provider: user.app_metadata.provider,
      role: existingProfile?.role || 'user', // Preserve existing role or default to 'user'
      updated_at: new Date().toISOString(),
    }

    if (!existingProfile) {
      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{ ...userData, created_at: new Date().toISOString() }])
        .select()
        .single()

      if (insertError) throw insertError
      return newProfile
    } else {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError
      return updatedProfile
    }
  } catch (error) {
    console.error('Error syncing user profile:', error)
    return null
  }
} 