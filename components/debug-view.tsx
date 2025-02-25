'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DebugViewProps {
  data: any
  title?: string
}

export function DebugView({ data, title = 'Debug Data' }: DebugViewProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <Card className="p-4 my-4 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? 'Hide' : 'Show'} Data
        </Button>
      </div>
      {isVisible && (
        <pre className="text-xs overflow-auto max-h-96 bg-white dark:bg-slate-800 p-4 rounded-md">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </Card>
  )
} 