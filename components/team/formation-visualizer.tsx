import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownRight, Shield, Swords } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface Player {
  id: string
  name: string
  position: string
  team: string
  current_price: number
  isSubstitute?: boolean
}

interface FormationVisualizerProps {
  open: boolean
  onClose: () => void
  players: Player[]
  formation: string
  onFormationChange: (formation: string) => void
  onTacticsChange?: (tactics: {
    playingStyle: keyof typeof PLAYING_STYLES
    mentality: typeof TEAM_MENTALITIES[number]
  }) => void
}

type Coordinate = [number, number]

interface PositionData {
  count: number
  coordinates: Coordinate[]
}

interface FormationData {
  name: string
  description: string
  positions: {
    [key: string]: PositionData
  }
}

const FORMATIONS: Record<string, FormationData> = {
  '4-4-2': {
    name: '4-4-2',
    description: 'Classic balanced formation',
    positions: {
      Defender: { count: 4, coordinates: [[25, 70], [25, 50], [25, 30], [25, 10]] },
      Midfielder: { count: 4, coordinates: [[45, 70], [45, 50], [45, 30], [45, 10]] },
      Forward: { count: 2, coordinates: [[65, 40], [65, 20]] }
    }
  },
  '4-3-3': {
    name: '4-3-3',
    description: 'Attacking formation with wide forwards',
    positions: {
      Defender: { count: 4, coordinates: [[25, 70], [25, 50], [25, 30], [25, 10]] },
      Midfielder: { count: 3, coordinates: [[45, 60], [45, 35], [45, 10]] },
      Forward: { count: 3, coordinates: [[65, 60], [65, 35], [65, 10]] }
    }
  },
  '3-5-2': {
    name: '3-5-2',
    description: 'Midfield control with wing-backs',
    positions: {
      Defender: { count: 3, coordinates: [[25, 60], [25, 35], [25, 10]] },
      Midfielder: { count: 5, coordinates: [[45, 80], [45, 60], [45, 35], [45, 10], [45, -10]] },
      Forward: { count: 2, coordinates: [[65, 40], [65, 20]] }
    }
  }
} as const

const PLAYING_STYLES = {
  'possession': {
    name: 'Possession',
    description: 'Control the game through ball possession',
    icon: <ArrowUpRight className="h-4 w-4" />,
    recommendations: [
      'Short passing',
      'High defensive line',
      'Patient build-up'
    ]
  },
  'counter-attack': {
    name: 'Counter Attack',
    description: 'Quick transitions from defense to attack',
    icon: <ArrowDownRight className="h-4 w-4" />,
    recommendations: [
      'Fast forwards',
      'Deep defensive line',
      'Direct passing'
    ]
  },
  'high-press': {
    name: 'High Press',
    description: 'Aggressive pressing in opponent\'s half',
    icon: <Swords className="h-4 w-4" />,
    recommendations: [
      'High stamina players',
      'Aggressive forwards',
      'Compact formation'
    ]
  },
  'defensive': {
    name: 'Defensive',
    description: 'Solid defense with calculated attacks',
    icon: <Shield className="h-4 w-4" />,
    recommendations: [
      'Strong defenders',
      'Defensive midfielders',
      'Set piece specialists'
    ]
  }
} as const

const TEAM_MENTALITIES = [
  'Very Defensive',
  'Defensive',
  'Balanced',
  'Attacking',
  'Very Attacking'
] as const

export function FormationVisualizer({ 
  open, 
  onClose, 
  players, 
  formation, 
  onFormationChange,
  onTacticsChange
}: FormationVisualizerProps) {
  const [selectedStyle, setSelectedStyle] = useState<keyof typeof PLAYING_STYLES>('possession')
  const [mentality, setMentality] = useState<typeof TEAM_MENTALITIES[number]>('Balanced')
  const starters = players.filter(p => !p.isSubstitute)
  const substitutes = players.filter(p => p.isSubstitute)

  const handleTacticsChange = (
    style: keyof typeof PLAYING_STYLES = selectedStyle,
    newMentality: typeof TEAM_MENTALITIES[number] = mentality
  ) => {
    setSelectedStyle(style)
    setMentality(newMentality)
    onTacticsChange?.({ playingStyle: style, mentality: newMentality })
  }

  const renderFormationPreview = (formationKey: string) => {
    const formationData = FORMATIONS[formationKey as keyof typeof FORMATIONS]
    if (!formationData) return null

    return (
      <div className="relative w-full h-[400px] bg-green-100 rounded-lg border-2 border-green-200">
        {/* Pitch markings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80%] h-[90%] border-2 border-green-300 rounded-lg" />
          <div className="absolute w-[40%] h-[30%] border-2 border-green-300 bottom-0" />
          <div className="absolute w-[40%] h-[30%] border-2 border-green-300 top-0" />
          <div className="absolute w-[15%] aspect-square rounded-full border-2 border-green-300" />
        </div>

        {/* Players */}
        {Object.entries(formationData.positions).map(([position, data]) => (
          data.coordinates.map((coord: Coordinate, idx: number) => {
            const player = starters.find(p => p.position === position)
            return (
              <div
                key={`${position}-${idx}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${coord[1]}%`, top: `${coord[0]}%` }}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-xs font-bold">
                    {player ? player.name.substring(0, 2) : '?'}
                  </div>
                  <span className="text-xs font-medium">{position.substring(0, 3)}</span>
                </div>
              </div>
            )
          })
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Team Tactics & Formation</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="formation" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formation">Formation</TabsTrigger>
            <TabsTrigger value="tactics">Tactics</TabsTrigger>
          </TabsList>

          <TabsContent value="formation" className="mt-4">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold">Select Formation</h3>
                <div className="space-y-2">
                  {Object.entries(FORMATIONS).map(([key, data]) => (
                    <Button
                      key={key}
                      variant={formation === key ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => onFormationChange(key)}
                    >
                      <div>
                        <p>{data.name}</p>
                        <p className="text-xs text-muted-foreground">{data.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="pt-4">
                  <h3 className="font-semibold mb-2">Substitutes</h3>
                  <div className="space-y-2">
                    {substitutes.map(player => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-muted-foreground">{player.position}</p>
                        </div>
                        <Badge variant="outline">Sub</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Formation Preview</h3>
                {renderFormationPreview(formation)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tactics" className="mt-4">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Playing Style</h3>
                  <div className="space-y-2">
                    {Object.entries(PLAYING_STYLES).map(([key, style]) => (
                      <Button
                        key={key}
                        variant={selectedStyle === key ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => handleTacticsChange(key as keyof typeof PLAYING_STYLES)}
                      >
                        <div className="flex items-center gap-2">
                          {style.icon}
                          <div>
                            <p>{style.name}</p>
                            <p className="text-xs text-muted-foreground">{style.description}</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Team Mentality</h3>
                  <Select 
                    value={mentality} 
                    onValueChange={(value) => handleTacticsChange(
                      selectedStyle, 
                      value as typeof TEAM_MENTALITIES[number]
                    )}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team mentality" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_MENTALITIES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Tactical Recommendations</h3>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {PLAYING_STYLES[selectedStyle].icon}
                        {PLAYING_STYLES[selectedStyle].name}
                      </CardTitle>
                      <CardDescription>
                        {PLAYING_STYLES[selectedStyle].description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {PLAYING_STYLES[selectedStyle].recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Current Setup</h3>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Formation:</span> {FORMATIONS[formation].name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Playing Style:</span> {PLAYING_STYLES[selectedStyle].name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Mentality:</span> {mentality}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 