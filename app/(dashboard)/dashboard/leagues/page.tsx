'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Users, Calendar, Plus, Search } from 'lucide-react'
import Link from 'next/link'

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<any[]>([])
  const [myLeagues, setMyLeagues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<string>('desc')
  const [activeTab, setActiveTab] = useState<string>('all')
  
  useEffect(() => {
    fetchLeagues()
  }, [sortBy, sortOrder])
  
  const fetchLeagues = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch all leagues
      const { data: allLeagues, error: allLeaguesError } = await supabase
        .from('leagues')
        .select('*, teams(*)')
        .order(sortBy, { ascending: sortOrder === 'asc' })
      
      if (allLeaguesError) throw allLeaguesError
      
      setLeagues(allLeagues || [])
      
      // Fetch user's leagues if logged in
      if (user) {
        const { data: userLeagues, error: userLeaguesError } = await supabase
          .from('leagues')
          .select('*, teams(*)')
          .or(`owner_id.eq.${user.id},teams.user_id.eq.${user.id}`)
          .order(sortBy, { ascending: sortOrder === 'asc' })
        
        if (userLeaguesError) throw userLeaguesError
        
        setMyLeagues(userLeagues || [])
      }
    } catch (error) {
      console.error('Error fetching leagues:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-')
    setSortBy(field)
    setSortOrder(order)
  }
  
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  const filterLeagues = (leagueList: any[]) => {
    if (!searchQuery) return leagueList
    
    const query = searchQuery.toLowerCase()
    return leagueList.filter(league => 
      league.name.toLowerCase().includes(query) || 
      (league.description && league.description.toLowerCase().includes(query))
    )
  }
  
  const calculateTotalPrize = (league: any) => {
    const basePrize = league.total_prize || 0
    const additionalPrize = league.additional_prize_amount || 0
    return basePrize + additionalPrize
  }
  
  const renderLeagueCard = (league: any) => {
    const totalPrize = calculateTotalPrize(league)
    const hasPrize = totalPrize > 0
    const isPrizeFunded = league.prize_pool_funded
    const isDistributionFinalized = league.prize_distribution_finalized
    
    return (
      <Card key={league.id} className={`overflow-hidden ${hasPrize ? 'border-yellow-500 dark:border-yellow-700' : ''}`}>
        {hasPrize && (
          <div className="bg-yellow-500 dark:bg-yellow-700 text-white text-xs font-medium px-3 py-1 flex items-center justify-center">
            <Trophy className="h-3 w-3 mr-1" />
            Prize Pool: {formatNaira(totalPrize)}
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{league.name}</CardTitle>
              <CardDescription>{league.description || 'No description'}</CardDescription>
            </div>
            {league.entry_fee > 0 && (
              <Badge variant="outline" className="ml-2">
                Entry: {formatNaira(league.entry_fee)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{league.teams?.length || 0}/{league.max_teams}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{new Date(league.start_date).toLocaleDateString()}</span>
            </div>
            {hasPrize ? (
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                <span className="text-yellow-500 font-medium">{formatNaira(totalPrize)}</span>
              </div>
            ) : (
              <div className="flex items-center text-muted-foreground">
                <Trophy className="h-4 w-4 mr-1" />
                <span>No prize</span>
              </div>
            )}
          </div>
          
          {hasPrize && (
            <div className="mt-2 text-xs">
              {isPrizeFunded ? (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Prize pool funded
                </span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400">
                  Prize pool not yet funded
                </span>
              )}
              {isDistributionFinalized && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  • Distribution finalized
                </span>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/dashboard/leagues/${league.id}`}>
              View League
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leagues</h1>
            <p className="text-muted-foreground">Browse and join fantasy football leagues</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/leagues/create">
              <Plus className="mr-2 h-4 w-4" />
              Create League
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leagues..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select defaultValue="created_at-desc" onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest first</SelectItem>
                <SelectItem value="created_at-asc">Oldest first</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="total_prize-desc">Highest prize</SelectItem>
                <SelectItem value="start_date-asc">Starting soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Leagues</TabsTrigger>
            <TabsTrigger value="my">My Leagues</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="text-center py-10">Loading leagues...</div>
            ) : (
              <>
                {filterLeagues(leagues).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterLeagues(leagues).map(league => renderLeagueCard(league))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No leagues found</p>
                    {searchQuery && (
                      <Button variant="link" onClick={() => setSearchQuery('')}>
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="my" className="mt-6">
            {isLoading ? (
              <div className="text-center py-10">Loading leagues...</div>
            ) : (
              <>
                {filterLeagues(myLeagues).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterLeagues(myLeagues).map(league => renderLeagueCard(league))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">You haven't joined any leagues yet</p>
                    <Button variant="link" asChild>
                      <Link href="#all">Browse leagues</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

