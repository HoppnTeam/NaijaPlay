import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  loading?: boolean
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  loading = false,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-1/2 animate-pulse rounded-md bg-muted" />
            {description && (
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
            )}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 