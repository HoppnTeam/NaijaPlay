'use client'

import { useState } from 'react'
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

type CreateLeagueDialogProps = {
  isOpen: boolean
  onClose: () => void
}

export function CreateLeagueDialog({ isOpen, onClose }: CreateLeagueDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('NPFL')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClientComponentClient()

  const handleCreateLeague = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('leagues')
      .insert({ name, type })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create league. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "League created successfully.",
      })
      onClose()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New League</DialogTitle>
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
          <Button onClick={handleCreateLeague} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create League'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

