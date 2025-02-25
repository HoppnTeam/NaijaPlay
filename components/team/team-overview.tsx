import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Trophy,
  Users,
  Wallet,
  TrendingUp,
  Star,
  Shield,
  Calendar,
  Layout
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Player {
  id: string
  name: string
  position: string
  team: string
  current_price: number
  purchase_price: number
  is_captain: boolean
  is_vice_captain: boolean
  minutes_played: number
  goals_scored: number
  assists: number
  clean_sheets: number
  form_rating: number
  total_points: number
}

interface Team {
  id: string
  name: string
  budget: number
  total_value: number
  formation: string
  playing_style: string
  mentality: string
  team_players: {
    players: Player
  }[]
}

interface TeamOverviewProps {
  team: Team
}

export function TeamOverview({ team }: TeamOverviewProps) {
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Goalkeeper':
        return 'bg-yellow-100 text-yellow-800'
      case 'Defender':
        return 'bg-blue-100 text-blue-800'
      case 'Midfielder':
        return 'bg-green-100 text-green-800'
      case 'Forward':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTotalStats = () => {
    return team.team_players.reduce(
      (acc, tp) => ({
        goals: acc.goals + (tp.players.goals_scored || 0),
        assists: acc.assists + (tp.players.assists || 0),
        clean_sheets: acc.clean_sheets + (tp.players.clean_sheets || 0),
        points: acc.points + (tp.players.total_points || 0),
      }),
      { goals: 0, assists: 0, clean_sheets: 0, points: 0 }
    )
  }

  const totals = getTotalStats()
  const captain = team.team_players.find(tp => tp.players.is_captain)?.players
  const viceCaptain = team.team_players.find(tp => tp.players.is_vice_captain)?.players

  return (
    <div className="space-y-6">
      {/* Team Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Squad Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(team.total_value)}</div>
            <p className="text-xs text-muted-foreground">Budget: {formatNaira(team.budget)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.points}</div>
            <p className="text-xs text-muted-foreground">Season 2023/24</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Squad Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.team_players.length}</div>
            <p className="text-xs text-muted-foreground">Max: 25 players</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formation</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.formation || '4-4-2'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Leadership */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Leadership</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Captain</p>
                  <p className="text-sm text-muted-foreground">{captain?.name || 'Not Set'}</p>
                </div>
                {captain && (
                  <Badge className={getPositionColor(captain.position)}>
                    {captain.position}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Vice Captain</p>
                  <p className="text-sm text-muted-foreground">{viceCaptain?.name || 'Not Set'}</p>
                </div>
                {viceCaptain && (
                  <Badge className={getPositionColor(viceCaptain.position)}>
                    {viceCaptain.position}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Playing Style</p>
                <p className="text-sm text-muted-foreground">{team.playing_style}</p>
              </div>
              <div>
                <p className="font-medium">Team Mentality</p>
                <p className="text-sm text-muted-foreground">{team.mentality}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Goals Scored</p>
              <p className="text-2xl font-bold">{totals.goals}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assists</p>
              <p className="text-2xl font-bold">{totals.assists}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clean Sheets</p>
              <p className="text-2xl font-bold">{totals.clean_sheets}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Squad List */}
      <Card>
        <CardHeader>
          <CardTitle>Squad Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Goals</TableHead>
                  <TableHead className="text-right">Assists</TableHead>
                  <TableHead className="text-right">Clean Sheets</TableHead>
                  <TableHead className="text-right">Form</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.team_players.map(({ players }) => (
                  <TableRow key={players.id}>
                    <TableCell className="font-medium">
                      {players.name}
                      {players.is_captain && " (C)"}
                      {players.is_vice_captain && " (VC)"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPositionColor(players.position)}>
                        {players.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatNaira(players.current_price)}</TableCell>
                    <TableCell className="text-right">{players.goals_scored || 0}</TableCell>
                    <TableCell className="text-right">{players.assists || 0}</TableCell>
                    <TableCell className="text-right">{players.clean_sheets || 0}</TableCell>
                    <TableCell className="text-right">{players.form_rating?.toFixed(1) || '-'}/10</TableCell>
                    <TableCell className="text-right">{players.total_points || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 