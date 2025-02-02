'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TeamList } from '@/components/admin/team-list'

export default function AdminTeams() {
  const [searchTerm, setSearchTerm] = useState('')
  const [leagueFilter, setLeagueFilter] = useState('all')

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleLeagueFilter = (value: string) => {
    setLeagueFilter(value)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team Management</h1>

      <div className="flex space-x-4">
        <Input
          placeholder="Search teams..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-sm"
        />
        <Select value={leagueFilter} onValueChange={handleLeagueFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by league" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leagues</SelectItem>
            <SelectItem value="NPFL">NPFL</SelectItem>
            <SelectItem value="EPL">EPL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TeamList searchTerm={searchTerm} leagueFilter={leagueFilter} />
    </div>
  )
}

