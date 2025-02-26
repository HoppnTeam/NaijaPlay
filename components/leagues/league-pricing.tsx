'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaguePricingProps {
  onSelectTier: (tierId: string) => void
  selectedTierId?: string
}

interface PricingTier {
  id: string
  name: string
  description: string
  price: number
  features: {
    max_teams: number
    advanced_stats: boolean
    custom_scoring: boolean
    priority_support: boolean
  }
}

export function LeaguePricing({ onSelectTier, selectedTierId }: LeaguePricingProps) {
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const { data, error } = await supabase
          .from('league_pricing')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true })

        if (error) throw error
        setTiers(data || [])
        
        // Auto-select the first tier if none is selected
        if (data && data.length > 0 && !selectedTierId) {
          onSelectTier(data[0].id)
        }
      } catch (error) {
        console.error('Error fetching pricing tiers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTiers()
  }, [supabase, onSelectTier, selectedTierId])

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium">Choose a League Tier</h3>
        <p className="text-sm text-muted-foreground">
          Select the tier that best fits your league needs
        </p>
      </div>

      <RadioGroup 
        value={selectedTierId} 
        onValueChange={onSelectTier}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {tiers.map((tier) => (
          <div key={tier.id} className="relative">
            <RadioGroupItem
              value={tier.id}
              id={tier.id}
              className="sr-only"
            />
            <Label
              htmlFor={tier.id}
              className="cursor-pointer"
            >
              <Card className={cn(
                "h-full transition-all",
                selectedTierId === tier.id 
                  ? "border-primary shadow-md" 
                  : "hover:border-primary/50"
              )}>
                {selectedTierId === tier.id && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    {tier.price === 0 ? 'Free' : formatNaira(tier.price)}
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Up to {tier.features.max_teams} teams
                    </li>
                    <li className="flex items-center">
                      {tier.features.advanced_stats ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <span className="mr-2 h-4 w-4 block" />
                      )}
                      {tier.features.advanced_stats ? 'Advanced statistics' : 'Basic statistics'}
                    </li>
                    <li className="flex items-center">
                      {tier.features.custom_scoring ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <span className="mr-2 h-4 w-4 block" />
                      )}
                      {tier.features.custom_scoring ? 'Custom scoring rules' : 'Standard scoring rules'}
                    </li>
                    <li className="flex items-center">
                      {tier.features.priority_support ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <span className="mr-2 h-4 w-4 block" />
                      )}
                      {tier.features.priority_support ? 'Priority support' : 'Standard support'}
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={selectedTierId === tier.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => onSelectTier(tier.id)}
                  >
                    {selectedTierId === tier.id ? 'Selected' : 'Select'}
                  </Button>
                </CardFooter>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
} 