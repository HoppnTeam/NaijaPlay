'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function MatchDataHeader() {
  const router = useRouter()
  
  const handleRefresh = () => {
    router.refresh()
  }
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Match Data</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="h-9"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
      <p className="text-muted-foreground">
        View live match data, player performances, and upcoming fixtures. This data is used to update player statistics in the fantasy football game.
      </p>
    </div>
  )
} 