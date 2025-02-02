import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Team {
  id: string
  name: string
  budget: number
}

interface TeamSelectorProps {
  teams: Team[]
}

export function TeamSelector({ teams }: TeamSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const handleSelect = (team: Team) => {
    setSelectedTeam(team)
    setOpen(false)

    // Dispatch custom event with full team object
    const event = new CustomEvent('teamSelected', {
      detail: { 
        teamId: team.id,
        team: team
      }
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTeam ? selectedTeam.name : "Select a team..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search team..." />
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              {teams.map((team) => (
                <CommandItem
                  key={team.id}
                  value={team.name}
                  onSelect={() => handleSelect(team)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTeam?.id === team.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex justify-between w-full">
                    <span>{team.name}</span>
                    <span className="text-muted-foreground">
                      Current Budget: ₦{(team.budget / 1_000_000).toFixed(1)}M
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTeam && (
        <div className="rounded-lg border p-4">
          <div className="space-y-2">
            <h4 className="font-semibold">{selectedTeam.name}</h4>
            <div className="text-sm text-muted-foreground">
              <p>Current Budget: ₦{(selectedTeam.budget / 1_000_000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 