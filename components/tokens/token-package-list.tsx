import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2Icon, CoinsIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PurchaseConfirmationDialog } from './purchase-confirmation-dialog'

interface TokenPackage {
  id: string
  name: string
  description: string
  token_amount: number
  price: number
  is_active: boolean
}

interface Team {
  id: string
  name: string
  budget: number
}

interface TokenPackageListProps {
  packages: TokenPackage[]
}

export function TokenPackageList({ packages }: TokenPackageListProps) {
  const router = useRouter()
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean
    package: TokenPackage | null
  }>({
    isOpen: false,
    package: null
  })

  const handlePurchaseClick = (tokenPackage: TokenPackage) => {
    if (!selectedTeam) {
      toast.error('Please select a team first')
      return
    }

    setConfirmationDialog({
      isOpen: true,
      package: tokenPackage
    })
  }

  const handlePurchaseConfirm = async () => {
    if (!confirmationDialog.package || !selectedTeam) return

    try {
      setIsLoading(confirmationDialog.package.id)
      
      const response = await fetch('/api/tokens/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: confirmationDialog.package.id,
          teamId: selectedTeam.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit exceeded
          const resetDate = new Date(data.reset)
          const minutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000)
          throw new Error(`Rate limit exceeded. Please try again in ${minutes} minutes.`)
        }
        throw new Error(data.error || 'Failed to initiate purchase')
      }

      // Redirect to payment page when Paystack is implemented
      // window.location.href = data.payment_url
      
      // For now, show success message
      toast.success('Purchase initiated successfully')
      router.refresh()

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process purchase')
      console.error('Purchase error:', error)
    } finally {
      setIsLoading(null)
      setConfirmationDialog({ isOpen: false, package: null })
    }
  }

  // Subscribe to team selection changes
  const handleTeamChange = (teamId: string, team: Team) => {
    setSelectedTeamId(teamId)
    setSelectedTeam(team)
  }

  // Subscribe to the team selection event
  if (typeof window !== 'undefined') {
    window.addEventListener('teamSelected', ((e: CustomEvent<{ teamId: string, team: Team }>) => {
      handleTeamChange(e.detail.teamId, e.detail.team)
    }) as EventListener)
  }

  if (!packages.length) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No token packages available</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={!pkg.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CoinsIcon className="h-5 w-5 text-yellow-500" />
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pkg.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatCurrency(pkg.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pkg.token_amount}M tokens
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  className="w-full"
                  disabled={!pkg.is_active || isLoading === pkg.id || !selectedTeamId}
                  onClick={() => handlePurchaseClick(pkg)}
                >
                  {isLoading === pkg.id ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Purchase Package'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {confirmationDialog.package && selectedTeam && (
        <PurchaseConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          onClose={() => setConfirmationDialog({ isOpen: false, package: null })}
          onConfirm={handlePurchaseConfirm}
          package={confirmationDialog.package}
          team={selectedTeam}
          isLoading={isLoading === confirmationDialog.package.id}
        />
      )}
    </>
  )
} 