'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    
    // Update state with error info
    this.setState({ errorInfo })
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    // Reset error state if props change and resetOnPropsChange is true
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      prevProps !== this.props
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      })
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We're having trouble loading this content. Please try again or return to the home page.
            </p>
            <div className="flex justify-center space-x-3 mt-4">
              <Button 
                onClick={this.handleReset}
                className="bg-[#008753] text-white hover:bg-[#006B42]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-100 rounded-md text-left overflow-auto max-h-64">
                <p className="font-mono text-sm text-red-600">
                  {this.state.error?.message || 'Unknown error'}
                </p>
                {this.state.error?.stack && (
                  <pre className="mt-2 font-mono text-xs text-gray-700 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 font-mono text-xs text-gray-700 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 