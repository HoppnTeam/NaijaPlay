'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LeagueList } from '@/components/admin/league-list'
import { CreateLeagueDialog } from '@/components/admin/create-league-dialog'

export default function AdminLeagues() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isCreateLeagueOpen, setIsCreateLeagueOpen] = useState(false)

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">League Management</h1>
        <Button onClick={() => setIsCreateLeagueOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create League
        </Button>
      </div>

      <div className="flex space-x-4">
        <Input
          placeholder="Search leagues..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={handleTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="NPFL">NPFL</SelectItem>
            <SelectItem value="EPL">EPL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <LeagueList searchTerm={searchTerm} typeFilter={typeFilter} />

      <CreateLeagueDialog
        isOpen={isCreateLeagueOpen}
        onClose={() => setIsCreateLeagueOpen(false)}
      />
    </div>
  )
}

