import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/database.types'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          setProfile(null)
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error

        setProfile(data)
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load profile'))
      } finally {
        setLoading(false)
      }
    }

    loadProfile()

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
      }, loadProfile)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { profile, loading, error }
} 