import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  text?: string
}

export function Loading({
  size = 24,
  text = 'Loading...',
  className,
  ...props
}: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-2',
        className
      )}
      {...props}
    >
      <Loader2
        className="animate-spin text-muted-foreground"
        size={size}
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
} 