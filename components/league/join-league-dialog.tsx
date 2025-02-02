'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import type { League } from '@/lib/types'

interface JoinLeagueDialogProps {
  league: League
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type RequirementStatus = 'pending' | 'success' | 'error'

interface Requirement {
  title: string
  description: string
  check: (userId: string) => Promise<boolean>
  status: RequirementStatus
  errorMessage?: string
}

export function JoinLeagueDialog({ league, isOpen, onClose, onSuccess }: JoinLeagueDialogProps) {
  const [step, setStep] = useState<'requirements' | 'payment' | 'processing'>('requirements')
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const supabase = createClientComponentClient()

  const createRequirements = (): Requirement[] => [
    {
      title: 'Team Creation',
      description: 'You must have created a fantasy team',
      status: 'pending',
      check: async (userId: string) => {
        const { data, error } = await supabase
          .from('teams')
          .select('id')
          .eq('user_id', userId)
          .single()
        
        if (error) {
          console.error('Error checking team:', error)
          return false
        }
        return !!data
      },
      errorMessage: 'Please create a team before joining a league'
    },
    {
      title: 'League Membership',
      description: 'You must not already be a member',
      status: 'pending',
      check: async (userId: string) => {
        const { count, error } = await supabase
          .from('league_members')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', league.id)
          .eq('user_id', userId)

        if (error) {
          console.error('Error checking membership:', error)
          return false
        }
        return count === 0
      },
      errorMessage: 'You are already a member of this league'
    },
    {
      title: 'League Capacity',
      description: `Maximum ${league.max_teams} teams allowed`,
      status: 'pending',
      check: async () => {
        const { count, error } = await supabase
          .from('league_members')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', league.id)

        if (error) {
          console.error('Error checking capacity:', error)
          return false
        }
        return count !== null && count < league.max_teams
      },
      errorMessage: 'League is already full'
    },
    {
      title: 'League Status',
      description: 'League must be open for registration',
      status: 'pending',
      check: async () => league.status === 'upcoming',
      errorMessage: 'League is not open for registration'
    }
  ]

  const [requirements, setRequirements] = useState<Requirement[]>(createRequirements())

  useEffect(() => {
    if (isOpen) {
      setRequirements(createRequirements())
      checkRequirements()
    } else {
      setAcceptedTerms(false)
      setStep('requirements')
    }
  }, [isOpen, league.id])

  const checkRequirements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to join a league",
          variant: "destructive",
        })
        onClose()
        return
      }

      setRequirements(prev => prev.map(req => ({ ...req, status: 'pending' as RequirementStatus })))

      const results = await Promise.all(
        requirements.map(async (req) => {
          try {
            const result = await req.check(user.id)
            return { 
              ...req, 
              status: result ? 'success' as RequirementStatus : 'error' as RequirementStatus 
            }
          } catch (error) {
            console.error(`Error checking requirement ${req.title}:`, error)
            return { ...req, status: 'error' as RequirementStatus }
          }
        })
      )

      setRequirements(results)

      // Show error toast if any requirement failed
      const failedRequirement = results.find(req => req.status === 'error')
      if (failedRequirement && failedRequirement.errorMessage) {
        toast({
          title: "Cannot Join League",
          description: failedRequirement.errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error checking requirements:', error)
      toast({
        title: "Error",
        description: "Failed to check league requirements",
        variant: "destructive",
      })
    }
  }

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      setStep('processing')
      // Here you would integrate with your payment provider (e.g., Paystack, Flutterwave)
      // For now, we'll simulate a payment
      await new Promise(resolve => setTimeout(resolve, 2000))

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get user's team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (teamError || !team) throw new Error('No team found')

      // Double check league capacity
      const { count: memberCount, error: countError } = await supabase
        .from('league_members')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', league.id)

      if (countError) throw new Error('Failed to check league capacity')
      if (memberCount && memberCount >= league.max_teams) {
        throw new Error('League is already full')
      }

      // Join the league
      const { error: joinError } = await supabase
        .from('league_members')
        .insert({
          league_id: league.id,
          user_id: user.id,
          team_id: team.id,
          total_points: 0,
          rank: null,
          gameweek_points: 0,
          joined_at: new Date().toISOString()
        })

      if (joinError) {
        if (joinError.code === '23505') {
          throw new Error('You are already a member of this league')
        }
        throw joinError
      }

      toast({
        title: "Success!",
        description: "You have successfully joined the league.",
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error joining league:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join league",
        variant: "destructive",
      })
      setStep('payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProceed = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      })
      return
    }

    // Check if all requirements are met
    const allRequirementsMet = requirements.every(req => req.status === 'success')
    if (!allRequirementsMet) {
      toast({
        title: "Error",
        description: "Please ensure all requirements are met before proceeding",
        variant: "destructive",
      })
      return
    }

    setStep('payment')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Join {league.name}</DialogTitle>
          <DialogDescription>
            Review the requirements and complete payment to join the league
          </DialogDescription>
        </DialogHeader>

        {step === 'requirements' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">League Requirements</h3>
              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {req.status === 'pending' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-0.5" />
                    ) : req.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                      {req.status === 'error' && req.errorMessage && (
                        <p className="text-sm text-red-500 mt-1">{req.errorMessage}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Important Information</h3>
              <ul className="space-y-2 text-sm">
                <li>• League starts on {new Date(league.start_date).toLocaleDateString()}</li>
                <li>• League ends on {new Date(league.end_date).toLocaleDateString()}</li>
                <li>• Total prize pool: ₦{league.total_prize.toLocaleString()}</li>
                <li>• Entry fee is non-refundable once the league starts</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                I accept the league rules and understand the entry fee is non-refundable once the league starts
              </Label>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Entry Fee</span>
                  <span>₦{league.entry_fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total</span>
                  <span>₦{league.entry_fee.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input placeholder="123" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-center">Processing your payment...</p>
          </div>
        )}

        <DialogFooter>
          {step === 'requirements' && (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleProceed} 
                disabled={!acceptedTerms || requirements.some(req => req.status !== 'success')}
              >
                Proceed to Payment
              </Button>
            </>
          )}
          {step === 'payment' && (
            <>
              <Button variant="outline" onClick={() => setStep('requirements')}>Back</Button>
              <Button onClick={handlePayment} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay ₦{league.entry_fee.toLocaleString()}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 