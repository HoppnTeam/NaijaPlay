import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface Fixture {
  id: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  gameweek: number
}

export function UpcomingFixtures() {
  const fixtures: Fixture[] = [
    {
      id: "1",
      homeTeam: "Your Team",
      awayTeam: "Team Alpha",
      date: "Sat 20 Jan",
      time: "15:00",
      gameweek: 21,
    },
    {
      id: "2",
      homeTeam: "Team Beta",
      awayTeam: "Your Team",
      date: "Sat 27 Jan",
      time: "15:00",
      gameweek: 22,
    },
    {
      id: "3",
      homeTeam: "Your Team",
      awayTeam: "Team Gamma",
      date: "Sat 3 Feb",
      time: "15:00",
      gameweek: 23,
    },
  ]

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Fixtures
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fixtures.map((fixture) => (
            <div
              key={fixture.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {fixture.homeTeam} vs {fixture.awayTeam}
                </p>
                <p className="text-xs text-muted-foreground">
                  Gameweek {fixture.gameweek}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{fixture.date}</p>
                <p className="text-xs text-muted-foreground">{fixture.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 