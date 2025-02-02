'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function CreateLeagueForm() {
  const [name, setName] = useState('')
  const [type, setType] = useState<'NPFL' | 'EPL'>('NPFL')
  const [maxTeams, setMaxTeams] = useState(20)
  const [entryFee, setEntryFee] = useState(5000)
  const [totalPrize, setTotalPrize] = useState(1000000)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate dates
      if (!startDate || !endDate) {
        toast({
          title: "Error",
          description: "Please select both start and end dates.",
          variant: "destructive",
        })
        return
      }

      if (startDate >= endDate) {
        toast({
          title: "Error",
          description: "End date must be after start date.",
          variant: "destructive",
        })
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a league.",
          variant: "destructive",
        })
        return
      }

      // Create the league
      const { data, error } = await supabase
        .from('leagues')
        .insert({
          name,
          type,
          max_teams: maxTeams,
          entry_fee: entryFee,
          total_prize: totalPrize,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'upcoming',
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating league:', error)
        toast({
          title: "Error",
          description: "Failed to create league. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Create league settings with default values
      const { error: settingsError } = await supabase
        .from('league_settings')
        .insert({
          league_id: data.id,
          points_per_goal: 4,
          points_per_assist: 3,
          points_per_clean_sheet: 4,
          points_per_penalty_save: 5,
          points_per_penalty_miss: -2,
          points_per_yellow_card: -1,
          points_per_red_card: -3,
          points_per_own_goal: -2,
          points_per_save: 0.5,
          points_per_goal_conceded: -1
        })

      if (settingsError) {
        console.error('Error creating league settings:', settingsError)
        // Don't show this error to the user since the league was created successfully
      }

      toast({
        title: "Success",
        description: "League created successfully!",
      })

      router.push(`/dashboard/leagues/${data.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">League Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>League Type</Label>
        <RadioGroup value={type} onValueChange={(value: 'NPFL' | 'EPL') => setType(value)} className="mt-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="NPFL" id="npfl" />
            <Label htmlFor="npfl">NPFL (Nigerian Professional Football League)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="EPL" id="epl" />
            <Label htmlFor="epl">EPL (English Premier League)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxTeams">Maximum Teams</Label>
          <Input
            id="maxTeams"
            type="number"
            min={2}
            max={50}
            value={maxTeams}
            onChange={(e) => setMaxTeams(parseInt(e.target.value))}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="entryFee">Entry Fee (₦)</Label>
          <Input
            id="entryFee"
            type="number"
            min={0}
            value={entryFee}
            onChange={(e) => setEntryFee(parseInt(e.target.value))}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="totalPrize">Total Prize (₦)</Label>
          <Input
            id="totalPrize"
            type="number"
            min={0}
            value={totalPrize}
            onChange={(e) => setTotalPrize(parseInt(e.target.value))}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full mt-1 justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full mt-1 justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create League'}
      </Button>
    </form>
  )
}

