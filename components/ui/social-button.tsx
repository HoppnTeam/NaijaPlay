import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  loading?: boolean
}

export function SocialButton({
  icon: Icon,
  loading,
  children,
  className,
  ...props
}: SocialButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn("w-full flex items-center gap-2", className)}
      disabled={loading}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {children}
      {loading && (
        <div className="ml-auto" role="status">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
        </div>
      )}
    </Button>
  )
} 