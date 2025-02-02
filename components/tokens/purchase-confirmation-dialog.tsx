import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CoinsIcon, AlertTriangleIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface PurchaseConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  package: {
    name: string
    description: string
    token_amount: number
    price: number
  }
  team: {
    name: string
    budget: number
  }
  isLoading?: boolean
}

export function PurchaseConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  package: tokenPackage,
  team,
  isLoading
}: PurchaseConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CoinsIcon className="h-5 w-5 text-yellow-500" />
            Confirm Token Purchase
          </DialogTitle>
          <DialogDescription>
            Please review your token purchase details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Package Details</h4>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{tokenPackage.name}</span>
                <span className="text-sm font-bold">
                  {formatCurrency(tokenPackage.price)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {tokenPackage.description}
              </p>
              <div className="text-sm text-muted-foreground">
                Amount: {tokenPackage.token_amount}M tokens
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Team Details</h4>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{team.name}</span>
                <span className="text-sm text-muted-foreground">
                  Current Budget: {formatCurrency(team.budget)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                New Budget: {formatCurrency(team.budget + (tokenPackage.token_amount * 1_000_000))}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Please Note:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                  <li>Token purchases are non-refundable</li>
                  <li>Tokens can only be used in the selected team</li>
                  <li>Purchase will be processed via Paystack</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm Purchase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 