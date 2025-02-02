'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

type League = {
  id: string
  name: string
  type: string
}

type EditLeagueDialogProps = {
  league: League | null
  isOpen: boolean
  onClose: () => void
  onLeagueUpdated: () => void
}

export function EditLeagueDialog({ league, isOpen, onClose, onLeagueUpdated }: EditLeagueDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (league) {
      setName(league.name)
      setType(league.type)
    }
  }, [league])

  const handleUpdateLeague = async () => {
    if (!league) return

    setIsLoading(true)
    const { error } = await supabase
      .from('leagues')
      .update({ name, type })
      .eq('id', league.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update league. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "League updated successfully.",
      })
      onLeagueUpdated()
      onClose()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit League</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name">League Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="type">League Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NPFL">NPFL</SelectItem>
                <SelectItem value="EPL">EPL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdateLeague} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update League'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

