'use client'

import { Component, ReactNode } from 'react'
import { Button } from "@/components/ui/button"
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We're having trouble loading this content. Please try again later.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#008753] text-white hover:bg-[#006B42]"
            >
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 