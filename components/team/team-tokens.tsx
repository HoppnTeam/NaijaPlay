import { Coins } from 'lucide-react'

interface TeamTokensProps {
  balance: number
}

export function TeamTokens({ balance }: TeamTokensProps) {
  return (
    <div className="flex items-center justify-between text-sm mt-1">
      <span className="text-muted-foreground flex items-center gap-1">
        <Coins className="h-4 w-4" />
        Tokens:
      </span>
      <span className="font-medium">{balance}</span>
    </div>
  )
} 