import React from 'react'
import { cn } from '@/lib/utils'
import { brandColors } from './theme-provider'

interface BrandLogoProps {
  variant?: 'default' | 'small' | 'large'
  className?: string
  onDarkBackground?: boolean
}

export function BrandLogo({ 
  variant = 'default', 
  className,
  onDarkBackground = false 
}: BrandLogoProps) {
  const sizeClasses = {
    small: 'text-xl font-bold',
    default: 'text-2xl font-bold',
    large: 'text-3xl font-bold',
  }

  return (
    <div className={cn('flex items-center', className)}>
      {onDarkBackground ? (
        // For dark backgrounds (like the green navbar)
        <span className={cn(sizeClasses[variant], 'text-white')}>
          Naija<span className="text-naijaplay-yellow">Play</span>
        </span>
      ) : (
        // For light backgrounds
        <span className={cn(sizeClasses[variant], 'text-naijaplay-orange dark:text-white')}>
          Naija<span className="text-naijaplay-yellow dark:text-naijaplay-yellow">Play</span>
        </span>
      )}
    </div>
  )
}

// Icon version of the logo
export function BrandIcon({ className, onDarkBackground = false }: { 
  className?: string,
  onDarkBackground?: boolean 
}) {
  return (
    <div 
      className={cn(
        'flex items-center justify-center rounded-full',
        onDarkBackground 
          ? 'bg-white p-2' 
          : 'bg-naijaplay-green p-2',
        className
      )}
    >
      {onDarkBackground ? (
        <>
          <span className="text-naijaplay-green font-bold text-lg">N</span>
          <span className="text-naijaplay-yellow font-bold text-lg">P</span>
        </>
      ) : (
        <>
          <span className="text-white font-bold text-lg">N</span>
          <span className="text-naijaplay-yellow font-bold text-lg">P</span>
        </>
      )}
    </div>
  )
} 