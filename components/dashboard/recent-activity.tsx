import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock } from "lucide-react"

interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: string
}

export function RecentActivity() {
  // This would typically come from your database
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "transfer",
      description: "Added Player X to your team",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "points",
      description: "Earned 24 points in Gameweek 5",
      timestamp: "1 day ago",
    },
    // Add more activities
  ]

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-lg border p-4"
            >
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 