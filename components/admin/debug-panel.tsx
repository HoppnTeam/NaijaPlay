'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export function DebugPanel() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [apiResponses, setApiResponses] = useState<{[key: string]: any}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    async function getUserInfo() {
      try {
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        
        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single()
        if (profileError) throw profileError
        
        setUserInfo({
          user,
          profile,
          isAuthenticated: !!user,
          isAdmin: profile?.role === 'admin'
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    getUserInfo()
  }, [])
  
  const testApi = async (endpoint: string) => {
    try {
      const response = await fetch(`/api/admin/${endpoint}`)
      const data = await response.json()
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          data
        }
      }))
    } catch (err: any) {
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          status: 'error',
          error: err.message
        }
      }))
    }
  }
  
  if (loading) {
    return <div>Loading debug info...</div>
  }
  
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Debug Information</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Authentication Status:</h3>
            <Badge variant={userInfo?.isAuthenticated ? "success" : "destructive"}>
              {userInfo?.isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-semibold">Admin Status:</h3>
            <Badge variant={userInfo?.isAdmin ? "success" : "destructive"}>
              {userInfo?.isAdmin ? "Is Admin" : "Not Admin"}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-semibold">User Profile:</h3>
            <pre className="bg-muted p-2 rounded text-sm">
              {JSON.stringify(userInfo?.profile, null, 2)}
            </pre>
          </div>
          
          {error && (
            <div className="text-destructive">
              <h3 className="font-semibold">Error:</h3>
              {error}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Test API Endpoints:</h3>
        <div className="space-x-2">
          <Button size="sm" onClick={() => testApi('system-stats')}>
            Test System Stats
          </Button>
          <Button size="sm" onClick={() => testApi('recent-registrations')}>
            Test Registrations
          </Button>
          <Button size="sm" onClick={() => testApi('system-health')}>
            Test System Health
          </Button>
        </div>
        
        {Object.entries(apiResponses).map(([endpoint, response]) => (
          <div key={endpoint} className="mt-4">
            <h4 className="font-semibold">{endpoint}:</h4>
            <pre className="bg-muted p-2 rounded text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </Card>
  )
} 