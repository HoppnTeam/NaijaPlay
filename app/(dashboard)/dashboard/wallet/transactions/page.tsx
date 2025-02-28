import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Filter } from 'lucide-react'
import Link from 'next/link'
import { TransactionFilter } from '@/components/wallet/transaction-filter'

interface Transaction {
  id: string
  type: string
  amount: number
  created_at: string
  status: 'completed' | 'pending' | 'failed'
  description?: string
  metadata?: any
  reference?: string
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  
  // Parse query parameters
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const pageSize = 10
  const type = typeof searchParams.type === 'string' ? searchParams.type : undefined
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined
  const startDate = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined
  const endDate = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined
  const minAmount = typeof searchParams.minAmount === 'string' ? searchParams.minAmount : undefined
  const maxAmount = typeof searchParams.maxAmount === 'string' ? searchParams.maxAmount : undefined
  
  // Build query
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  // Apply filters if provided
  if (type) {
    query = query.eq('type', type)
  }
  
  if (status) {
    query = query.eq('status', status)
  }
  
  if (startDate) {
    query = query.gte('created_at', `${startDate}T00:00:00`)
  }
  
  if (endDate) {
    query = query.lte('created_at', `${endDate}T23:59:59`)
  }
  
  if (minAmount) {
    query = query.gte('amount', minAmount)
  }
  
  if (maxAmount) {
    query = query.lte('amount', maxAmount)
  }
  
  // Add pagination
  const from = (page - 1) * pageSize
  const to = page * pageSize - 1
  query = query.range(from, to)
  
  // Execute query
  const { data: transactions, error: transactionsError, count } = await query
  
  const totalPages = count ? Math.ceil(count / pageSize) : 0
  
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</span>
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span>
      case 'failed':
        return <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">{status}</span>
    }
  }
  
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'credit':
        return <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Deposit</span>
      case 'debit':
        return <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Withdrawal</span>
      case 'transfer_in':
        return <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">Transfer In</span>
      case 'transfer_out':
        return <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">Transfer Out</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">{type}</span>
    }
  }
  
  // Check if any filters are applied
  const hasFilters = type || status || startDate || endDate || minAmount || maxAmount
  
  // Function to generate CSV data for export
  const generateCsvData = () => {
    if (!transactions || transactions.length === 0) return ''
    
    const headers = ['Date', 'Description', 'Type', 'Reference', 'Status', 'Amount']
    const rows = transactions.map(t => [
      new Date(t.created_at).toISOString().split('T')[0],
      t.description || (
        t.type === 'credit' ? 'Wallet Deposit' :
        t.type === 'debit' ? 'Wallet Withdrawal' :
        t.type === 'transfer_in' ? 'Transfer In' :
        t.type === 'transfer_out' ? 'Transfer Out' : 
        'Transaction'
      ),
      t.type,
      t.reference || '-',
      t.status,
      t.amount.toString()
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  return (
    <div className="container mx-auto py-6 sm:py-10 space-y-6 sm:space-y-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="h-9 w-9 sm:h-10 sm:w-10">
            <Link href="/dashboard/wallet">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              View and filter your wallet transactions
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <TransactionFilter />
          
          {transactions && transactions.length > 0 && (
            <Button variant="outline" size="sm" asChild className="h-9 sm:h-10 text-xs sm:text-sm">
              <a 
                href={`data:text/csv;charset=utf-8,${encodeURIComponent(generateCsvData())}`}
                download="transactions.csv"
              >
                <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Export CSV
              </a>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">All Transactions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {count ? `Showing ${Math.min((page - 1) * pageSize + 1, count)} to ${Math.min(page * pageSize, count)} of ${count} transactions` : 'No transactions found'}
            {hasFilters && ' (filtered)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 py-0 sm:py-2">
          {transactionsError ? (
            <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">
              Failed to load transactions
            </p>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="hidden sm:table-header-group">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Description</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Reference</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction: Transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50 block sm:table-row">
                        <td className="py-3 px-4 text-xs sm:text-sm block sm:table-cell">
                          <span className="sm:hidden font-medium mr-2">Date:</span>
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="py-2 px-4 block sm:table-cell sm:py-3">
                          <span className="sm:hidden font-medium mr-2">Description:</span>
                          <span className="text-sm">
                            {transaction.description || (
                              transaction.type === 'credit' ? 'Wallet Deposit' :
                              transaction.type === 'debit' ? 'Wallet Withdrawal' :
                              transaction.type === 'transfer_in' ? 'Transfer In' :
                              transaction.type === 'transfer_out' ? 'Transfer Out' : 
                              'Transaction'
                            )}
                          </span>
                        </td>
                        <td className="py-2 px-4 block sm:table-cell sm:py-3">
                          <span className="sm:hidden font-medium mr-2">Type:</span>
                          {getTransactionTypeLabel(transaction.type)}
                        </td>
                        <td className="py-2 px-4 text-xs sm:text-sm font-mono block sm:table-cell sm:py-3">
                          <span className="sm:hidden font-medium mr-2 font-sans">Reference:</span>
                          {transaction.reference ? transaction.reference.substring(0, 8) + '...' : '-'}
                        </td>
                        <td className="py-2 px-4 block sm:table-cell sm:py-3">
                          <span className="sm:hidden font-medium mr-2">Status:</span>
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className={`py-2 px-4 text-right block sm:table-cell sm:py-3 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="sm:hidden font-medium mr-2 float-left text-foreground">Amount:</span>
                          <span className="text-sm sm:text-base font-medium">
                            {transaction.amount > 0 ? '+' : ''}{formatNaira(transaction.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 sm:px-0 py-2 sm:py-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      asChild
                      className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <Link
                        href={{
                          pathname: '/dashboard/wallet/transactions',
                          query: {
                            ...searchParams,
                            page: page > 1 ? page - 1 : 1,
                          },
                        }}
                      >
                        Previous
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      asChild
                      className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <Link
                        href={{
                          pathname: '/dashboard/wallet/transactions',
                          query: {
                            ...searchParams,
                            page: page < totalPages ? page + 1 : totalPages,
                          },
                        }}
                      >
                        Next
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {hasFilters 
                  ? 'No transactions match your filters' 
                  : 'No transactions found'}
              </p>
              {hasFilters ? (
                <Button asChild variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
                  <Link href="/dashboard/wallet/transactions">
                    Clear Filters
                  </Link>
                </Button>
              ) : (
                <Button asChild className="h-9 sm:h-10 text-xs sm:text-sm">
                  <Link href="/dashboard/wallet">
                    Go to Wallet
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 