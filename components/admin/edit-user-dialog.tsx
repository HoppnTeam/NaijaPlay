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

type User = {
  id: string
  email: string
  role: string
}

type EditUserDialogProps = {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onUserUpdated: () => void
}

export function EditUserDialog({ user, isOpen, onClose, onUserUpdated }: EditUserDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setRole(user.role)
    }
  }, [user])

  const handleUpdateUser = async () => {
    if (!user) return

    setIsLoading(true)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ email, role })
      .eq('id', user.id)

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "User updated successfully.",
      })
      onUserUpdated()
      onClose()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="role">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline<cut_off_point>
div>
        </div>
        <DialogFooter>
          <Button variant="outline
</cut_off_point>

" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdateUser} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

