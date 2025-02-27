'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

interface DebugProfileProps {
  profile: any
}

export function DebugProfile({ profile }: DebugProfileProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    console.log('Profile data in debug component:', profile)
  }, [profile])

  if (!profile) return null

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-2 bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      
      {isVisible && (
        <div className="bg-black/80 text-white p-4 rounded-md text-xs max-w-xs overflow-auto">
          <h3 className="font-bold mb-2">Debug Profile Data:</h3>
          <div className="mb-2">
            <span className="font-semibold">Username:</span> {profile.username || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Full Name:</span> {profile.full_name || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Email:</span> {profile.email || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Role:</span> {profile.role || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Is Admin:</span> {isAdmin ? 'Yes' : 'No'}
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-1">Raw Data:</h4>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(profile, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
} 