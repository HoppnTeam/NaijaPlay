'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  /**
   * The size of the loading spinner
   * @default "default"
   */
  size?: 'small' | 'default' | 'large'
  
  /**
   * The variant of the loading spinner
   * @default "default"
   */
  variant?: 'default' | 'page' | 'card' | 'overlay'
  
  /**
   * Optional text to display with the loading spinner
   */
  text?: string
  
  /**
   * Additional CSS classes
   */
  className?: string
}

export function Loading({
  size = 'default',
  variant = 'default',
  text,
  className,
}: LoadingProps) {
  // Size mappings
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12',
  }
  
  // Variant mappings
  const variantClasses = {
    default: 'text-primary',
    page: 'min-h-[400px] flex flex-col items-center justify-center',
    card: 'p-8 flex flex-col items-center justify-center',
    overlay: 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center',
  }
  
  // Base component
  const LoadingIndicator = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      variantClasses[variant],
      className
    )}>
      <Loader2 className={cn(
        'animate-spin',
        sizeClasses[size]
      )} />
      {text && (
        <p className={cn(
          'mt-2 text-center text-muted-foreground',
          size === 'small' ? 'text-xs' : 'text-sm'
        )}>
          {text}
        </p>
      )}
    </div>
  )
  
  return LoadingIndicator
}

/**
 * A full-page loading component
 */
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <Loading 
      variant="page" 
      size="large" 
      text={text} 
    />
  )
}

/**
 * A card loading component
 */
export function CardLoading({ text }: { text?: string }) {
  return (
    <Loading 
      variant="card" 
      text={text} 
    />
  )
}

/**
 * An overlay loading component that covers the entire screen
 */
export function OverlayLoading({ text }: { text?: string }) {
  return (
    <Loading 
      variant="overlay" 
      size="large" 
      text={text} 
    />
  )
}

/**
 * A small inline loading component
 */
export function InlineLoading({ text }: { text?: string }) {
  return (
    <Loading 
      size="small" 
      text={text} 
      className="inline-flex items-center" 
    />
  )
} 