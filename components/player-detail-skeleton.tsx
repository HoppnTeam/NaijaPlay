import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PlayerDetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="space-y-2">
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

