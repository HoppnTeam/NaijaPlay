"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

const formSchema = z.object({
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(Number(val)), {
      message: "Amount must be a number",
    })
    .refine((val) => Number(val) >= 1000, {
      message: "Minimum withdrawal amount is ₦1,000",
    })
    .refine((val) => Number(val) <= 500000, {
      message: "Maximum withdrawal amount is ₦500,000",
    }),
  bankName: z.string().min(1, { message: "Bank name is required" }),
  accountNumber: z
    .string()
    .min(10, { message: "Account number must be 10 digits" })
    .max(10, { message: "Account number must be 10 digits" })
    .refine((val) => /^\d+$/.test(val), {
      message: "Account number must contain only digits",
    }),
  accountName: z.string().min(1, { message: "Account name is required" }),
  note: z.string().optional(),
})

const bankOptions = [
  { value: "access", label: "Access Bank" },
  { value: "gtb", label: "Guaranty Trust Bank" },
  { value: "first", label: "First Bank" },
  { value: "zenith", label: "Zenith Bank" },
  { value: "uba", label: "United Bank for Africa" },
  { value: "stanbic", label: "Stanbic IBTC" },
  { value: "sterling", label: "Sterling Bank" },
  { value: "union", label: "Union Bank" },
  { value: "wema", label: "Wema Bank" },
  { value: "fcmb", label: "FCMB" },
  { value: "fidelity", label: "Fidelity Bank" },
  { value: "ecobank", label: "Ecobank" },
  { value: "keystone", label: "Keystone Bank" },
  { value: "polaris", label: "Polaris Bank" },
  { value: "providus", label: "Providus Bank" },
]

interface WithdrawalFormProps {
  userBalance: number
  onSuccess?: () => void
}

export function WithdrawalForm({ userBalance, onSuccess }: WithdrawalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
      note: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (Number(values.amount) > userBalance) {
      form.setError("amount", {
        type: "manual",
        message: "Insufficient balance",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Submit withdrawal request
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(values.amount),
          bankName: values.bankName,
          accountNumber: values.accountNumber,
          accountName: values.accountName,
          note: values.note,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to process withdrawal request")
      }
      
      toast.success("Withdrawal request submitted successfully", {
        description: "Your request is being processed and will be completed within 24 hours.",
      })
      
      form.reset()
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast.error("Failed to process withdrawal", {
        description: error instanceof Error ? error.message : "Please try again later",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-muted text-sm sm:text-base">
        <InfoIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        <AlertTitle>Withdrawal Information</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 space-y-1 sm:space-y-2 mt-2">
            <li>Minimum withdrawal amount: ₦1,000</li>
            <li>Maximum withdrawal amount: ₦500,000</li>
            <li>Withdrawals are processed within 24 hours</li>
            <li>Ensure your bank details are correct</li>
          </ul>
        </AlertDescription>
      </Alert>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Amount (₦)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter amount"
                    type="number"
                    className="h-10 sm:h-11 text-base"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Available balance: ₦{userBalance.toLocaleString()}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Bank</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 sm:h-11 text-base">
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bankOptions.map((bank) => (
                      <SelectItem key={bank.value} value={bank.value} className="text-sm sm:text-base">
                        {bank.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Account Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="10-digit account number"
                      maxLength={10}
                      className="h-10 sm:h-11 text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Account Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter account name"
                      className="h-10 sm:h-11 text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Note (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any additional information"
                    className="resize-none min-h-[80px] sm:min-h-[100px] text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full h-11 sm:h-12 text-base mt-2 sm:mt-4" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit Withdrawal Request"}
          </Button>
        </form>
      </Form>
    </div>
  )
} 