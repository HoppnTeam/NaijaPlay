import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CoinsIcon } from 'lucide-react'

interface Purchase {
  id: string
  created_at: string
  payment_status: string
  amount_paid: number
  tokens_credited: number
  teams: {
    name: string
  }
  token_packages: {
    name: string
    token_amount: number
    price: number
  }
}

interface PurchaseHistoryProps {
  purchases: Purchase[]
}

export function PurchaseHistory({ purchases }: PurchaseHistoryProps) {
  if (!purchases.length) {
    return (
      <div className="text-center p-6">
        <CoinsIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-2 text-sm font-semibold">No Purchase History</h3>
        <p className="text-sm text-muted-foreground">
          Your token purchases will appear here
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Package</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((purchase) => (
          <TableRow key={purchase.id}>
            <TableCell className="whitespace-nowrap">
              {format(new Date(purchase.created_at), 'MMM d, yyyy')}
            </TableCell>
            <TableCell>{purchase.teams.name}</TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <span className="font-medium">
                  {purchase.token_packages.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  ₦{purchase.amount_paid.toLocaleString()}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  purchase.payment_status === 'completed'
                    ? 'success'
                    : purchase.payment_status === 'pending'
                    ? 'warning'
                    : 'destructive'
                }
              >
                {purchase.payment_status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 