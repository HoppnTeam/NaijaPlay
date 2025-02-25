interface TeamBudgetDisplayProps {
  budget: number
}

export function TeamBudgetDisplay({ budget }: TeamBudgetDisplayProps) {
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-muted-foreground">Budget:</div>
      <div className="font-medium">{formatNaira(budget)}</div>
    </div>
  )
} 