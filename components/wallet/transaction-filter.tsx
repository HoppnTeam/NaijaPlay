"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, Filter } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const transactionTypes = [
  { label: "All Types", value: "" },
  { label: "Deposit", value: "credit" },
  { label: "Withdrawal", value: "debit" },
  { label: "Transfer In", value: "transfer_in" },
  { label: "Transfer Out", value: "transfer_out" },
]

const transactionStatuses = [
  { label: "All Statuses", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
]

const formSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional(),
})

export function TransactionFilter() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize form with current URL parameters
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: searchParams.get("type") || "",
      status: searchParams.get("status") || "",
      startDate: searchParams.get("startDate") 
        ? new Date(searchParams.get("startDate") as string) 
        : undefined,
      endDate: searchParams.get("endDate") 
        ? new Date(searchParams.get("endDate") as string) 
        : undefined,
      minAmount: searchParams.get("minAmount") || "",
      maxAmount: searchParams.get("maxAmount") || "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Create new URLSearchParams
    const params = new URLSearchParams()
    
    // Add form values to params if they exist
    if (values.type) params.set("type", values.type)
    if (values.status) params.set("status", values.status)
    if (values.startDate) params.set("startDate", values.startDate.toISOString().split('T')[0])
    if (values.endDate) params.set("endDate", values.endDate.toISOString().split('T')[0])
    if (values.minAmount) params.set("minAmount", values.minAmount)
    if (values.maxAmount) params.set("maxAmount", values.maxAmount)
    
    // Reset page to 1 when filters change
    params.set("page", "1")
    
    // Update URL with new params
    router.push(`/dashboard/wallet/transactions?${params.toString()}`)
    
    // Close dialog
    setOpen(false)
  }
  
  function resetFilters() {
    form.reset({
      type: "",
      status: "",
      startDate: undefined,
      endDate: undefined,
      minAmount: "",
      maxAmount: "",
    })
    
    router.push("/dashboard/wallet/transactions")
    setOpen(false)
  }

  // Check if any filters are applied
  const hasFilters = searchParams.get("type") || 
                    searchParams.get("status") || 
                    searchParams.get("startDate") || 
                    searchParams.get("endDate") || 
                    searchParams.get("minAmount") || 
                    searchParams.get("maxAmount")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 sm:h-10 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
        >
          <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Filter</span>
          {hasFilters && (
            <span className="inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-[10px] sm:text-xs text-primary-foreground">
              ✓
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-4 sm:p-6">
        <DialogHeader className="mb-4 sm:mb-6">
          <DialogTitle className="text-lg sm:text-xl">Filter Transactions</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Apply filters to find specific transactions in your history.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs sm:text-sm">Transaction Type</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "h-9 sm:h-10 text-xs sm:text-sm justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? transactionTypes.find(
                                  (type) => type.value === field.value
                                )?.label
                              : "Select type"}
                            <ChevronsUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Search type..." className="h-9 sm:h-10 text-xs sm:text-sm" />
                          <CommandEmpty className="text-xs sm:text-sm py-2 sm:py-3">No type found.</CommandEmpty>
                          <CommandGroup>
                            {transactionTypes.map((type) => (
                              <CommandItem
                                value={type.label}
                                key={type.value}
                                onSelect={() => {
                                  form.setValue("type", type.value)
                                }}
                                className="text-xs sm:text-sm py-2 sm:py-3"
                              >
                                <Check
                                  className={cn(
                                    "mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4",
                                    type.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {type.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs sm:text-sm">Status</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "h-9 sm:h-10 text-xs sm:text-sm justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? transactionStatuses.find(
                                  (status) => status.value === field.value
                                )?.label
                              : "Select status"}
                            <ChevronsUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Search status..." className="h-9 sm:h-10 text-xs sm:text-sm" />
                          <CommandEmpty className="text-xs sm:text-sm py-2 sm:py-3">No status found.</CommandEmpty>
                          <CommandGroup>
                            {transactionStatuses.map((status) => (
                              <CommandItem
                                value={status.label}
                                key={status.value}
                                onSelect={() => {
                                  form.setValue("status", status.value)
                                }}
                                className="text-xs sm:text-sm py-2 sm:py-3"
                              >
                                <Check
                                  className={cn(
                                    "mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4",
                                    status.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {status.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs sm:text-sm">Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-9 sm:h-10 text-xs sm:text-sm pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || (form.getValues("endDate") ? date > form.getValues("endDate")! : false)
                            }
                            initialFocus
                            className="text-xs sm:text-sm"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs sm:text-sm">End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-9 sm:h-10 text-xs sm:text-sm pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || (form.getValues("startDate") ? date < form.getValues("startDate")! : false)
                            }
                            initialFocus
                            className="text-xs sm:text-sm"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="minAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Min Amount (₦)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-9 sm:h-10 text-xs sm:text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Max Amount (₦)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Any"
                          className="h-9 sm:h-10 text-xs sm:text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto order-2 sm:order-1"
              >
                Reset Filters
              </Button>
              <Button 
                type="submit"
                className="h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto order-1 sm:order-2"
              >
                Apply Filters
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 