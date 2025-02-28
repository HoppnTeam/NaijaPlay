'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loader2, CreditCard } from 'lucide-react'
import NairaSign from '@/components/icons/NairaSign'
import { z } from 'zod'

// Define the deposit amount options
const DEPOSIT_AMOUNTS = [1000, 2000, 5000, 10000, 20000]

// Validation schema for deposit amount
const depositSchema = z.object({
  amount: z.number()
    .min(500, 'Minimum deposit amount is ₦500')
    .max(500000, 'Maximum deposit amount is ₦500,000')
})

interface DepositFormProps {
  userBalance: number
}

export function DepositForm({ userBalance }: DepositFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Determine the final amount to deposit
    const depositAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0)
    
    try {
      // Validate the amount
      const result = depositSchema.safeParse({ amount: depositAmount })
      
      if (!result.success) {
        toast({
          title: "Invalid Amount",
          description: result.error.errors[0].message,
          variant: "destructive"
        })
        return
      }
      
      setIsLoading(true)
      
      // Call the deposit API
      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: depositAmount })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to process deposit')
      }
      
      const data = await response.json()
      
      // Redirect to payment URL if provided
      if (data.paymentUrl) {
        router.push(data.paymentUrl)
      } else {
        toast({
          title: "Deposit Initiated",
          description: "You will be redirected to complete your payment."
        })
      }
    } catch (error) {
      console.error('Deposit error:', error)
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount).replace('NGN', '₦')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div className="space-y-2 sm:space-y-3">
        <div className="text-sm sm:text-base font-medium">Select Amount</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {DEPOSIT_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant={selectedAmount === amount ? "default" : "outline"}
              onClick={() => handleAmountSelect(amount)}
              className="h-12 sm:h-14 text-sm sm:text-base py-2 px-3"
            >
              {formatNaira(amount)}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <div className="text-sm sm:text-base font-medium">Or Enter Custom Amount</div>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <NairaSign className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Enter amount"
            value={customAmount}
            onChange={handleCustomAmountChange}
            className="pl-9 h-12 sm:h-14 text-sm sm:text-base"
          />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Min: ₦500 | Max: ₦500,000
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-12 sm:h-14 text-sm sm:text-base mt-4 sm:mt-6" 
        disabled={isLoading || (!selectedAmount && !customAmount)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Proceed to Payment
          </>
        )}
      </Button>
    </form>
  )
} 