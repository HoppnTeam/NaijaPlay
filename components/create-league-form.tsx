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
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { LeaguePricing } from "@/components/leagues/league-pricing"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function CreateLeagueForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'NPFL' | 'EPL'>('NPFL')
  const [maxTeams, setMaxTeams] = useState(20)
  const [entryFee, setEntryFee] = useState(5000)
  const [totalPrize, setTotalPrize] = useState(1000000)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'details' | 'pricing' | 'review'>('details')
  const [selectedTierId, setSelectedTierId] = useState<string>()
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
        setIsLoading(false)
        return
      }

      if (startDate >= endDate) {
        toast({
          title: "Error",
          description: "End date must be after start date.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Validate tier selection
      if (!selectedTierId) {
        toast({
          title: "Error",
          description: "Please select a league tier.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a league.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Get user email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      const email = profile?.email || user.email

      if (!email) {
        toast({
          title: "Error",
          description: "Unable to retrieve your email address.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Process payment or create free league
      const response = await fetch('/api/leagues/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId: selectedTierId,
          email,
          leagueName: name,
          leagueDescription: description,
          leagueType: type,
          maxTeams,
          entryFee,
          totalPrize,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process league creation')
      }

      // If it's a free tier, redirect to the league page
      if (data.free_tier) {
        toast({
          title: "Success",
          description: "League created successfully!",
        })
        router.push(`/dashboard/leagues/${data.league_id}`)
        return
      }

      // For paid tiers, redirect to payment page
      window.location.href = data.authorization_url

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 'details') {
      // Validate details before proceeding
      if (!name) {
        toast({
          title: "Error",
          description: "Please enter a league name.",
          variant: "destructive",
        })
        return
      }
      
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
      
      setCurrentStep('pricing')
    } else if (currentStep === 'pricing') {
      if (!selectedTierId) {
        toast({
          title: "Error",
          description: "Please select a league tier.",
          variant: "destructive",
        })
        return
      }
      
      setCurrentStep('review')
    }
  }

  const prevStep = () => {
    if (currentStep === 'pricing') {
      setCurrentStep('details')
    } else if (currentStep === 'review') {
      setCurrentStep('pricing')
    }
  }

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="details" 
            onClick={() => setCurrentStep('details')}
            disabled={isLoading}
          >
            League Details
          </TabsTrigger>
          <TabsTrigger 
            value="pricing" 
            onClick={() => setCurrentStep('pricing')}
            disabled={isLoading || !name || !startDate || !endDate}
          >
            Pricing Tier
          </TabsTrigger>
          <TabsTrigger 
            value="review" 
            onClick={() => setCurrentStep('review')}
            disabled={isLoading || !selectedTierId}
          >
            Review & Pay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              placeholder="Describe your league..."
              rows={3}
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

          <div className="flex justify-end">
            <Button type="button" onClick={nextStep}>
              Next: Choose Pricing
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6 mt-6">
          <LeaguePricing 
            onSelectTier={setSelectedTierId} 
            selectedTierId={selectedTierId}
          />

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button type="button" onClick={nextStep}>
              Next: Review
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Your League</CardTitle>
              <CardDescription>
                Please review your league details before proceeding to payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">League Name</h4>
                  <p className="text-muted-foreground">{name}</p>
                </div>
                <div>
                  <h4 className="font-medium">League Type</h4>
                  <p className="text-muted-foreground">{type}</p>
                </div>
                <div>
                  <h4 className="font-medium">Entry Fee</h4>
                  <p className="text-muted-foreground">{formatNaira(entryFee)}</p>
                </div>
                <div>
                  <h4 className="font-medium">Total Prize</h4>
                  <p className="text-muted-foreground">{formatNaira(totalPrize)}</p>
                </div>
                <div>
                  <h4 className="font-medium">Start Date</h4>
                  <p className="text-muted-foreground">
                    {startDate ? format(startDate, "PPP") : "Not set"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">End Date</h4>
                  <p className="text-muted-foreground">
                    {endDate ? format(endDate, "PPP") : "Not set"}
                  </p>
                </div>
              </div>

              {description && (
                <div>
                  <h4 className="font-medium">Description</h4>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Create League'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}

