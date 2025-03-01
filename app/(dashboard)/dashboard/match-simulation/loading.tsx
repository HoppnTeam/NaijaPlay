import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLoading } from "@/components/ui/loading"

export default function MatchSimulationLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Match Simulation</h2>
        <p className="text-muted-foreground">
          View live match data, player performances, and upcoming fixtures.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-4">
        <Card>
          <CardContent className="p-3 flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="player-performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="player-performance">Player Performance</TabsTrigger>
          <TabsTrigger value="live-matches">Live Matches</TabsTrigger>
          <TabsTrigger value="upcoming-fixtures">Upcoming Fixtures</TabsTrigger>
        </TabsList>
        
        <TabsContent value="player-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Player Performance</CardTitle>
              <CardDescription>
                View and filter player performance data from recent matches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 