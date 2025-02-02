import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Player } from '@/lib/types'
import { PlayerDetailSkeleton } from './player-detail-skeleton'

export type PlayerDetailViewProps = {
  player: Player | null
  isOpen: boolean
  onClose: () => void
  onAddPlayer: () => void
  isAddDisabled: boolean
  isLoading: boolean
}

export function PlayerDetailView({ player, isOpen, onClose, onAddPlayer, isAddDisabled, isLoading }: PlayerDetailViewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {isLoading ? (
          <PlayerDetailSkeleton />
        ) : player ? (
          <>
            <DialogHeader>
              <DialogTitle>{player.name}</DialogTitle>
              <DialogDescription>
                {player.position} - {player.team}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Price</TableCell>
                    <TableCell>₦{player.current_price.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Minutes Played</TableCell>
                    <TableCell>{player.minutes_played}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Goals Scored</TableCell>
                    <TableCell>{player.goals_scored}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Assists</TableCell>
                    <TableCell>{player.assists}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Clean Sheets</TableCell>
                    <TableCell>{player.clean_sheets}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Goals Conceded</TableCell>
                    <TableCell>{player.goals_conceded}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Own Goals</TableCell>
                    <TableCell>{player.own_goals}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Penalties Saved</TableCell>
                    <TableCell>{player.penalties_saved}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Penalties Missed</TableCell>
                    <TableCell>{player.penalties_missed}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Yellow Cards</TableCell>
                    <TableCell>{player.yellow_cards}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Red Cards</TableCell>
                    <TableCell>{player.red_cards}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Saves</TableCell>
                    <TableCell>{player.saves}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bonus Points</TableCell>
                    <TableCell>{player.bonus}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button onClick={onClose} variant="outline">Close</Button>
              <Button onClick={onAddPlayer} disabled={isAddDisabled}>Add to Team</Button>
            </div>
          </>
        ) : (
          <p>No player data available</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

