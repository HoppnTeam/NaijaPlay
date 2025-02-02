'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trophy, TrendingUp, Star, Users } from 'lucide-react'

interface TeamStats {
  team_id: string
  team_name: string
  manager_name: string
  total_points: number
  gameweek_points: number
  team_value: number
  rank: number
}

interface HeadToHeadProps {
  teams: TeamStats[]
}

export function HeadToHead({ teams }: HeadToHeadProps) {
  const [team1Id, setTeam1Id] = useState<string>('')
  const [team2Id, setTeam2Id] = useState<string>('')

  const team1 = teams.find(t => t.team_id === team1Id)
  const team2 = teams.find(t => t.team_id === team2Id)

  const getComparisonColor = (val1: number, val2: number) => {
    if (val1 > val2) return 'text-green-600'
    if (val1 < val2) return 'text-red-600'
    return 'text-yellow-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Head-to-Head Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Select value={team1Id} onValueChange={setTeam1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select first team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem
                    key={team.team_id}
                    value={team.team_id}
                    disabled={team.team_id === team2Id}
                  >
                    {team.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={team2Id} onValueChange={setTeam2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select second team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem
                    key={team.team_id}
                    value={team.team_id}
                    disabled={team.team_id === team1Id}
                  >
                    {team.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {team1 && team2 && (
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="font-medium">{team1.team_name}</p>
                <p className="text-sm text-muted-foreground">{team1.manager_name}</p>
              </div>
              <div className="text-center font-semibold text-muted-foreground">
                vs
              </div>
              <div className="text-center">
                <p className="font-medium">{team2.team_name}</p>
                <p className="text-sm text-muted-foreground">{team2.manager_name}</p>
              </div>

              {/* Stats Comparison */}
              <div className="col-span-3 grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className={getComparisonColor(team1.rank, team2.rank)}>
                          {team1.rank}
                        </p>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground">Rank</p>
                      <div className="space-y-1">
                        <p className={getComparisonColor(team2.rank, team1.rank)}>
                          {team2.rank}
                        </p>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className={getComparisonColor(team1.total_points, team2.total_points)}>
                          {team1.total_points}
                        </p>
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground">Points</p>
                      <div className="space-y-1">
                        <p className={getComparisonColor(team2.total_points, team1.total_points)}>
                          {team2.total_points}
                        </p>
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className={getComparisonColor(team1.team_value, team2.team_value)}>
                          ₦{team1.team_value.toLocaleString()}
                        </p>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground">Value</p>
                      <div className="space-y-1">
                        <p className={getComparisonColor(team2.team_value, team1.team_value)}>
                          ₦{team2.team_value.toLocaleString()}
                        </p>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className={getComparisonColor(team1.gameweek_points, team2.gameweek_points)}>
                          {team1.gameweek_points}
                        </p>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground">GW Points</p>
                      <div className="space-y-1">
                        <p className={getComparisonColor(team2.gameweek_points, team1.gameweek_points)}>
                          {team2.gameweek_points}
                        </p>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 