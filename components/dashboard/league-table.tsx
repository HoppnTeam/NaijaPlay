import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { useLoadingStore } from '@/lib/store/loading-store'
import { Skeleton } from "@/components/ui/skeleton"

interface LeaguePosition {
  position: number
  teamName: string
  played: number
  points: number
  form: string
  isCurrentUser?: boolean
}

interface LeagueTableProps {
  leagueId: string
  currentTeamId?: string
  data?: LeaguePosition[]
}

export function LeagueTable({ leagueId, currentTeamId, data }: LeagueTableProps) {
  const { isFetching } = useLoadingStore()
  
  // If data is provided, use it; otherwise use sample data
  const leagueData: LeaguePosition[] = data || [
    { position: 1, teamName: "Team Alpha", played: 10, points: 25, form: "WWDWL" },
    { position: 2, teamName: "Your Team", played: 10, points: 22, form: "WDWLW", isCurrentUser: true },
    { position: 3, teamName: "Team Beta", played: 10, points: 21, form: "DWWLD" },
    { position: 4, teamName: "Team Gamma", played: 10, points: 18, form: "LLWWW" },
    { position: 5, teamName: "Team Delta", played: 10, points: 15, form: "LDWDL" },
  ]

  if (isFetching('leagueTable')) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            League Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          League Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Pos</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">Played</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead className="text-center">Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagueData.map((team) => (
              <TableRow 
                key={team.position}
                className={team.isCurrentUser ? "bg-muted/50" : undefined}
              >
                <TableCell className="font-medium">{team.position}</TableCell>
                <TableCell>{team.teamName}</TableCell>
                <TableCell className="text-center">{team.played}</TableCell>
                <TableCell className="text-center">{team.points}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {team.form.split('').map((result: string, i: number) => (
                      <span
                        key={i}
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          result === 'W'
                            ? 'bg-green-100 text-green-700'
                            : result === 'L'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 