import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon } from 'lucide-react'

interface LeagueLeaderboardProps {
  leagueId: string
  showPotentialEarnings?: boolean
}

interface TeamStanding {
  id: string
  name: string
  logo_url?: string
  points: number
  rank: number
  form: string
  potential_earnings?: number
}

interface PrizeDistribution {
  position: number
  percentage: number
  description?: string
}

export function LeagueLeaderboard({ leagueId, showPotentialEarnings = true }: LeagueLeaderboardProps) {
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [prizeDistributions, setPrizeDistributions] = useState<PrizeDistribution[]>([])
  const [totalPrizePool, setTotalPrizePool] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isPrizeFinalized, setIsPrizeFinalized] = useState<boolean>(false)
  
  useEffect(() => {
    fetchLeagueData()
    fetchStandings()
  }, [leagueId])
  
  const fetchLeagueData = async () => {
    try {
      // Get league prize info
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('total_prize, additional_prize_amount, prize_distribution_finalized')
        .eq('id', leagueId)
        .single()
      
      if (leagueError) throw leagueError
      
      if (leagueData) {
        const totalPrize = (leagueData.total_prize || 0) + (leagueData.additional_prize_amount || 0)
        setTotalPrizePool(totalPrize)
        setIsPrizeFinalized(leagueData.prize_distribution_finalized || false)
      }
      
      // Get prize distribution
      const { data: distributionData, error: distributionError } = await supabase
        .from('league_prize_distribution')
        .select('*')
        .eq('league_id', leagueId)
        .order('position', { ascending: true })
      
      if (distributionError) throw distributionError
      
      if (distributionData && distributionData.length > 0) {
        setPrizeDistributions(distributionData)
      } else {
        // If no custom distribution, fetch default template
        const { data: templateData, error: templateError } = await supabase
          .from('prize_distribution_templates')
          .select('*')
          .eq('is_default', true)
          .single()
        
        if (templateError) throw templateError
        
        if (templateData) {
          const positions = Array.isArray(templateData.positions) 
            ? templateData.positions 
            : JSON.parse(templateData.positions)
          
          setPrizeDistributions(positions)
        }
      }
    } catch (error) {
      console.error('Error fetching league data:', error)
    }
  }
  
  const fetchStandings = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch actual standings from your database
      // For now, we'll simulate standings data
      
      // This is a placeholder - replace with actual data fetching logic
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, logo_url')
        .eq('league_id', leagueId)
      
      if (teamsError) throw teamsError
      
      if (teamsData) {
        // Simulate standings with random points
        const simulatedStandings = teamsData.map((team, index) => {
          const points = Math.floor(Math.random() * 100)
          return {
            ...team,
            points,
            rank: 0, // Will be calculated below
            form: generateRandomForm()
          }
        })
        
        // Sort by points (descending) and assign ranks
        const sortedStandings = simulatedStandings
          .sort((a, b) => b.points - a.points)
          .map((team, index) => ({
            ...team,
            rank: index + 1
          }))
        
        setStandings(sortedStandings)
      }
    } catch (error) {
      console.error('Error fetching standings:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Calculate potential earnings based on current position and prize distribution
  useEffect(() => {
    if (standings.length > 0 && prizeDistributions.length > 0 && totalPrizePool > 0) {
      const standingsWithEarnings = standings.map(team => {
        const distribution = prizeDistributions.find(dist => dist.position === team.rank)
        const potentialEarnings = distribution 
          ? (distribution.percentage / 100) * totalPrizePool 
          : 0
        
        return {
          ...team,
          potential_earnings: potentialEarnings
        }
      })
      
      setStandings(standingsWithEarnings)
    }
  }, [prizeDistributions, totalPrizePool])
  
  const generateRandomForm = () => {
    const results = ['W', 'D', 'L']
    return Array.from({ length: 5 }, () => results[Math.floor(Math.random() * results.length)]).join('')
  }
  
  const getFormBadge = (result: string) => {
    switch (result) {
      case 'W':
        return <Badge className="bg-green-500">W</Badge>
      case 'D':
        return <Badge className="bg-yellow-500">D</Badge>
      case 'L':
        return <Badge className="bg-red-500">L</Badge>
      default:
        return null
    }
  }
  
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>League Standings</CardTitle>
          <CardDescription>Loading standings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[50px] ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>League Standings</CardTitle>
            <CardDescription>Current team rankings and points</CardDescription>
          </div>
          {showPotentialEarnings && totalPrizePool > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <InfoIcon className="h-4 w-4 mr-1" />
                    Prize Pool: {formatNaira(totalPrizePool)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total prize pool amount to be distributed based on final standings</p>
                  {!isPrizeFinalized && <p className="text-yellow-500 text-xs mt-1">Prize distribution not yet finalized</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Pos</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-center">Form</TableHead>
              {showPotentialEarnings && totalPrizePool > 0 && (
                <TableHead className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-end w-full">
                        <span>Potential Earnings</span>
                        <InfoIcon className="h-4 w-4 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Estimated earnings based on current position</p>
                        {!isPrizeFinalized && <p className="text-yellow-500 text-xs mt-1">Subject to change</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {team.logo_url && (
                      <img 
                        src={team.logo_url} 
                        alt={team.name} 
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    )}
                    <span>{team.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{team.points}</TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-1">
                    {team.form.split('').map((result, index) => (
                      <span key={index}>{getFormBadge(result)}</span>
                    ))}
                  </div>
                </TableCell>
                {showPotentialEarnings && totalPrizePool > 0 && (
                  <TableCell className="text-right font-medium">
                    {team.potential_earnings && team.potential_earnings > 0 
                      ? formatNaira(team.potential_earnings)
                      : '-'}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {showPotentialEarnings && totalPrizePool > 0 && !isPrizeFinalized && (
          <p className="text-xs text-muted-foreground mt-4 italic">
            * Potential earnings are estimates based on current standings and may change as the league progresses.
            Final prize distribution will be confirmed by the league owner.
          </p>
        )}
      </CardContent>
    </Card>
  )
} 