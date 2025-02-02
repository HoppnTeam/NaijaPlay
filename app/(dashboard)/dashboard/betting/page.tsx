'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { BettingInstructions } from '@/components/betting/betting-instructions'
import { TeamBetting } from '@/components/betting/team-betting'
import { PlayerBetting } from '@/components/betting/player-betting'
import { ActiveBets } from '@/components/betting/active-bets'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface Team {
  id: string
  name: string
  points: number
}

interface Player {
  id: string
  name: string
  team: string
  position: string
  goals: number
  assists: number
  clean_sheets: number
}

export default function BettingPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [gameweeks, setGameweeks] = useState<number[]>([])
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data including balance
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('balance')
          .eq('id', user.id)
          .single()

        if (userError) throw userError
        setUserBalance(userData.balance || 0)

        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, points')
          .order('points', { ascending: false })

        if (teamsError) throw teamsError
        setTeams(teamsData)

        // Fetch players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('id, name, team, position, goals, assists, clean_sheets')
          .order('name')

        if (playersError) throw playersError
        setPlayers(playersData)

        // Generate gameweeks (assuming current season is in progress)
        const currentGameweek = 25 // TODO: Fetch this from settings/config
        setGameweeks(Array.from({ length: 38 }, (_, i) => i + 1).filter(gw => gw >= currentGameweek))

      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load betting data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <BettingInstructions />

      <Tabs defaultValue="team" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="team">Team vs Team</TabsTrigger>
          <TabsTrigger value="player">Player Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          <TeamBetting 
            teams={teams}
            gameweeks={gameweeks}
            userBalance={userBalance}
          />
        </TabsContent>

        <TabsContent value="player">
          <PlayerBetting 
            players={players}
            gameweeks={gameweeks}
            userBalance={userBalance}
          />
        </TabsContent>
      </Tabs>

      <div>
        <h3 className="text-lg font-semibold mb-4">My Active Bets</h3>
        <ActiveBets />
      </div>
    </div>
  )
} 