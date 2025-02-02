'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface TokenTransaction {
  id: string
  created_at: string
  amount: number
  type: 'purchase' | 'spend'
  description: string
}

export function TokenHistory() {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('token_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error

        setTransactions(data || [])
      } catch (error) {
        console.error('Error fetching token transactions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No transactions yet
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              {new Date(transaction.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                transaction.type === 'purchase' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {transaction.type === 'purchase' ? 'Purchase' : 'Spend'}
              </span>
            </TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell className="text-right">
              <span className={transaction.type === 'purchase' ? 'text-green-600' : 'text-red-600'}>
                {transaction.type === 'purchase' ? '+' : '-'}{transaction.amount}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 