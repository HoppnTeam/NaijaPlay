'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface TeamStatsProps {
  teamId: string
}

interface PlayerStats {
  id: string
  name: string
  position: string
  appearances: number
  goals: number
  assists: number
  clean_sheets: number
  form_rating: number
  points: number
}

interface DatabasePlayer {
  id: string
  name: string
  position: string
  appearances: number | null
  goals: number | null
  assists: number | null
  clean_sheets: number | null
  form_rating: number | null
  total_points: number | null
}

interface TeamPlayerWithStats {
  player: DatabasePlayer
}

export function TeamStats({ teamId }: TeamStatsProps) {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        const { data: stats, error } = await supabase
          .from('team_players')
          .select(`
            player:players(
              id,
              name,
              position,
              appearances,
              goals,
              assists,
              clean_sheets,
              form_rating,
              total_points
            )
          `)
          .eq('team_id', teamId)
          .order('total_points', { foreignTable: 'players', ascending: false })

        if (error) throw error

        if (stats) {
          const typedStats = stats as unknown as TeamPlayerWithStats[]
          const formattedStats = typedStats.map(item => ({
            id: item.player.id,
            name: item.player.name,
            position: item.player.position,
            appearances: item.player.appearances || 0,
            goals: item.player.goals || 0,
            assists: item.player.assists || 0,
            clean_sheets: item.player.clean_sheets || 0,
            form_rating: item.player.form_rating || 0,
            points: item.player.total_points || 0
          }))
          setPlayerStats(formattedStats)
        }
      } catch (error) {
        console.error('Error fetching player stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerStats()
  }, [teamId])

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Goalkeeper': return 'bg-yellow-500'
      case 'Defender': return 'bg-blue-500'
      case 'Midfielder': return 'bg-green-500'
      case 'Forward': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTotalStats = () => {
    return playerStats.reduce(
      (acc, player) => ({
        appearances: acc.appearances + player.appearances,
        goals: acc.goals + player.goals,
        assists: acc.assists + player.assists,
        clean_sheets: acc.clean_sheets + player.clean_sheets,
        points: acc.points + player.points,
      }),
      { appearances: 0, goals: 0, assists: 0, clean_sheets: 0, points: 0 }
    )
  }

  const totals = getTotalStats()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.points}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.goals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.assists}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Clean Sheets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.clean_sheets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Appearances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.appearances}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Apps</TableHead>
                  <TableHead className="text-right">Goals</TableHead>
                  <TableHead className="text-right">Assists</TableHead>
                  <TableHead className="text-right">Clean Sheets</TableHead>
                  <TableHead className="text-right">Form</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading stats...
                    </TableCell>
                  </TableRow>
                ) : (
                  playerStats.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>
                        <Badge className={getPositionColor(player.position)}>
                          {player.position}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{player.appearances}</TableCell>
                      <TableCell className="text-right">{player.goals}</TableCell>
                      <TableCell className="text-right">{player.assists}</TableCell>
                      <TableCell className="text-right">{player.clean_sheets}</TableCell>
                      <TableCell className="text-right">{player.form_rating}/10</TableCell>
                      <TableCell className="text-right font-medium">{player.points}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 